use sqlx::SqlitePool;

use crate::shared::entities::{CollectiveId, EntryPathway};

pub async fn create_entry_pathway(
    record: EntryPathway,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "INSERT INTO entry_pathways (collective_id, name, email, interest, context, referral, conflict_experience, participant_connections) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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

pub async fn find_all_entry_pathways_for_collective(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<EntryPathway>, sqlx::Error> {
    let eois = sqlx::query_as!(
        EntryPathway,
        "SELECT id, collective_id, name, email, interest, context, referral, conflict_experience, participant_connections FROM entry_pathways WHERE collective_id = ?",
        collective_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(eois)
}
