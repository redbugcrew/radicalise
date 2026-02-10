use sqlx::SqlitePool;

use crate::shared::{
    entities::{CollectiveId, EventResponseExpectation, EventTemplate},
    links_repo::{find_all_links_for_owner_type, hash_links_by_owner, update_links_for_owner},
};

struct EventTemplateRow {
    id: i64,
    name: String,
    summary: String,
    response_expectation: EventResponseExpectation,
}

pub async fn insert_event_template_with_links(
    data: &EventTemplate,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<EventTemplate, sqlx::Error> {
    let rec = sqlx::query!(
        "
        INSERT INTO event_templates (name, collective_id, summary, response_expectation)
        VALUES (?, ?, ?, ?)
        RETURNING id, name
        ",
        data.name,
        collective_id.id,
        data.summary,
        data.response_expectation
    )
    .fetch_one(pool)
    .await?;

    let links = update_links_for_owner(
        rec.id,
        "event_templates".to_string(),
        data.links.clone(),
        pool,
    )
    .await?;

    Ok(EventTemplate {
        id: rec.id,
        name: rec.name,
        summary: data.summary.clone(),
        response_expectation: data.response_expectation.clone(),
        links: Some(links.unwrap_or_default()),
    })
}

pub async fn update_event_template_with_links(
    data: &EventTemplate,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<EventTemplate, sqlx::Error> {
    let rec = sqlx::query!(
        "
        UPDATE event_templates
        SET name = ?, summary = ?, response_expectation = ?
        WHERE id = ? AND collective_id = ?
        RETURNING id, name
        ",
        data.name,
        data.summary,
        data.response_expectation,
        data.id,
        collective_id.id
    )
    .fetch_one(pool)
    .await?;

    let links = update_links_for_owner(
        rec.id,
        "event_templates".to_string(),
        data.links.clone(),
        pool,
    )
    .await?;

    Ok(EventTemplate {
        links: Some(links.unwrap_or_default()),
        ..data.clone()
    })
}

pub async fn find_all_event_templates(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<EventTemplate>, sqlx::Error> {
    let rows = find_all_event_template_rows(collective_id, pool).await?;

    let links = find_all_links_for_owner_type("event_templates".to_string(), pool).await?;
    let links_hash = hash_links_by_owner(links);

    let event_templates: Vec<EventTemplate> = rows
        .into_iter()
        .map(|row| EventTemplate {
            id: row.id,
            name: row.name,
            summary: row.summary,
            response_expectation: row.response_expectation,
            links: Some(links_hash.get(&row.id).cloned().unwrap_or_else(Vec::new)),
        })
        .collect();

    Ok(event_templates)
}

async fn find_all_event_template_rows(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<EventTemplateRow>, sqlx::Error> {
    let rows = sqlx::query_as!(
        EventTemplateRow,
        "
        SELECT id, name, summary, response_expectation as \"response_expectation: EventResponseExpectation\"
        FROM event_templates
        WHERE collective_id = ?
        ORDER BY name
        ",
        collective_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}
