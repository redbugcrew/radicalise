use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::shared::{
    entities::{CollectiveId, EventTemplate, Link},
    links_repo::update_links_for_owner,
};

#[derive(Deserialize, ToSchema, Debug)]
pub struct EventTemplateCreationData {
    pub name: String,
    pub links: Option<Vec<Link>>,
}

pub async fn insert_event_template_with_links(
    data: &EventTemplateCreationData,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<EventTemplate, sqlx::Error> {
    let rec = sqlx::query!(
        "
        INSERT INTO event_templates (name, collective_id)
        VALUES (?, ?)
        RETURNING id, name
        ",
        data.name,
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
        id: rec.id,
        name: rec.name,
        links: Some(links.unwrap_or_default()),
    })
}
