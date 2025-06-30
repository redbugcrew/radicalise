use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::shared::entities::{
    CollectiveInvolvementWithDetails, InvolvementStatus, OptOutType, ParticipationIntention,
};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyInitialData {
    pub collective_involvements: Vec<CollectiveInvolvementWithDetails>,
}

pub async fn find_detailed_involvements(
    person_id: i64,
    collective_id: i64,
    start_interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CollectiveInvolvementWithDetails>, sqlx::Error> {
    sqlx::query_as!(
        CollectiveInvolvementWithDetails,
        "SELECT id, person_id, collective_id, interval_id, status as \"status: InvolvementStatus\",
        wellbeing, focus, capacity, participation_intention as \"participation_intention: ParticipationIntention\",
        opt_out_type as \"opt_out_type: OptOutType\", opt_out_planned_return_date
        FROM collective_involvements
        WHERE
            collective_id = ? AND
            person_id = ? AND
            interval_id >= ?",
        collective_id,
        person_id,
        start_interval_id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_initial_data_for_me(
    collective_id: i64,
    person_id: i64,
    current_interval_id: i64,
    pool: &SqlitePool,
) -> Result<MyInitialData, sqlx::Error> {
    let my_involvements =
        find_detailed_involvements(person_id, collective_id, current_interval_id, pool).await?;

    Ok(MyInitialData {
        collective_involvements: my_involvements,
    })
}
