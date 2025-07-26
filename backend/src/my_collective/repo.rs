use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::{
    crews::repo::find_all_crews_with_links,
    intervals::repo::{find_current_interval, find_next_interval},
    my_collective::involvements_repo::find_all_collective_involvements,
    people::repo::find_all_people,
    shared::{
        default_collective_id,
        entities::{
            Collective, CollectiveId, CollectiveInvolvement, CrewInvolvement, CrewWithLinks,
            Interval, IntervalId, Person,
        },
        links_repo::{find_all_links_for_owner, update_links_for_owner},
    },
};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct IntervalInvolvementData {
    pub interval_id: i64,
    pub collective_involvements: Vec<CollectiveInvolvement>,
    pub crew_involvements: Vec<CrewInvolvement>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct InvolvementData {
    pub current_interval: Option<IntervalInvolvementData>,
    pub next_interval: Option<IntervalInvolvementData>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct InitialData {
    pub collective: Collective,
    pub people: Vec<Person>,
    pub crews: Vec<CrewWithLinks>,
    pub intervals: Vec<Interval>,
    pub current_interval: Interval,
    pub involvements: InvolvementData,
}

pub async fn find_collective(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Collective, sqlx::Error> {
    sqlx::query!(
        "SELECT id, name, noun_name, description, slug, feature_eoi, eoi_description
        FROM collectives WHERE id = ?",
        collective_id.id
    )
    .fetch_one(pool)
    .await
    .map(|row| Collective {
        id: row.id,
        name: Some(row.name),
        noun_name: row.noun_name,
        description: row.description,
        links: vec![], // Links are not fetched here, assuming they are handled elsewhere
        slug: row.slug,
        feature_eoi: row.feature_eoi,
        eoi_description: row.eoi_description,
    })
}

pub async fn find_collective_by_slug(
    collective_slug: String,
    pool: &SqlitePool,
) -> Result<Collective, sqlx::Error> {
    sqlx::query!(
        "SELECT id, name, noun_name, description, slug, feature_eoi, eoi_description
        FROM collectives WHERE slug = ?",
        collective_slug
    )
    .fetch_one(pool)
    .await
    .map(|row| Collective {
        id: row.id,
        name: Some(row.name),
        noun_name: row.noun_name,
        description: row.description,
        links: vec![], // Links are not fetched here, assuming they are handled elsewhere
        slug: row.slug,
        feature_eoi: row.feature_eoi,
        eoi_description: row.eoi_description,
    })
}

pub async fn find_collective_with_links(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Collective, sqlx::Error> {
    let collective = find_collective(collective_id.clone(), pool).await?;
    let links = find_all_links_for_owner(collective_id.id, "collectives".to_string(), pool).await?;

    Ok(Collective {
        id: collective.id,
        name: collective.name,
        noun_name: collective.noun_name,
        description: collective.description,
        links,
        slug: collective.slug,
        feature_eoi: collective.feature_eoi,
        eoi_description: collective.eoi_description,
    })
}

pub async fn find_all_crew_involvements(
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT crew_involvements.id, person_id, crew_id, interval_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE
          interval_id = ?",
        interval_id.id
    )
    .fetch_all(pool)
    .await
}

async fn find_interval_involvement_data(
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<IntervalInvolvementData, sqlx::Error> {
    let collective_involvements =
        find_all_collective_involvements(default_collective_id(), interval_id.clone(), pool)
            .await?;
    let crew_involvements = find_all_crew_involvements(interval_id.clone(), pool).await?;

    Ok(IntervalInvolvementData {
        interval_id: interval_id.id,
        collective_involvements,
        crew_involvements,
    })
}

pub async fn find_initial_data_for_collective(
    collective: Collective,
    pool: &SqlitePool,
) -> Result<InitialData, sqlx::Error> {
    let people = find_all_people(collective.typed_id(), pool).await?;

    let crews = find_all_crews_with_links(collective.typed_id(), pool).await?;

    let intervals = sqlx::query_as!(
        Interval,
        "SELECT id, start_date, end_date FROM intervals WHERE collective_id = ?",
        collective.id
    )
    .fetch_all(pool)
    .await?;

    let current_interval = find_current_interval(collective.typed_id(), pool).await?;
    let current_interval_id = current_interval.typed_id().clone();
    let next_interval =
        find_next_interval(collective.typed_id(), current_interval_id.clone(), pool).await?;

    let current_interval_data =
        find_interval_involvement_data(current_interval_id.clone(), pool).await?;
    let next_interval_data = if let Some(interval) = next_interval {
        Some(find_interval_involvement_data(interval.typed_id(), pool).await?)
    } else {
        None
    };

    Ok(InitialData {
        collective,
        people,
        crews,
        intervals,
        current_interval,
        involvements: InvolvementData {
            current_interval: Some(current_interval_data),
            next_interval: next_interval_data,
        },
    })
}

pub async fn update_collective(
    input: Collective,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Collective, sqlx::Error> {
    sqlx::query!(
        "UPDATE collectives
         SET name = ?, noun_name = ?, description = ?, slug = ?, feature_eoi = ?, eoi_description = ?
         WHERE id = ?",
        input.name,
        input.noun_name,
        input.description,
        input.slug,
        input.feature_eoi,
        input.eoi_description,
        collective_id.id
    )
    .execute(pool)
    .await?;

    Ok(input)
}

pub async fn update_collective_with_links(
    input: Collective,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Collective, sqlx::Error> {
    let collective = update_collective(input, collective_id, pool).await?;
    let links = update_links_for_owner(
        collective.id,
        "collectives".to_string(),
        Some(collective.links),
        pool,
    )
    .await?;

    Ok(Collective {
        id: collective.id,
        name: collective.name,
        noun_name: collective.noun_name,
        description: collective.description,
        links: links.unwrap_or_default(),
        slug: collective.slug,
        feature_eoi: collective.feature_eoi,
        eoi_description: collective.eoi_description,
    })
}
