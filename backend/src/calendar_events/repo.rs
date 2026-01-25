use sqlx::SqlitePool;

use crate::shared::{
    entities::{CalendarEvent, CollectiveId},
    links_repo::{find_all_links_for_owner_type, hash_links_by_owner, update_links_for_owner},
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

pub struct CalendarEventRow {
    pub id: i64,
    pub event_template_id: i64,
    pub name: String,
    pub start_at: String,
    pub end_at: Option<String>,
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
            attendances: None,
        })
        .collect();

    Ok(calendar_events)
}

async fn list_calendar_event_rows(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<CalendarEventRow>, sqlx::Error> {
    let rows = sqlx::query_as!(
        CalendarEventRow,
        r#"
         SELECT
            id,
            event_template_id,
            name,
            start_at AS "start_at: String",
            end_at AS "end_at: String"
         FROM calendar_events
         WHERE collective_id = ?
         ORDER BY start_at ASC
         "#,
        collective_id.id,
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}
