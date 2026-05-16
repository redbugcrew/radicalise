use sqlx::SqlitePool;

use crate::{
    repo_utilities::InsertRecordError,
    shared::entities::{CircleId, CircleInvitation, CircleInvolvementId, PersonId},
};

pub async fn find_circle_invitation_by_email_and_circle_id(
    circle_id: CircleId,
    invitee_email: String,
    pool: &SqlitePool,
) -> Result<Option<CircleInvitation>, sqlx::Error> {
    sqlx::query_as::<_, CircleInvitation>(
        r#"
        SELECT * FROM circle_invitations
        WHERE circle_id = ?
            AND lower(invitee_email) = lower(?)"#,
    )
    .bind(circle_id.id)
    .bind(invitee_email)
    .fetch_optional(pool)
    .await
}

pub async fn find_circle_invitation_by_token(
    token: String,
    pool: &SqlitePool,
) -> Result<CircleInvitation, sqlx::Error> {
    let invitation = sqlx::query_as::<_, CircleInvitation>(
        r#"
        SELECT * FROM circle_invitations
        WHERE invitation_token = ?"#,
    )
    .bind(token)
    .fetch_one(pool)
    .await?;

    Ok(invitation)
}

pub async fn upsert_circle_invitation(
    circle_id: CircleId,
    person_id: PersonId,
    circle_involvement_id: CircleInvolvementId,
    invitee_email: String,
    message: Option<String>,
    invitation_token: String,
    expires_at: String,
    pool: &SqlitePool,
) -> Result<CircleInvitation, InsertRecordError> {
    let result = sqlx::query_as::<_, CircleInvitation>(
        r#"
        INSERT INTO circle_invitations (
            circle_id,
            person_id,
            circle_involvement_id,
            invitee_email,
            message,
            invitation_token,
            expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(circle_id, person_id) DO UPDATE SET
            invitee_email = excluded.invitee_email,
            message = excluded.message,
            expires_at = excluded.expires_at
        RETURNING *"#,
    )
    .bind(circle_id.id)
    .bind(person_id.id)
    .bind(circle_involvement_id.id)
    .bind(invitee_email)
    .bind(message)
    .bind(invitation_token)
    .bind(expires_at)
    .fetch_one(pool)
    .await?;

    Ok(result)
}

pub async fn update_circle_invitation_person_id(
    invitation_id: i64,
    person_id: PersonId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE circle_invitations SET person_id = ? WHERE id = ?",
        person_id.id,
        invitation_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn mark_circle_invitation_as_sent(
    invitation_id: i64,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        UPDATE circle_invitations
        SET sent_at = CURRENT_TIMESTAMP
        WHERE id = ?"#,
    )
    .bind(invitation_id)
    .execute(pool)
    .await?;

    Ok(())
}
