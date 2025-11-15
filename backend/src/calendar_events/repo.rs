use sqlx::SqlitePool;

use crate::shared::{
    entities::{CollectiveId, CalendarEvent},
    links_repo::{find_all_links_for_owner_type, hash_links_by_owner, update_links_for_owner},
};

struct CalendarEventRow {
    id: i64,
    name: String,
}

pub async fn insert_calendar_event_with_links(
    data: &CalendarEvent,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<CalendarEvent, sqlx::Error> {
    let rec = sqlx::query!(
        "
        INSERT INTO calendar_events (name, collective_id)
        VALUES (?, ?)
        RETURNING id
        ",
        data.name,
        collective_id.id
    )
    .fetch_one(pool)
    .await?;

    // let links = update_links_for_owner(
    //     rec.id,
    //     "calendar_event".to_string(),
    //     data.links.clone(),
    //     pool,
    // )
    // .await?;

    let mut result = data.clone();
    result.id = rec.id;
    Ok(result)

}

// pub async fn update_event_records_with_links(
//     data: &EventRecord,
//     collective_id: CollectiveId,
//     pool: &SqlitePool,
// ) -> Result<EventRecord, sqlx::Error> {
//     let rec = sqlx::query!(
//         "
//         UPDATE event_records
//         SET name = ?
//         WHERE id = ? AND collective_id = ?
//         RETURNING id, name
//         ",
//         data.name,
//         data.id,
//         collective_id.id
//     )
//     .fetch_one(pool)
//     .await?;

//     let links = update_links_for_owner(
//         rec.id,
//         "event_records".to_string(),
//         data.links.clone(),
//         pool,
//     )
//     .await?;

//     Ok(EventRecord {
//         id: rec.id,
//         name: rec.name,
//         links: Some(links.unwrap_or_default()),
//     })
// }

// pub async fn find_all_event_templates(
//     collective_id: CollectiveId,
//     pool: &SqlitePool,
// ) -> Result<Vec<EventTemplate>, sqlx::Error> {
//     let rows = find_all_event_template_rows(collective_id, pool).await?;

//     let links = find_all_links_for_owner_type("event_templates".to_string(), pool).await?;
//     let links_hash = hash_links_by_owner(links);

//     let event_templates: Vec<EventTemplate> = rows
//         .into_iter()
//         .map(|row| EventTemplate {
//             id: row.id,
//             name: row.name,
//             links: Some(links_hash.get(&row.id).cloned().unwrap_or_else(Vec::new)),
//         })
//         .collect();

//     Ok(event_templates)
// }

// async fn find_all_event_template_rows(
//     collective_id: CollectiveId,
//     pool: &SqlitePool,
// ) -> Result<Vec<EventTemplateRow>, sqlx::Error> {
//     let rows = sqlx::query_as!(
//         EventTemplateRow,
//         "
//         SELECT id, name
//         FROM event_templates
//         WHERE collective_id = ?
//         ORDER BY name
//         ",
//         collective_id.id
//     )
//     .fetch_all(pool)
//     .await?;

//     Ok(rows)
// }
