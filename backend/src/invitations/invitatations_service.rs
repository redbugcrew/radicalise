use chrono::{Duration, Utc};
use resend_rs::Resend;
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    circles::repo::find_circle_by_id,
    intervals::repo::find_current_interval,
    invitations::{
        circle_invitations_repo::{
            find_circle_invitation_by_email_and_circle_id, find_circle_invitation_by_token,
            mark_circle_invitation_as_sent, upsert_circle_invitation,
        },
        emails::{InvitedToCircleEmailParams, invited_to_circle_email},
    },
    my_project::involvements_repo::insert_circle_involvement_if_missing,
    people::repo::{find_person_by_id, find_person_by_user_id, insert_person_without_user},
    repo_utilities::InsertRecordError,
    shared::entities::{
        CircleId, CircleInvolvement, InvolvementStatus, Person, PersonId, ProjectId, UserId,
    },
};

const INVITATION_EXPIRATION_DAYS: i64 = 30;

#[derive(Deserialize, ToSchema, Debug)]
pub struct InvitePersonRequest {
    name: String,
    email: String,
    circle_id: i64,
    message: Option<String>,
}

pub struct InvitePersonResult {
    pub person: Person,
    pub circle_involvement: CircleInvolvement,
}

#[derive(Debug)]
pub enum InvitePersonError {
    ContextInvalid,
    InputInvalid,
    DatabaseError,
    EmailError,
}

fn db_err<E: std::fmt::Debug>(e: E) -> InvitePersonError {
    eprintln!("Database error: {:?}", e);
    InvitePersonError::DatabaseError
}

fn ctx_err<E: std::fmt::Debug>(e: E) -> InvitePersonError {
    eprintln!("Context error: {:?}", e);
    InvitePersonError::ContextInvalid
}

pub async fn invite_person(
    pool: &SqlitePool,
    resend: &Resend,
    input: &InvitePersonRequest,
    inviting_user_id: UserId,
    project_id: ProjectId,
) -> Result<InvitePersonResult, InvitePersonError> {
    // Find the inviting person
    println!(
        "Finding inviting person for user_id: {:?}",
        inviting_user_id
    );
    let inviting_person = find_person_by_user_id(inviting_user_id, project_id.clone(), pool)
        .await
        .map_err(ctx_err)?
        .ok_or(InvitePersonError::ContextInvalid)?;

    // Find the circle
    println!("Finding circle with id: {:?}", input.circle_id);
    let circle = find_circle_by_id(CircleId::new(input.circle_id), &pool)
        .await
        .map_err(ctx_err)?;

    // Find the current interval
    println!("Finding current interval for project_id: {:?}", project_id);
    let current_interval = find_current_interval(project_id.clone(), &pool)
        .await
        .map_err(ctx_err)?;

    // Load the invitation if we already have one, so that we can update it instead of creating a duplicate if the same person is invited again to the same circle
    println!(
        "Looking up existing invitation for email: {:?}, circle_id: {:?}",
        input.email, input.circle_id
    );
    let existing_invitation = find_circle_invitation_by_email_and_circle_id(
        CircleId::new(circle.id),
        input.email.clone(),
        pool,
    )
    .await
    .map_err(db_err)?;

    let person = match existing_invitation {
        Some(invitation) => find_person_by_id(
            PersonId::new(invitation.person_id),
            project_id.clone(),
            pool,
        )
        .await
        .map_err(db_err)?,
        None => insert_person_without_user(project_id.clone(), input.name.clone(), &pool)
            .await
            .map_err(|err| match err {
                InsertRecordError::RecordAlreadyExists => InvitePersonError::InputInvalid,
                InsertRecordError::DatabaseError => db_err(err),
            })?,
    };

    println!("Created person: {:?}", person);

    // Create the circle involvement
    println!(
        "Inserting circle involvement for person_id: {:?}, circle_id: {:?}",
        person.id, circle.id
    );
    let new_involvement = CircleInvolvement {
        person_id: person.id,
        circle_id: circle.id,
        interval_id: current_interval.id,
        status: InvolvementStatus::Invited,
        ..Default::default()
    };
    let _involvement_record =
        insert_circle_involvement_if_missing(new_involvement.clone().into(), &pool)
            .await
            .map_err(|err| match err {
                InsertRecordError::RecordAlreadyExists => InvitePersonError::InputInvalid,
                InsertRecordError::DatabaseError => db_err(err),
            })?;

    // Create the circle invitation
    println!(
        "Upserting circle invitation for person_id: {:?}, circle_id: {:?}",
        person.id, circle.id
    );
    let invitation_token = Uuid::new_v4().to_string();
    let expires_at = (chrono::Utc::now() + Duration::days(INVITATION_EXPIRATION_DAYS)).to_rfc3339();
    let circle_invitation = upsert_circle_invitation(
        CircleId::new(circle.id),
        PersonId::new(person.id),
        input.email.clone(),
        input.message.clone(),
        invitation_token,
        expires_at,
        pool,
    )
    .await
    .map_err(db_err)?;

    println!("Created circle invitation: {:?}", circle_invitation);

    // Send invitation email
    println!("Sending invitation email to: {:?}", input.email);
    let email = invited_to_circle_email(
        input.email.clone(),
        InvitedToCircleEmailParams {
            invitation_id: circle_invitation.id,
            invitation_token: circle_invitation.invitation_token.clone(),
            invitee_name: input.name.clone(),
            inviter_name: inviting_person.display_name.clone(),
            project_name: Some(circle.name.clone()),
            message: input.message.clone(),
        },
    );
    resend.emails.send(email).await.map_err(|err| {
        eprintln!("Error sending invitation email: {:?}", err);
        InvitePersonError::EmailError
    })?;

    // Mark the invitation as sent
    println!("Marking invitation {:?} as sent", circle_invitation.id);
    mark_circle_invitation_as_sent(circle_invitation.id, pool)
        .await
        .map_err(db_err)?;

    Ok(InvitePersonResult {
        person,
        circle_involvement: new_involvement,
    })
}

#[derive(Debug)]
pub enum AcceptInvitationError {
    InvitationExpired,
    DatabaseError,
}

pub async fn accept_invitation(
    pool: &SqlitePool,
    token: String,
    accepting_user_id: UserId,
) -> Result<(), AcceptInvitationError> {
    // Find and check the invitation
    let invitation = find_circle_invitation_by_token(token, pool)
        .await
        .map_err(handle_accept_database_error)?;

    if invitation.has_expired(Utc::now()) {
        return Err(AcceptInvitationError::InvitationExpired);
    }

    // Find the circle for this invitation
    let circle = find_circle_by_id(CircleId::new(invitation.circle_id), pool)
        .await
        .map_err(handle_accept_database_error)?;

    // Find the existing person for this user in the project, if any
    let _person = find_person_by_user_id(
        accepting_user_id.clone(),
        ProjectId::new(circle.project_id),
        pool,
    )
    .await
    .map_err(handle_accept_database_error)?;

    Ok(())
}

fn handle_accept_database_error(err: sqlx::Error) -> AcceptInvitationError {
    eprintln!("Database error: {:?}", err);
    AcceptInvitationError::DatabaseError
}
