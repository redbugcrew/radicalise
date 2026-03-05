use sqlx::SqlitePool;

use crate::shared::entities::{EntryPathway, ExpressionOfInterest, ProjectId};

pub async fn create_eoi(
    record: ExpressionOfInterest,
    auth_token: String,
    pool: &SqlitePool,
) -> Result<EntryPathway, sqlx::Error> {
    let result = sqlx::query!(
        "INSERT INTO entry_pathways (project_id, name, email, interest, context, referral, conflict_experience, participant_connections, auth_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        record.project_id,
        record.name,
        record.email,
        record.interest,
        record.context,
        record.referral,
        record.conflict_experience,
        record.participant_connections,
        auth_token
    )
    .execute(pool)
    .await?;

    return find_entry_pathway(result.last_insert_rowid(), pool).await;
}

pub async fn update_eoi(
    record: ExpressionOfInterest,
    pool: &SqlitePool,
) -> Result<EntryPathway, sqlx::Error> {
    sqlx::query!(
        "UPDATE entry_pathways
        SET name = ?, email = ?, interest = ?, context = ?, referral = ?, conflict_experience = ?, participant_connections = ?
        WHERE id = ?",
        record.name,
        record.email,
        record.interest,
        record.context,
        record.referral,
        record.conflict_experience,
        record.participant_connections,
        record.id
    )
    .execute(pool)
    .await?;

    return find_entry_pathway(record.id, pool).await;
}

pub async fn delete_eoi_record(
    pool: &SqlitePool,
    auth_token: String,
    collective_id: ProjectId,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "DELETE FROM entry_pathways
        WHERE auth_token = ? AND project_id = ?",
        auth_token,
        collective_id.id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn find_entry_pathway(id: i64, pool: &SqlitePool) -> Result<EntryPathway, sqlx::Error> {
    let entry_pathway = sqlx::query_as!(
        EntryPathway,
        "SELECT id, project_id, name, interest, context, referral, conflict_experience, participant_connections
        FROM entry_pathways
        WHERE id = ?",
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(entry_pathway)
}

pub async fn find_eoi_by_auth_token(
    collective_id: ProjectId,
    auth_token: &str,
    pool: &SqlitePool,
) -> Result<Option<ExpressionOfInterest>, sqlx::Error> {
    sqlx::query_as!(
        ExpressionOfInterest,
        "SELECT id, project_id, name, interest, context, referral, email, conflict_experience, participant_connections
        FROM entry_pathways
        WHERE auth_token = ? AND project_id = ?",
        auth_token,
        collective_id.id
    )
    .fetch_optional(pool)
    .await
}

pub async fn find_all_entry_pathways_for_project(
    collective_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<EntryPathway>, sqlx::Error> {
    let eois = sqlx::query_as!(
        EntryPathway,
        "SELECT id, project_id, name, interest, context, referral, conflict_experience, participant_connections FROM entry_pathways WHERE project_id = ?",
        collective_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(eois)
}
