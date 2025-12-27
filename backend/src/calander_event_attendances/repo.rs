use sqlx::SqlitePool;

pub async fn upsert_event_attendance(
    calendar_event_id: i64,
    intention: String,
    user_id: i64,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let result = sqlx::query!(
        "INSERT INTO calendar_event_attendances (user_id, calendar_event_id, intention)
        VALUES (?, ?, ?)",
        user_id,
        calendar_event_id,
        intention
    )
    .execute(pool)
    .await?;
    Ok(())
}
