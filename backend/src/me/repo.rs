use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::shared::{
    entities::{
        CollectiveInvolvementWithDetails, InvolvementStatus, OptOutType, ParticipationIntention,
    },
    repo::{find_current_interval, find_next_interval},
};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyIntervalData {
    pub interval_id: i64,
    pub collective_involvement: Option<CollectiveInvolvementWithDetails>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyInitialData {
    current: Option<MyIntervalData>,
    next: Option<MyIntervalData>,
}

pub async fn find_detailed_involvement(
    collective_id: i64,
    person_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Option<CollectiveInvolvementWithDetails>, sqlx::Error> {
    sqlx::query_as!(
        CollectiveInvolvementWithDetails,
        "SELECT id, person_id, collective_id, interval_id, status as \"status: InvolvementStatus\",
        wellbeing, focus, capacity, participation_intention as \"participation_intention: ParticipationIntention\",
        opt_out_type as \"opt_out_type: OptOutType\", opt_out_planned_return_date
        FROM collective_involvements
        WHERE
            collective_id = ? AND
            person_id = ? AND
            interval_id = ?",
        collective_id,
        person_id,
        interval_id,
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

pub async fn find_initial_interval_data_for_me(
    collective_id: i64,
    person_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<MyIntervalData, sqlx::Error> {
    let involvement =
        find_detailed_involvement(collective_id, person_id, interval_id, pool).await?;

    Ok(MyIntervalData {
        interval_id,
        collective_involvement: involvement,
    })
}

pub async fn find_initial_data_for_me(
    collective_id: i64,
    person_id: i64,
    pool: &SqlitePool,
) -> Result<MyInitialData, sqlx::Error> {
    let current_interval = find_current_interval(collective_id, pool).await?;
    let next_interval = find_next_interval(collective_id, current_interval.id, pool).await?;

    let current =
        find_initial_interval_data_for_me(collective_id, person_id, current_interval.id, pool)
            .await?;
    let next =
        find_initial_interval_data_for_me(collective_id, person_id, next_interval.id, pool).await?;

    Ok(MyInitialData {
        current: Some(current),
        next: Some(next),
    })
}
