use sqlx::SqlitePool;

use crate::shared::entities::{
    CollectiveInvolvement, InvolvementStatus, OptOutType, ParticipationIntention,
};

#[derive(Debug, Clone)]
pub struct CollectiveInvolvementRecord {
    pub id: i64,
    pub person_id: i64,
    pub collective_id: i64,
    pub interval_id: i64,
    pub status: InvolvementStatus,
    pub private_capacity_planning: bool,
    pub wellbeing: Option<String>,
    pub focus: Option<String>,
    pub capacity: Option<String>,
    pub capacity_score: Option<i64>,
    pub participation_intention: Option<ParticipationIntention>,
    pub opt_out_type: Option<OptOutType>,
    pub opt_out_planned_return_date: Option<String>,
    pub intention_context: Option<String>,
}

impl From<CollectiveInvolvementRecord> for CollectiveInvolvement {
    fn from(record: CollectiveInvolvementRecord) -> Self {
        CollectiveInvolvement {
            id: record.id,
            person_id: record.person_id,
            collective_id: record.collective_id,
            interval_id: record.interval_id,
            status: record.status,
            private_capacity_planning: record.private_capacity_planning,
            capacity_planning: Some(crate::shared::entities::CapacityPlanning {
                wellbeing: record.wellbeing,
                focus: record.focus,
                capacity: record.capacity,
            }),
            capacity_score: record.capacity_score,
            participation_intention: record.participation_intention,
            opt_out_type: record.opt_out_type,
            opt_out_planned_return_date: record.opt_out_planned_return_date,
            intention_context: record.intention_context,
        }
    }
}

impl From<CollectiveInvolvement> for CollectiveInvolvementRecord {
    fn from(involvement: CollectiveInvolvement) -> Self {
        CollectiveInvolvementRecord {
            id: involvement.id,
            person_id: involvement.person_id,
            collective_id: involvement.collective_id,
            interval_id: involvement.interval_id,
            status: involvement.status,
            private_capacity_planning: involvement.private_capacity_planning,
            wellbeing: involvement
                .capacity_planning
                .as_ref()
                .and_then(|cp| cp.wellbeing.clone()),
            focus: involvement
                .capacity_planning
                .as_ref()
                .and_then(|cp| cp.focus.clone()),
            capacity: involvement
                .capacity_planning
                .as_ref()
                .and_then(|cp| cp.capacity.clone()),
            capacity_score: involvement.capacity_score,
            participation_intention: involvement.participation_intention,
            opt_out_type: involvement.opt_out_type,
            opt_out_planned_return_date: involvement.opt_out_planned_return_date,
            intention_context: involvement.intention_context,
        }
    }
}

pub async fn find_collective_involvement(
    collective_id: i64,
    person_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Option<CollectiveInvolvement>, sqlx::Error> {
    let record: Option<CollectiveInvolvementRecord> = sqlx::query_as!(
        CollectiveInvolvementRecord,
        "SELECT id, person_id, collective_id, interval_id,
        status as \"status: InvolvementStatus\", private_capacity_planning,
        wellbeing, focus, capacity_score, capacity,
        participation_intention as \"participation_intention: ParticipationIntention\",
        opt_out_type as \"opt_out_type: OptOutType\", opt_out_planned_return_date,
        intention_context
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
    .await?;

    Ok(record.map(Into::into))
}

pub async fn find_all_collective_involvements(
    collective_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CollectiveInvolvement>, sqlx::Error> {
    let records = sqlx::query_as!(
        CollectiveInvolvementRecord,
        "SELECT id, person_id, collective_id, interval_id,
        status as \"status: InvolvementStatus\", private_capacity_planning,
        wellbeing, focus, capacity_score, capacity,
        participation_intention as \"participation_intention: ParticipationIntention\",
        opt_out_type as \"opt_out_type: OptOutType\", opt_out_planned_return_date,
        intention_context
        FROM collective_involvements
        WHERE
            collective_id = ? AND
            interval_id = ?",
        collective_id,
        interval_id,
    )
    .fetch_all(pool)
    .await?;

    Ok(records.into_iter().map(Into::into).collect())
}

pub async fn upsert_collective_involvement(
    involvement: CollectiveInvolvementRecord,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let result = sqlx::query!(
        "INSERT INTO collective_involvements (person_id, collective_id, interval_id, status, private_capacity_planning, wellbeing, focus, capacity_score, capacity, participation_intention, opt_out_type, opt_out_planned_return_date,
        intention_context)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(person_id, collective_id, interval_id) DO UPDATE SET
            status = excluded.status,
            private_capacity_planning = excluded.private_capacity_planning,
            wellbeing = excluded.wellbeing,
            focus = excluded.focus,
            capacity_score = excluded.capacity_score,
            capacity = excluded.capacity,
            participation_intention = excluded.participation_intention,
            opt_out_type = excluded.opt_out_type,
            opt_out_planned_return_date = excluded.opt_out_planned_return_date,
            intention_context = excluded.intention_context",
        involvement.person_id,
        involvement.collective_id,
        involvement.interval_id,
        involvement.status,
        involvement.private_capacity_planning,
        involvement.wellbeing,
        involvement.focus,
        involvement.capacity_score,
        involvement.capacity,
        involvement.participation_intention,
        involvement.opt_out_type,
        involvement.opt_out_planned_return_date,
        involvement.intention_context
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    } else {
        Ok(())
    }
}
