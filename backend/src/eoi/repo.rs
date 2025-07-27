use sqlx::SqlitePool;

use crate::shared::entities::{CollectiveId, Eoi};

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

pub async fn find_all_eois_for_collective(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<Eoi>, sqlx::Error> {
    let eois = sqlx::query_as!(
        Eoi,
        "SELECT id, collective_id, name, email, interest, context, referral, conflict_experience, participant_connections FROM eoi WHERE collective_id = ?",
        collective_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(eois)
}
