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
            mark_circle_invitation_as_sent, update_circle_invitation_person_id,
            upsert_circle_invitation,
        },
        emails::{InvitedToCircleEmailParams, invited_to_circle_email},
    },
    my_project::involvements_repo::{
        delete_circle_involvement_by_id, find_circle_involvement_by_id, insert_circle_involvement,
        insert_circle_involvement_if_missing, update_involvement_status,
    },
    people::repo::{
        delete_person, find_person_by_id, find_person_by_user_id, insert_person_without_user,
        update_person_user_id,
    },
    repo_utilities::InsertRecordError,
    shared::entities::{
        CircleId, CircleInvitation, CircleInvolvement, CircleInvolvementId, Interval,
        InvolvementStatus, Person, PersonId, ProjectId, UserId,
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
        Some(invitation) => find_person_by_id(PersonId::new(invitation.person_id), pool)
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
        CircleInvolvementId::new(new_involvement.id),
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
    let mut context =
        load_accept_invitation_context(token, accepting_user_id.clone(), pool).await?;

    let data_changed = reconcile_person(
        &context.user_person,
        &context.invitation_person,
        accepting_user_id.clone(),
        &context.invitation,
        pool,
    )
    .await?;

    context = match data_changed {
        true => {
            load_accept_invitation_context(
                context.invitation.invitation_token.clone(),
                accepting_user_id.clone(),
                pool,
            )
            .await?
        }
        false => context,
    };

    reconcile_involvement(
        context
            .invitation
            .circle_involvement_id
            .map(CircleInvolvementId::new),
        CircleId::new(context.invitation.circle_id),
        &context.current_interval,
        &context.invitation_person,
        pool,
    )
    .await?;

    Ok(())
}

struct AcceptInvitationContext {
    invitation: CircleInvitation,
    current_interval: Interval,
    user_person: Option<Person>,
    invitation_person: Person,
}

async fn load_accept_invitation_context(
    token: String,
    accepting_user_id: UserId,
    pool: &SqlitePool,
) -> Result<AcceptInvitationContext, AcceptInvitationError> {
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

    // Find the current interval for the project
    let current_interval = find_current_interval(ProjectId::new(circle.project_id), pool)
        .await
        .map_err(handle_accept_database_error)?;

    // Find the existing person for this user in the project, if any
    let user_person =
        find_person_by_user_id(accepting_user_id, ProjectId::new(circle.project_id), pool)
            .await
            .map_err(handle_accept_database_error)?;

    // Find the person for the invitation
    let invitation_person = find_person_by_id(PersonId::new(invitation.person_id), pool)
        .await
        .map_err(handle_accept_database_error)?;

    Ok(AcceptInvitationContext {
        invitation,
        current_interval,
        user_person,
        invitation_person,
    })
}

async fn reconcile_person(
    user_person: &Option<Person>,
    invitation_person: &Person,
    accepting_user_id: UserId,
    invitation: &CircleInvitation,
    pool: &SqlitePool,
) -> Result<bool, AcceptInvitationError> {
    match user_person {
        Some(user_person) if user_person.id == invitation_person.id => Ok(false),
        Some(user_person) => {
            delete_person(PersonId::new(invitation_person.id), pool)
                .await
                .map_err(handle_accept_database_error)?;
            update_circle_invitation_person_id(invitation.id, PersonId::new(user_person.id), pool)
                .await
                .map_err(handle_accept_database_error)?;
            Ok(true)
        }
        None => {
            update_person_user_id(PersonId::new(invitation_person.id), accepting_user_id, pool)
                .await
                .map_err(handle_accept_database_error)?;
            Ok(true)
        }
    }
}

async fn reconcile_involvement(
    circle_involvement_id: Option<CircleInvolvementId>,
    circle_id: CircleId,
    current_interval: &Interval,
    person: &Person,
    pool: &SqlitePool,
) -> Result<(), AcceptInvitationError> {
    let mut maybe_involvement: Option<CircleInvolvement> = match circle_involvement_id {
        Some(id) => Some(
            find_circle_involvement_by_id(id, pool)
                .await
                .map_err(handle_accept_database_error)?,
        ),
        None => None,
    };

    // If involvement is now for the wrong person, delete it
    maybe_involvement = match maybe_involvement {
        Some(inv) if inv.person_id != person.id => {
            println!(
                "Involvement person_id {:?} does not match accepting person_id {:?}, deleting involvement",
                inv.person_id, person.id
            );
            delete_circle_involvement_by_id(CircleInvolvementId::new(inv.id), pool)
                .await
                .map_err(handle_accept_database_error)?;
            None
        }
        Some(inv) => Some(inv),
        None => None,
    };

    // If involvement is for the wrong interval, don't delete it, just clear the local var
    maybe_involvement = match maybe_involvement {
        Some(inv) if inv.interval_id != current_interval.id => {
            println!(
                "Involvement interval_id {:?} does not match current interval_id {:?}, ignoring involvement",
                inv.interval_id, current_interval.id
            );
            None
        }
        Some(inv) => Some(inv),
        None => None,
    };

    // If we don't have an involvement at this point, create one
    let involvement = match maybe_involvement {
        Some(inv) => inv,
        None => insert_circle_involvement(
            CircleInvolvement {
                person_id: person.id,
                circle_id: circle_id.id,
                interval_id: current_interval.id,
                status: InvolvementStatus::Onboarding,
                ..Default::default()
            }
            .into(),
            pool,
        )
        .await
        .map_err(|err| {
            eprintln!("Database error: {:?}", err);
            AcceptInvitationError::DatabaseError
        })?
        .into(),
    };

    // If our involvement is Invited or Exiting, move it to Onboarding
    match involvement.status {
        InvolvementStatus::Invited | InvolvementStatus::Exiting => {
            println!(
                "Updating involvement status from {:?} to Onboarding",
                involvement.status
            );
            update_involvement_status(involvement.typed_id(), InvolvementStatus::Onboarding, pool)
                .await
                .map_err(handle_accept_database_error)?;
            CircleInvolvement {
                status: InvolvementStatus::Onboarding,
                ..involvement
            }
        }
        _ => involvement,
    };

    Ok(())
}

fn handle_accept_database_error(err: sqlx::Error) -> AcceptInvitationError {
    eprintln!("Database error: {:?}", err);
    AcceptInvitationError::DatabaseError
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;

    async fn setup_db() -> SqlitePool {
        let pool = SqlitePoolOptions::new()
            .connect("sqlite::memory:")
            .await
            .expect("Failed to create in-memory database");
        sqlx::migrate!()
            .run(&pool)
            .await
            .expect("Failed to run migrations");
        pool
    }

    #[tokio::test]
    async fn invite_person_with_no_inviting_user_returns_error() {
        let pool = setup_db().await;
        let resend = Resend::default();
        let input = InvitePersonRequest {
            name: "Test Invitee".to_string(),
            email: "invitee@example.com".to_string(),
            circle_id: 1,
            message: None,
        };
        let result = invite_person(&pool, &resend, &input, UserId::new(1), ProjectId::new(1)).await;
        assert!(matches!(result, Err(InvitePersonError::ContextInvalid)));
    }

    #[tokio::test]
    async fn accept_invitation_with_invalid_token_returns_error() {
        let pool = setup_db().await;
        let result = accept_invitation(&pool, "dummy-token".to_string(), UserId::new(1)).await;
        assert!(result.is_err());
    }
}
