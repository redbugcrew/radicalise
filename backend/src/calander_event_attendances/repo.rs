use crate::shared::entities::{AttendanceIntention, PersonId};
use sqlx::SqlitePool;

pub async fn upsert_event_attendance(
    calendar_event_id: i64,
    intention: Option<AttendanceIntention>,
    person_id: PersonId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "INSERT INTO calendar_event_attendances (person_id, calendar_event_id, intention)
        VALUES (?, ?, ?)
        ON CONFLICT(person_id, calendar_event_id) DO UPDATE SET
            intention = excluded.intention",
        person_id.id,
        calendar_event_id,
        intention
    )
    .execute(pool)
    .await?;
    Ok(())
}
