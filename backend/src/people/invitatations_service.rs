use chrono::Duration;
use resend_rs::Resend;
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    auth::auth_repo::AuthRepo,
    circles::repo::find_circle_by_id,
    intervals::repo::find_current_interval,
    my_project::involvements_repo::insert_circle_involvement_if_missing,
    people::{
        circle_invitations_repo::{insert_circle_invitation, mark_circle_invitation_as_sent},
        emails::{InvitedToCircleEmailParams, invited_to_circle_email},
        repo::{find_or_insert_person, find_person_by_user_id},
    },
    repo_utilities::InsertRecordError,
    shared::entities::{
        CircleId, CircleInvolvement, InvolvementStatus, PersonId, ProjectId, UserId,
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

#[derive(Debug)]
pub enum InvitePersonError {
    ContextInvalid,
    InputInvalid,
    DatabaseError,
    EmailError,
}

pub async fn invite_person(
    pool: &SqlitePool,
    resend: &Resend,
    input: &InvitePersonRequest,
    inviting_user_id: UserId,
    project_id: ProjectId,
) -> Result<(), InvitePersonError> {
    match invite_person_inner(pool, resend, input, inviting_user_id, project_id).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("Error inviting person: {:?}", err);
            Err(err)
        }
    }
}

async fn invite_person_inner(
    pool: &SqlitePool,
    resend: &Resend,
    input: &InvitePersonRequest,
    inviting_user_id: UserId,
    project_id: ProjectId,
) -> Result<(), InvitePersonError> {
    // Find the inviting person
    let inviting_person = find_person_by_user_id(inviting_user_id, project_id.clone(), pool)
        .await
        .map_err(|_| InvitePersonError::ContextInvalid)?;

    // Find the circle
    let circle = find_circle_by_id(CircleId::new(input.circle_id), project_id.clone(), &pool)
        .await
        .map_err(|_| InvitePersonError::ContextInvalid)?;

    // Find the current interval
    let current_interval = find_current_interval(project_id.clone(), &pool)
        .await
        .map_err(|_| InvitePersonError::ContextInvalid)?;

    // Create user if they don't already exist
    let auth_repo = AuthRepo::new(&pool);
    let auth_user = auth_repo
        .upsert_user(input.email.clone())
        .await
        .map_err(|_| InvitePersonError::DatabaseError)?;

    println!("Auth user: {:?}", (auth_user.id, auth_user.email));

    // Create the person
    let person = find_or_insert_person(
        project_id.clone(),
        UserId::new(auth_user.id),
        input.name.clone(),
        &pool,
    )
    .await
    .map_err(|err| match err {
        InsertRecordError::RecordAlreadyExists => InvitePersonError::InputInvalid,
        InsertRecordError::DatabaseError => InvitePersonError::DatabaseError,
    })?;

    println!("Created person: {:?}", person);

    // Create the circle involvement
    let new_involvement = CircleInvolvement {
        person_id: person.id,
        circle_id: circle.id,
        interval_id: current_interval.id,
        status: InvolvementStatus::Invited,
        ..Default::default()
    };
    let _involvement_record = insert_circle_involvement_if_missing(new_involvement.into(), &pool)
        .await
        .map_err(|err| match err {
            InsertRecordError::RecordAlreadyExists => InvitePersonError::InputInvalid,
            InsertRecordError::DatabaseError => InvitePersonError::DatabaseError,
        })?;

    // Create the circle invitation
    let invitation_token = Uuid::new_v4().to_string();
    let expires_at = (chrono::Utc::now() + Duration::days(INVITATION_EXPIRATION_DAYS)).to_rfc3339();
    let circle_invitation = insert_circle_invitation(
        CircleId::new(circle.id),
        PersonId::new(person.id),
        input.email.clone(),
        input.message.clone(),
        invitation_token,
        expires_at,
        pool,
    )
    .await
    .map_err(|_| InvitePersonError::DatabaseError)?;

    println!("Created circle invitation: {:?}", circle_invitation);

    // Send invitation email
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
    mark_circle_invitation_as_sent(circle_invitation.id, pool)
        .await
        .map_err(|_| InvitePersonError::DatabaseError)?;

    Ok(())
}
