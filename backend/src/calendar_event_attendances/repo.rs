use std::collections::HashMap;

use crate::shared::entities::{
    AttendanceIntention, CalendarEvent, CalendarEventAttendance, PersonId,
};
use sqlx::{QueryBuilder, Row, Sqlite, SqlitePool};

pub async fn upsert_event_attendance(
    calendar_event_id: i64,
    intention: Option<AttendanceIntention>,
    person_id: PersonId,
    pool: &SqlitePool,
) -> Result<CalendarEventAttendance, sqlx::Error> {
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

    let calendar_event =
        find_event_attendance_by_person_and_event(calendar_event_id, person_id, pool).await?;

    match calendar_event {
        None => Err(sqlx::Error::RowNotFound),
        Some(attendance) => Ok(attendance),
    }
}

pub async fn find_event_attendance_by_person_and_event(
    calendar_event_id: i64,
    person_id: PersonId,
    pool: &SqlitePool,
) -> Result<Option<CalendarEventAttendance>, sqlx::Error> {
    let result = sqlx::query_as!(
        CalendarEventAttendance,
        "SELECT
            id, person_id, calendar_event_id, intention as \"intention: AttendanceIntention\",
            actual
        FROM calendar_event_attendances
        WHERE person_id = ? AND calendar_event_id = ?",
        person_id.id,
        calendar_event_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(result)
}

pub async fn attendances_for_calendar_events(
    events: &Vec<CalendarEvent>,
    pool: &SqlitePool,
) -> Result<Vec<CalendarEventAttendance>, sqlx::Error> {
    let event_ids: Vec<i64> = events.iter().map(|e| e.id).collect();

    let mut query_builder: QueryBuilder<Sqlite> = QueryBuilder::new(
        "SELECT
            id, person_id, calendar_event_id,
            intention, actual
        FROM calendar_event_attendances
        WHERE
        calendar_event_id IN (",
    );
    let mut separated = query_builder.separated(", ");
    for value_type in event_ids.iter() {
        separated.push_bind(value_type);
    }
    separated.push_unseparated(") ");

    let rows = query_builder.build().fetch_all(pool).await?;

    let attendances = rows
        .into_iter()
        .map(|row| CalendarEventAttendance {
            id: row.get::<i64, _>("id"),
            person_id: row.get::<i64, _>("person_id"),
            calendar_event_id: row.get::<i64, _>("calendar_event_id"),
            intention: row.get::<Option<AttendanceIntention>, _>("intention"),
            actual: row.get::<Option<bool>, _>("actual"),
        })
        .collect::<Vec<CalendarEventAttendance>>();

    Ok(attendances)
}

pub fn hash_attendances_by_event(
    attendances: Vec<CalendarEventAttendance>,
) -> HashMap<i64, Vec<CalendarEventAttendance>> {
    let mut attendances_hash: HashMap<i64, Vec<CalendarEventAttendance>> = HashMap::new();

    for attendance in attendances {
        attendances_hash
            .entry(attendance.calendar_event_id)
            .or_insert_with(Vec::new)
            .push(attendance);
    }

    attendances_hash
}
