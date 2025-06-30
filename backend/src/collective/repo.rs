use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::shared::{
    COLLECTIVE_ID,
    entities::{
        Collective, CollectiveInvolvement, CollectiveInvolvementWithDetails, Crew, CrewInvolvement,
        Interval, InvolvementStatus, OptOutType, ParticipationIntention, Person,
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

pub async fn find_detailed_involvement(
    interval_id: i64,
    person_id: i64,
    pool: &SqlitePool,
) -> Result<Option<CollectiveInvolvementWithDetails>, sqlx::Error> {
    sqlx::query_as!(
        CollectiveInvolvementWithDetails,
        "SELECT id, person_id, collective_id, interval_id, status as \"status: InvolvementStatus\",
        wellbeing, focus, capacity, participation_intention as \"participation_intention: ParticipationIntention\",
        opt_out_type as \"opt_out_type: OptOutType\", opt_out_planned_return_date
        FROM collective_involvements
        WHERE
            interval_id = ? AND
            person_id = ?",
        interval_id,
        person_id
    )
    .fetch_optional(pool)
    .await
}

pub async fn upsert_detailed_involvement(
    involvement: CollectiveInvolvementWithDetails,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let result = sqlx::query!(
        "INSERT INTO collective_involvements (person_id, collective_id, interval_id, status, wellbeing, focus, capacity, participation_intention, opt_out_type, opt_out_planned_return_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(person_id, collective_id, interval_id) DO UPDATE SET
            status = excluded.status,
            wellbeing = excluded.wellbeing,
            focus = excluded.focus,
            capacity = excluded.capacity,
            participation_intention = excluded.participation_intention,
            opt_out_type = excluded.opt_out_type,
            opt_out_planned_return_date = excluded.opt_out_planned_return_date",
        involvement.person_id,
        involvement.collective_id,
        involvement.interval_id,
        involvement.status,
        involvement.wellbeing,
        involvement.focus,
        involvement.capacity,
        involvement.participation_intention,
        involvement.opt_out_type,
        involvement.opt_out_planned_return_date
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    } else {
        Ok(())
    }
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
