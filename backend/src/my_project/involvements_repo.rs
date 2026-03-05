use sqlx::SqlitePool;

use crate::shared::entities::{
    CircleId, CircleInvolvement, IntervalId, InvolvementStatus, OptOutType, ParticipationIntention,
    PersonId, ProjectId,
};

#[derive(Debug, Clone)]
pub struct CircleInvolvementRecord {
    pub id: i64,
    pub person_id: i64,
    pub project_id: i64,
    pub circle_id: i64,
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
    pub implicit_counter: i64,
}

impl From<CircleInvolvementRecord> for CircleInvolvement {
    fn from(record: CircleInvolvementRecord) -> Self {
        CircleInvolvement {
            id: record.id,
            person_id: record.person_id,
            project_id: record.project_id,
            circle_id: record.circle_id,
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
            implicit_counter: record.implicit_counter,
        }
    }
}

impl From<CircleInvolvement> for CircleInvolvementRecord {
    fn from(involvement: CircleInvolvement) -> Self {
        CircleInvolvementRecord {
            id: involvement.id,
            person_id: involvement.person_id,
            project_id: involvement.project_id,
            circle_id: involvement.circle_id,
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
            implicit_counter: involvement.implicit_counter,
        }
    }
}

pub async fn find_circle_involvement(
    project_id: ProjectId,
    circle_id: CircleId,
    person_id: PersonId,
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<Option<CircleInvolvement>, sqlx::Error> {
    let record: Option<CircleInvolvementRecord> = sqlx::query_as!(
        CircleInvolvementRecord,
        "SELECT
            circle_involvements.id AS id,
            person_id,
            circles.project_id AS \"project_id: i64\",
            circle_id,
            interval_id,
            status as \"status: InvolvementStatus\",
            private_capacity_planning,
            wellbeing,
            focus,
            capacity_score,
            capacity,
            participation_intention as \"participation_intention: ParticipationIntention\",
            opt_out_type as \"opt_out_type: OptOutType\", opt_out_planned_return_date,
            intention_context,
            implicit_counter
        FROM circle_involvements
        INNER JOIN circles ON circle_involvements.circle_id = circles.id
        WHERE
            circles.project_id = ? AND
            circle_involvements.id = ? AND
            person_id = ? AND
            interval_id = ?",
        project_id.id,
        circle_id.id,
        person_id.id,
        interval_id.id,
    )
    .fetch_optional(pool)
    .await?;

    Ok(record.map(Into::into))
}

pub async fn find_all_circle_involvements(
    project_id: ProjectId,
    circle_id: CircleId,
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<Vec<CircleInvolvement>, sqlx::Error> {
    let records = sqlx::query_as!(
        CircleInvolvementRecord,
        "SELECT
            circle_involvements.id AS id,
            person_id,
            circles.project_id AS \"project_id: i64\",
            circle_id,
            interval_id,
            status as \"status: InvolvementStatus\",
            private_capacity_planning,
            wellbeing,
            focus,
            capacity_score,
            capacity,
            participation_intention as \"participation_intention: ParticipationIntention\",
            opt_out_type as \"opt_out_type: OptOutType\",
            opt_out_planned_return_date,
            intention_context,
            implicit_counter
        FROM circle_involvements
        INNER JOIN circles ON circle_involvements.circle_id = circles.id
        WHERE
            project_id = ? AND
            circle_involvements.id = ? AND
            interval_id = ?",
        project_id.id,
        circle_id.id,
        interval_id.id,
    )
    .fetch_all(pool)
    .await?;

    Ok(records.into_iter().map(Into::into).collect())
}

pub async fn upsert_project_involvement(
    involvement: CircleInvolvementRecord,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let result = sqlx::query!(
        "INSERT INTO project_involvements (person_id, project_id, interval_id, status, private_capacity_planning, wellbeing, focus, capacity_score, capacity, participation_intention, opt_out_type, opt_out_planned_return_date,
        intention_context)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(person_id, project_id, interval_id) DO UPDATE SET
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
        involvement.project_id,
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

pub async fn insert_project_involvement_if_missing(
    involvement: CircleInvolvementRecord,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "INSERT INTO project_involvements (person_id, project_id, interval_id, status, private_capacity_planning, wellbeing, focus, capacity_score, capacity, participation_intention, opt_out_type, opt_out_planned_return_date,
        intention_context, implicit_counter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(person_id, project_id, interval_id) DO NOTHING",
        involvement.person_id,
        involvement.project_id,
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
        involvement.intention_context,
        involvement.implicit_counter
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn delete_implicit_project_involvements(
    project_id: ProjectId,
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "DELETE FROM project_involvements
        WHERE
            interval_id = ? AND
            project_id = ? AND
            participation_intention IS NULL",
        interval_id.id,
        project_id.id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn set_implicit_counter_to_zero(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE project_involvements
        SET implicit_counter = 0
        WHERE
            project_id = ?",
        project_id.id
    )
    .execute(pool)
    .await?;

    Ok(())
}
