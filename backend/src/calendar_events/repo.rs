use sqlx::SqlitePool;

use crate::{
    calendar_event_attendances::repo::{
        attendances_for_calendar_events, hash_attendances_by_event,
    },
    shared::{
        entities::{
            CalendarEvent, CalendarEventId, CollectiveId, EventResponseExpectation, PersonId,
        },
        links_repo::{find_all_links_for_owner_type, hash_links_by_owner, update_links_for_owner},
    },
};

pub async fn insert_calendar_event_with_links(
    data: &CalendarEvent,
    event_template_id: i64,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<CalendarEvent, sqlx::Error> {
    let rec = sqlx::query!(
        "
        INSERT INTO calendar_events (event_template_id, name, start_at, end_at, collective_id)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
        ",
        event_template_id,
        data.name,
        data.start_at,
        data.end_at,
        collective_id.id
    )
    .fetch_one(pool)
    .await?;

    let links = update_links_for_owner(
        rec.id,
        "calendar_event".to_string(),
        data.links.clone(),
        pool,
    )
    .await?;

    let mut result = data.clone();
    result.id = rec.id;
    result.links = links;
    Ok(result)
}

pub async fn update_calendar_event_with_links(
    event_id: CalendarEventId,
    data: &CalendarEvent,
    event_template_id: i64,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<CalendarEvent, sqlx::Error> {
    sqlx::query!(
        "
        UPDATE calendar_events
        SET event_template_id = ?, name = ?, start_at = ?, end_at = ?
        WHERE id = ? AND collective_id = ?
        ",
        event_template_id,
        data.name,
        data.start_at,
        data.end_at,
        event_id.id,
        collective_id.id
    )
    .execute(pool)
    .await?;

    let links = update_links_for_owner(
        event_id.id,
        "calendar_event".to_string(),
        data.links.clone(),
        pool,
    )
    .await?;

    let mut result = data.clone();
    result.links = links;
    Ok(result)
}

pub struct CalendarEventRow {
    pub id: i64,
    pub event_template_id: i64,
    pub name: String,
    pub start_at: String,
    pub end_at: Option<String>,
    pub response_expectation: EventResponseExpectation,
}

pub async fn list_calendar_events_with_attendances(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<CalendarEvent>, sqlx::Error> {
    let without_attendances = list_calendar_events(collective_id.clone(), pool).await?;
    let attendances = attendances_for_calendar_events(&without_attendances, pool).await?;
    let attendances_hash = hash_attendances_by_event(attendances);

    let with_attendances = without_attendances
        .into_iter()
        .map(|event| CalendarEvent {
            attendances: attendances_hash.get(&event.id).cloned().or_else(|| None),
            ..event
        })
        .collect::<Vec<CalendarEvent>>();

    Ok(with_attendances)
}

pub async fn list_calendar_events(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<CalendarEvent>, sqlx::Error> {
    let rows = list_calendar_event_rows(collective_id, pool).await?;

    let links = find_all_links_for_owner_type("calendar_event".to_string(), pool).await?;
    let links_hash = hash_links_by_owner(links);

    let calendar_events: Vec<CalendarEvent> = rows
        .into_iter()
        .map(|row| CalendarEvent {
            id: row.id,
            name: row.name,
            event_template_id: row.event_template_id,
            start_at: row.start_at,
            end_at: row.end_at,
            links: Some(links_hash.get(&row.id).cloned().unwrap_or_else(Vec::new)),
            response_expectation: row.response_expectation,
            attendances: None,
        })
        .collect();

    Ok(calendar_events)
}

pub async fn list_calendar_events_person_attending(
    collective_id: CollectiveId,
    person_id: PersonId,
    pool: &SqlitePool,
) -> Result<Vec<CalendarEvent>, sqlx::Error> {
    let rows = list_calendar_event_rows_person_attending(collective_id, person_id, pool).await?;

    let calendar_events: Vec<CalendarEvent> = rows
        .into_iter()
        .map(|row| CalendarEvent {
            id: row.id,
            name: row.name,
            event_template_id: row.event_template_id,
            start_at: row.start_at,
            end_at: row.end_at,
            links: None,
            response_expectation: row.response_expectation,
            attendances: None,
        })
        .collect();

    Ok(calendar_events)
}

async fn list_calendar_event_rows_person_attending(
    collective_id: CollectiveId,
    person_id: PersonId,
    pool: &SqlitePool,
) -> Result<Vec<CalendarEventRow>, sqlx::Error> {
    let rows = sqlx::query_as!(
        CalendarEventRow,
        r#"
         SELECT
            e.id,
            e.event_template_id,
            e.name,
            e.start_at AS "start_at: String",
            e.end_at AS "end_at: String",
            t.response_expectation AS "response_expectation: EventResponseExpectation"
         FROM calendar_events AS e
         INNER JOIN event_templates AS t ON e.event_template_id = t.id
         INNER JOIN calendar_event_attendances AS a ON e.id = a.calendar_event_id
         WHERE
            e.collective_id = ? AND
            a.person_id = ? AND
            (a.intention = 'Going' OR a.intention = 'Uncertain')
         ORDER BY e.start_at ASC
         "#,
        collective_id.id,
        person_id.id,
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

async fn list_calendar_event_rows(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<CalendarEventRow>, sqlx::Error> {
    let rows = sqlx::query_as!(
        CalendarEventRow,
        r#"
         SELECT
            e.id,
            e.event_template_id,
            e.name,
            e.start_at AS "start_at: String",
            e.end_at AS "end_at: String",
            t.response_expectation AS "response_expectation: EventResponseExpectation"
         FROM calendar_events AS e
         INNER JOIN event_templates AS t ON e.event_template_id = t.id
         WHERE e.collective_id = ?
         ORDER BY e.start_at ASC
         "#,
        collective_id.id,
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}
