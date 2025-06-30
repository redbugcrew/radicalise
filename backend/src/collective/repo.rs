use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::shared::{
    COLLECTIVE_ID,
    entities::{
        Collective, CollectiveInvolvement, Crew, CrewInvolvement, Interval, InvolvementStatus,
        Person,
    },
    repo::find_current_interval,
};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct IntervalInvolvementData {
    pub collective_involvements: Vec<CollectiveInvolvement>,
    pub crew_involvements: Vec<CrewInvolvement>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct InitialData {
    pub collective: Collective,
    pub people: Vec<Person>,
    pub crews: Vec<Crew>,
    pub intervals: Vec<Interval>,
    pub current_interval: Interval,
    pub involvements: IntervalInvolvementData,
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
        "SELECT crew_involvements.id, person_id, crew_id, interval_id, status as \"status: InvolvementStatus\"
        FROM crew_involvements
        WHERE
          interval_id = ?",
        interval_id
    )
    .fetch_all(pool)
    .await
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

    let collective_involvements =
        find_all_collective_involvements(current_interval.id, pool).await?;
    let crew_involvements = find_all_crew_involvements(current_interval.id, pool).await?;

    Ok(InitialData {
        collective,
        people,
        crews,
        intervals,
        current_interval,
        involvements: IntervalInvolvementData {
            collective_involvements,
            crew_involvements,
        },
    })
}
