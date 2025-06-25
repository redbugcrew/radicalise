use sqlx::SqlitePool;

use crate::entities::{
    CollectiveInvolvement, CollectiveInvolvementWithDetails, CrewInvolvement, InvolvementStatus,
    OptOutType, ParticipationIntention,
};

pub const COLLECTIVE_ID: i64 = 1;

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
