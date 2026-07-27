use sqlx::SqlitePool;

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
