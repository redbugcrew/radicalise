use sqlx::SqlitePool;

use crate::shared::entities::{IntervalId, PeerEnrollment, PersonId};

pub async fn upsert_peer_enrollments(
    interval_id: i64,
    peer_role_id: i64,
    edges: Vec<(i64, i64)>,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "DELETE FROM peer_enrollments WHERE interval_id = ? AND peer_role_id = ?",
        interval_id,
        peer_role_id
    )
    .execute(&mut *transaction)
    .await?;

    for (person_id, peer_id) in edges {
        sqlx::query!(
            "INSERT INTO peer_enrollments (peer_role_id, interval_id, person_id, peer_id)
            VALUES (?, ?, ?, ?)",
            peer_role_id,
            interval_id,
            person_id,
            peer_id
        )
        .execute(&mut *transaction)
        .await?;
    }

    transaction.commit().await?;

    Ok(())
}

pub async fn find_peer_enrollments_for_interval(
    interval_id: &IntervalId,
    pool: &SqlitePool,
) -> Result<Vec<PeerEnrollment>, sqlx::Error> {
    let enrollments = sqlx::query_as!(
        PeerEnrollment,
        "SELECT * FROM peer_enrollments WHERE interval_id = ?",
        interval_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(enrollments)
}

pub async fn find_peer_enrollments_for_interval_and_person(
    interval_id: &IntervalId,
    person_id: &PersonId,
    pool: &SqlitePool,
) -> Result<Vec<PeerEnrollment>, sqlx::Error> {
    let enrollments = sqlx::query_as!(
        PeerEnrollment,
        "SELECT * FROM peer_enrollments WHERE interval_id = ? AND (person_id = ? OR peer_id = ?)",
        interval_id.id,
        person_id.id,
        person_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(enrollments)
}
