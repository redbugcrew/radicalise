

// pub async fn event_attendance_status(
//     calendar_event_id: CalendarEventId,
//     user_id: UserId,
//     intention: AttendanceStatus,
//     pool: &SqlitePool,
// ) -> Result<(), sqlx::Error> {
//     let result = sqlx::query!(
//         "INSERT INTO calendar_event_attendances (calendar_event_id, user_id, intention)
//         VALUES (?, ?, ?)",
//         calendar_event_id,
//         user_id,
//         intention
// )
//     Ok(())
// }