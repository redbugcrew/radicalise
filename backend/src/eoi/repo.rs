use sqlx::SqlitePool;

use crate::shared::entities::Eoi;

pub async fn create_eoi(record: Eoi, pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "INSERT INTO eoi (collective_id, name, email, interest, context, referral, conflict_experience, participant_connections) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        record.collective_id,
        record.name,
        record.email,
        record.interest,
        record.context,
        record.referral,
        record.conflict_experience,
        record.participant_connections
    )
    .execute(pool)
    .await?;
    Ok(())
}
