use sqlx::SqlitePool;

pub async fn upsert_event_attendance(
    calendar_event_id: i64,
    intention: String,
    user_id: i64,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "INSERT INTO calendar_event_attendances (user_id, calendar_event_id, intention)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, calendar_event_id) DO UPDATE SET
            intention = excluded.intention",
        user_id,
        calendar_event_id,
        intention
    )
    .execute(pool)
    .await?;
    Ok(())
}
