use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::shared::{
    COLLECTIVE_ID,
    entities::{
        Collective, CollectiveInvolvement, Crew, CrewInvolvement, Interval, InvolvementStatus,
        Person,
    },
    repo::{find_current_interval, find_next_interval},
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
    pub crews: Vec<Crew>,
    pub intervals: Vec<Interval>,
    pub current_interval: Interval,
    pub involvements: InvolvementData,
}

pub async fn find_collective(
    collective_id: i64,
    pool: &SqlitePool,
) -> Result<Collective, sqlx::Error> {
    sqlx::query_as!(
        Collective,
        "SELECT id, name, description FROM collectives WHERE id = ?",
        collective_id
    )
    .fetch_one(pool)
    .await
}

pub async fn find_all_collective_involvements(
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CollectiveInvolvement>, sqlx::Error> {
    let collective_id = COLLECTIVE_ID;

    sqlx::query_as!(
        CollectiveInvolvement,
        "SELECT id, person_id, collective_id, interval_id, status as \"status: InvolvementStatus\"
        FROM collective_involvements
        WHERE
          interval_id = ? AND
          collective_id = ?",
        interval_id,
        collective_id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_all_crew_involvements(
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT crew_involvements.id, person_id, crew_id, interval_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE
          interval_id = ?",
        interval_id
    )
    .fetch_all(pool)
    .await
}

async fn find_interval_involvement_data(
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<IntervalInvolvementData, sqlx::Error> {
    let collective_involvements = find_all_collective_involvements(interval_id, pool).await?;
    let crew_involvements = find_all_crew_involvements(interval_id, pool).await?;

    Ok(IntervalInvolvementData {
        interval_id,
        collective_involvements,
        crew_involvements,
    })
}

pub async fn find_initial_data_for_collective(
    collective: Collective,
    pool: &SqlitePool,
) -> Result<InitialData, sqlx::Error> {
    let people = sqlx::query_as!(Person, "SELECT id, display_name FROM people")
        .fetch_all(pool)
        .await?;

    let crews = sqlx::query_as!(Crew, "SELECT id, name, description FROM crews")
        .fetch_all(pool)
        .await?;

    let intervals = sqlx::query_as!(
        Interval,
        "SELECT id, start_date, end_date FROM intervals WHERE collective_id = ?",
        collective.id
    )
    .fetch_all(pool)
    .await?;

    let current_interval = find_current_interval(collective.id, pool).await?;
    let current_interval_id = current_interval.id.clone();
    let next_interval = find_next_interval(collective.id, current_interval_id, pool).await?;

    let current_interval_data = find_interval_involvement_data(current_interval_id, pool).await?;
    let next_interval_data = if let Some(interval) = next_interval {
        Some(find_interval_involvement_data(interval.id, pool).await?)
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
