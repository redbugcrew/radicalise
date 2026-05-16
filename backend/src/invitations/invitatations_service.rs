use chrono::{Duration, Utc};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::my_project::repo::find_project;
use crate::shared::email_sender::EmailSender;
use crate::{
    circles::repo::find_circle_by_id,
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
        update_involvement_status,
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
    email_sender: &impl EmailSender,
    input: &InvitePersonRequest,
    inviting_user_id: UserId,
    project_id: ProjectId,
    interval: Interval,
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

    // Find the project
    println!("Finding project with id: {:?}", project_id);
    let project = find_project(project_id.clone(), pool)
        .await
        .map_err(ctx_err)?;

    // Find the circle
    println!("Finding circle with id: {:?}", input.circle_id);
    let circle = find_circle_by_id(CircleId::new(input.circle_id), &pool)
        .await
        .map_err(ctx_err)?;

    let current_interval = interval;

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
    let involvement_record = insert_circle_involvement(new_involvement.clone().into(), &pool)
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
        CircleInvolvementId::new(involvement_record.id),
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
            project_slug: project.slug.clone().unwrap_or("unknown".to_string()),
            invitation_token: circle_invitation.invitation_token.clone(),
            invitee_name: input.name.clone(),
            inviter_name: inviting_person.display_name.clone(),
            project_name: Some(circle.name.clone()),
            message: input.message.clone(),
        },
    );
    email_sender.send_email(email).await.map_err(|err| {
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
    interval: Interval,
) -> Result<(), AcceptInvitationError> {
    let mut context =
        load_accept_invitation_context(token, accepting_user_id.clone(), interval, pool).await?;

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
                context.current_interval.clone(),
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
    interval: Interval,
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

    let current_interval = interval;

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
            update_circle_invitation_person_id(invitation.id, PersonId::new(user_person.id), pool)
                .await
                .map_err(handle_accept_database_error)?;
            delete_person(PersonId::new(invitation_person.id), pool)
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
        Some(id) => match find_circle_involvement_by_id(id, pool).await {
            Ok(involvement) => Some(involvement),
            // The invitation may still point to an involvement that was removed when the
            // placeholder invited person was reconciled away.
            Err(sqlx::Error::RowNotFound) => None,
            Err(err) => return Err(handle_accept_database_error(err)),
        },
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
    use crate::shared::email_sender::test_helpers::MockEmailSender;
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

        sqlx::query!(
            "INSERT INTO users (email, hashed_password) VALUES ('test@example.com', 'hashed')"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test user");
        sqlx::query!(
            "INSERT INTO people (display_name, project_id, user_id) VALUES ('Test Inviter', 1, 1)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test person");
        sqlx::query!(
            "INSERT INTO intervals (id, start_date, end_date, project_id) VALUES (1, date('now', '-1 day'), date('now', '+30 days'), 1)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test interval");
        pool
    }

    fn interval_1() -> Interval {
        Interval {
            id: 1,
            start_date: "2026-01-01".to_string(),
            end_date: "2026-03-31".to_string(),
        }
    }

    #[tokio::test]
    async fn invite_new_person() {
        let pool = setup_db().await;
        let email_sender = MockEmailSender::new();
        let input = InvitePersonRequest {
            name: "Test Invitee".to_string(),
            email: "invitee@example.com".to_string(),
            circle_id: 1,
            message: None,
        };
        let result = invite_person(
            &pool,
            &email_sender,
            &input,
            UserId::new(1),
            ProjectId::new(1),
            interval_1(),
        )
        .await;
        assert!(result.is_ok());
        assert_eq!(email_sender.sent_emails.lock().unwrap().len(), 1);
    }

    #[tokio::test]
    async fn accept_invitation_with_invalid_token_returns_error() {
        let pool = setup_db().await;
        let result = accept_invitation(
            &pool,
            "dummy-token".to_string(),
            UserId::new(1),
            interval_1(),
        )
        .await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn invite_person_then_signup_and_accept_invitation() {
        let pool = setup_db().await;
        let email_sender = MockEmailSender::new();
        let input = InvitePersonRequest {
            name: "Test Invitee".to_string(),
            email: "invitee@example.com".to_string(),
            circle_id: 1,
            message: None,
        };

        // Invite the person
        let invite_result = invite_person(
            &pool,
            &email_sender,
            &input,
            UserId::new(1),
            ProjectId::new(1),
            interval_1(),
        )
        .await;
        assert!(
            invite_result.is_ok(),
            "invite_person failed: {:?}",
            invite_result.err()
        );
        assert_eq!(email_sender.sent_emails.lock().unwrap().len(), 1);

        // Simulate signup: create a user with the same email as the invitee
        sqlx::query!(
            "INSERT INTO users (email, hashed_password) VALUES ('invitee@example.com', 'hashed')"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert invitee user");

        let new_user = sqlx::query!("SELECT id FROM users WHERE email = 'invitee@example.com'")
            .fetch_one(&pool)
            .await
            .expect("Failed to find new user");

        // Retrieve the invitation token
        let invitation_row = sqlx::query!(
            "SELECT invitation_token FROM circle_invitations WHERE invitee_email = 'invitee@example.com'"
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to find circle invitation");
        let invitation_token = invitation_row.invitation_token;

        // Accept the invitation as the newly signed-up user
        let accept_result = accept_invitation(
            &pool,
            invitation_token,
            UserId::new(new_user.id),
            interval_1(),
        )
        .await;
        assert!(
            accept_result.is_ok(),
            "accept_invitation failed: {:?}",
            accept_result.err()
        );

        // Verify the person record is linked to the new user
        let person_row = sqlx::query!(
            "SELECT id, user_id FROM people WHERE user_id = ?",
            new_user.id
        )
        .fetch_one(&pool)
        .await
        .expect("No person record found for the new user");

        // Verify a circle_involvement exists for this person in the correct circle and current interval, in Onboarding status
        let involvement_row = sqlx::query!(
            "SELECT ci.status FROM circle_involvements ci
             JOIN intervals i ON ci.interval_id = i.id
             WHERE ci.person_id = ?
               AND ci.circle_id = 1
               AND i.start_date <= date('now')
               AND i.end_date >= date('now')",
            person_row.id
        )
        .fetch_one(&pool)
        .await
        .expect("No circle_involvement found for the accepted person in the current interval");

        assert_eq!(
            involvement_row.status, "Onboarding",
            "Expected involvement status to be Onboarding, got {:?}",
            involvement_row.status
        );
    }

    #[tokio::test]
    async fn invite_in_interval_1_then_accept_in_interval_2() {
        let pool = setup_db().await;
        let email_sender = MockEmailSender::new();
        let input = InvitePersonRequest {
            name: "Test Invitee".to_string(),
            email: "invitee@example.com".to_string(),
            circle_id: 1,
            message: None,
        };

        // Insert interval 2
        sqlx::query!(
            "INSERT INTO intervals (id, start_date, end_date, project_id) VALUES (2, '2026-04-01', '2026-06-30', 1)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert interval 2");

        let interval_2 = Interval {
            id: 2,
            start_date: "2026-04-01".to_string(),
            end_date: "2026-06-30".to_string(),
        };

        // Invite the person in interval 1
        let invite_result = invite_person(
            &pool,
            &email_sender,
            &input,
            UserId::new(1),
            ProjectId::new(1),
            interval_1(),
        )
        .await;
        assert!(
            invite_result.is_ok(),
            "invite_person failed: {:?}",
            invite_result.err()
        );

        // Simulate signup: create a user with the same email as the invitee
        sqlx::query!(
            "INSERT INTO users (email, hashed_password) VALUES ('invitee@example.com', 'hashed')"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert invitee user");

        let new_user = sqlx::query!("SELECT id FROM users WHERE email = 'invitee@example.com'")
            .fetch_one(&pool)
            .await
            .expect("Failed to find new user");

        // Retrieve the invitation token
        let invitation_row = sqlx::query!(
            "SELECT invitation_token FROM circle_invitations WHERE invitee_email = 'invitee@example.com'"
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to find circle invitation");
        let invitation_token = invitation_row.invitation_token;

        // Accept the invitation as the newly signed-up user, but in interval 2
        let accept_result = accept_invitation(
            &pool,
            invitation_token,
            UserId::new(new_user.id),
            interval_2,
        )
        .await;
        assert!(
            accept_result.is_ok(),
            "accept_invitation failed: {:?}",
            accept_result.err()
        );

        // Verify the person record is linked to the new user
        let person_row = sqlx::query!(
            "SELECT id, user_id FROM people WHERE user_id = ?",
            new_user.id
        )
        .fetch_one(&pool)
        .await
        .expect("No person record found for the new user");

        // Verify a circle_involvement exists in interval 2 for this person, in Onboarding status
        let involvement_row = sqlx::query!(
            "SELECT ci.status FROM circle_involvements ci
             WHERE ci.person_id = ?
               AND ci.circle_id = 1
               AND ci.interval_id = 2",
            person_row.id
        )
        .fetch_one(&pool)
        .await
        .expect("No circle_involvement found for the accepted person in interval 2");

        assert_eq!(
            involvement_row.status, "Onboarding",
            "Expected involvement status to be Onboarding in interval 2, got {:?}",
            involvement_row.status
        );
    }

    #[tokio::test]
    async fn accepting_user_with_existing_person_and_different_email_gets_involvement() {
        let pool = setup_db().await;
        let email_sender = MockEmailSender::new();

        // Create the accepter user and their existing person in project 1.
        sqlx::query!(
            "INSERT INTO users (email, hashed_password) VALUES ('accepter@example.com', 'hashed')"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert accepter user");

        let accepter_user =
            sqlx::query!("SELECT id FROM users WHERE email = 'accepter@example.com'")
                .fetch_one(&pool)
                .await
                .expect("Failed to find accepter user");

        sqlx::query!(
            "INSERT INTO people (display_name, project_id, user_id) VALUES ('Existing Accepter Person', 1, ?)",
            accepter_user.id
        )
        .execute(&pool)
        .await
        .expect("Failed to insert accepter person");

        let accepter_person =
            sqlx::query!("SELECT id FROM people WHERE user_id = ?", accepter_user.id)
                .fetch_one(&pool)
                .await
                .expect("Failed to find accepter person");

        // Invite a different email into circle 1.
        let input = InvitePersonRequest {
            name: "Invited Placeholder Person".to_string(),
            email: "invitee@example.com".to_string(),
            circle_id: 1,
            message: None,
        };

        let invite_result = invite_person(
            &pool,
            &email_sender,
            &input,
            UserId::new(1),
            ProjectId::new(1),
            interval_1(),
        )
        .await;
        assert!(
            invite_result.is_ok(),
            "invite_person failed: {:?}",
            invite_result.err()
        );

        // Capture the placeholder person created by invitation flow.
        let invitation_row = sqlx::query!(
            "SELECT id, person_id, invitation_token FROM circle_invitations WHERE invitee_email = 'invitee@example.com'"
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to find circle invitation");
        let placeholder_person_id = invitation_row.person_id;

        // Accept with the existing accepter user (different email from invitation).
        let accept_result = accept_invitation(
            &pool,
            invitation_row.invitation_token,
            UserId::new(accepter_user.id),
            interval_1(),
        )
        .await;
        assert!(
            accept_result.is_ok(),
            "accept_invitation failed: {:?}",
            accept_result.err()
        );

        // Invitation should now point at the accepter's existing person.
        let updated_invitation = sqlx::query!(
            "SELECT person_id FROM circle_invitations WHERE id = ?",
            invitation_row.id
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to refetch circle invitation");
        assert_eq!(
            updated_invitation.person_id, accepter_person.id,
            "Expected invitation person_id to be moved to accepter person"
        );

        // Placeholder person should be deleted during reconciliation.
        let placeholder_person =
            sqlx::query!("SELECT id FROM people WHERE id = ?", placeholder_person_id)
                .fetch_optional(&pool)
                .await
                .expect("Failed to check placeholder person");
        assert!(
            placeholder_person.is_none(),
            "Expected placeholder invited person to be deleted"
        );

        // The accepter should now have an onboarding involvement in circle 1, interval 1.
        let accepter_involvement = sqlx::query!(
            "SELECT status FROM circle_involvements WHERE person_id = ? AND circle_id = 1 AND interval_id = 1",
            accepter_person.id
        )
        .fetch_one(&pool)
        .await
        .expect("Expected accepter person to have a circle involvement after acceptance");
        assert_eq!(
            accepter_involvement.status, "Onboarding",
            "Expected accepter involvement status to be Onboarding"
        );

        // No involvement should remain for the deleted placeholder person.
        let placeholder_involvements = sqlx::query!(
            "SELECT COUNT(*) as count FROM circle_involvements WHERE person_id = ?",
            placeholder_person_id
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to count placeholder involvements");
        assert_eq!(
            placeholder_involvements.count, 0,
            "Expected no circle involvements to remain for placeholder person"
        );
    }
}
