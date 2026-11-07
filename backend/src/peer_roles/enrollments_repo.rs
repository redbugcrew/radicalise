use sqlx::SqlitePool;

use crate::{
    peer_roles::algorithms::{IntervalsAgo, MatchHistory},
    shared::entities::{IntervalNumber, PeerEnrollment, PeerRoleId, PersonId},
};

pub async fn upsert_peer_enrollments(
    interval_number: IntervalNumber,
    peer_role_id: PeerRoleId,
    edges: Vec<(i64, i64)>,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "DELETE FROM peer_enrollments
        WHERE interval_number = ? AND project_id = ? AND peer_role_id = ?",
        interval_number.number,
        interval_number.project_id.id,
        peer_role_id.id
    )
    .execute(&mut *transaction)
    .await?;

    for (person_id, peer_id) in edges {
        sqlx::query!(
            "INSERT INTO peer_enrollments (peer_role_id, interval_number, project_id, person_id, peer_id)
            VALUES (?, ?, ?, ?, ?)",
            peer_role_id.id,
            interval_number.number,
            interval_number.project_id.id,
            person_id,
            peer_id
        )
        .execute(&mut *transaction)
        .await?;
    }

    transaction.commit().await?;

    Ok(())
}

pub async fn load_match_history(
    peer_role_id: PeerRoleId,
    current_interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<MatchHistory<i64>, sqlx::Error> {
    let rows = sqlx::query!(
        r#"
        SELECT person_id AS "person_id!: i64", peer_id AS "peer_id!: i64", MAX(interval_number) AS "last_interval!: i64"
        FROM peer_enrollments
        WHERE peer_role_id = ?
        GROUP BY person_id, peer_id
        "#,
        peer_role_id.id
    )
    .fetch_all(pool)
    .await?;

    let mut history: MatchHistory<i64> = MatchHistory::new();
    for row in rows {
        let intervals_ago = IntervalsAgo(current_interval_number.number - row.last_interval);
        history.record(row.person_id, row.peer_id, intervals_ago);
    }

    Ok(history)
}

pub async fn find_peer_enrollments_for_interval(
    interval_number: &IntervalNumber,
    pool: &SqlitePool,
) -> Result<Vec<PeerEnrollment>, sqlx::Error> {
    let enrollments = sqlx::query_as!(
        PeerEnrollment,
        "SELECT * FROM peer_enrollments
        WHERE interval_number = ? AND project_id = ?",
        interval_number.number,
        interval_number.project_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(enrollments)
}

pub async fn find_peer_enrollments_for_interval_and_person(
    interval_number: &IntervalNumber,
    person_id: &PersonId,
    pool: &SqlitePool,
) -> Result<Vec<PeerEnrollment>, sqlx::Error> {
    let enrollments = sqlx::query_as!(
        PeerEnrollment,
        "SELECT * FROM peer_enrollments WHERE interval_number = ? AND project_id = ? AND (person_id = ? OR peer_id = ?)",
        interval_number.number,
        interval_number.project_id.id,
        person_id.id,
        person_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(enrollments)
}
