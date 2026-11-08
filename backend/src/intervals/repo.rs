use crate::{
    crews::repo::copy_crew_states_into_interval,
    shared::entities::{Interval, IntervalNumber, ProjectId},
};
use chrono::NaiveDate;
use sqlx::SqlitePool;

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum IntervalType {
    Upcoming,
    Current,
    Past,
}

pub async fn insert_zeroth_interval<'e, 'c: 'e, E>(start_date: NaiveDate, project_id: ProjectId, pool: E) -> Result<Interval, sqlx::Error>
where
    E: sqlx::Executor<'c, Database = sqlx::Sqlite>,
{
    let result = sqlx::query_as!(
        Interval,
        "INSERT INTO intervals (number, start_date, project_id)
         VALUES (?, ?, ?)
         RETURNING number, start_date, end_date, project_id",
        0,
        &start_date.to_string(),
        project_id.id
    )
    .fetch_one(pool)
    .await?;

    Ok(Interval {
        number: result.number,
        start_date: result.start_date,
        end_date: result.end_date,
        project_id: result.project_id,
    })
}

pub async fn insert_interval(interval: Interval, project_id: ProjectId, pool: &SqlitePool) -> Result<Interval, sqlx::Error> {
    let mut transaction = pool.begin().await?;

    let last_number = sqlx::query!(
        "SELECT MAX(number) AS id
        FROM intervals
        WHERE
            project_id = ?",
        project_id.id
    )
    .fetch_one(&mut *transaction)
    .await
    .map(|row| row.id)?;

    let next_number = last_number.map_or(1, |id| id + 1);

    let result = sqlx::query_as!(
        Interval,
        "INSERT INTO intervals (number, start_date, end_date, project_id)
         VALUES (?, ?, ?, ?)
         RETURNING number, start_date, end_date, project_id",
        next_number,
        interval.start_date,
        interval.end_date,
        project_id.id
    )
    .fetch_one(&mut *transaction)
    .await?;

    copy_crew_states_into_interval(
        IntervalNumber::new(next_number, project_id.clone()),
        IntervalNumber::new(last_number.unwrap_or(0), project_id.clone()),
        &mut *transaction,
    )
    .await?;

    transaction.commit().await?;

    Ok(Interval {
        number: result.number,
        start_date: result.start_date,
        end_date: result.end_date,
        project_id: result.project_id,
    })
}

pub async fn find_all_intervals(project_id: ProjectId, pool: &SqlitePool) -> Result<Vec<Interval>, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT number, start_date, end_date, project_id
        FROM intervals
        WHERE
          project_id = ?
        ORDER BY number ASC",
        project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_interval(interval_number: IntervalNumber, pool: &SqlitePool) -> Result<Interval, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT number, start_date, end_date, project_id
        FROM intervals
        WHERE number = ? AND project_id = ?",
        interval_number.number,
        interval_number.project_id.id
    )
    .fetch_one(pool)
    .await
}

pub async fn find_current_interval(project_id: ProjectId, pool: &SqlitePool) -> Result<Option<Interval>, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT i.number, i.start_date, i.end_date, i.project_id
        FROM intervals i
        INNER JOIN projects p ON p.current_interval_number = i.number AND p.id = i.project_id
        WHERE p.id = ?
        ORDER BY i.number ASC
        LIMIT 1",
        project_id.id
    )
    .fetch_optional(pool)
    .await
}

pub async fn find_next_interval(
    project_id: ProjectId,
    current_interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<Option<Interval>, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT number, start_date, end_date, project_id
        FROM intervals
        WHERE
            project_id = ? AND
            number > ?
        ORDER BY number ASC
        LIMIT 1",
        project_id.id,
        current_interval_number.number
    )
    .fetch_optional(pool)
    .await
}

pub async fn find_previous_interval(
    project_id: ProjectId,
    current_interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<Option<Interval>, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT number, start_date, end_date, project_id
        FROM intervals
        WHERE
            project_id = ? AND
            number < ?
        ORDER BY number DESC
        LIMIT 1",
        project_id.id,
        current_interval_number.number
    )
    .fetch_optional(pool)
    .await
}

pub fn get_interval_type(interval: Interval) -> IntervalType {
    let today = chrono::Utc::now().date_naive();
    let start_date = parse_date_only(&interval.start_date).unwrap();
    let end_date = interval.end_date.as_ref().and_then(|d| parse_date_only(d));

    if start_date > today {
        return IntervalType::Upcoming;
    }

    if end_date.is_none() {
        return IntervalType::Current;
    }

    if let Some(end_date) = end_date
        && end_date < today
    {
        return IntervalType::Past;
    }

    IntervalType::Current
}

pub async fn mark_implicit_involvements_processed(
    interval_number: IntervalNumber,
    value: bool,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE intervals
         SET processed_implicit_involvements = ?
         WHERE number = ? AND project_id = ?",
        value,
        interval_number.number,
        interval_number.project_id.id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn mark_peer_roles_processed(interval_number: IntervalNumber, value: bool, pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE intervals
         SET processed_peer_roles = ?
         WHERE number = ? AND project_id = ?",
        value,
        interval_number.number,
        interval_number.project_id.id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn set_interval_end_date(interval_number: IntervalNumber, end_date: NaiveDate, pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE intervals
         SET end_date = ?
         WHERE
            number = ? AND
            project_id = ? AND
            end_date IS NULL",
        end_date.to_string(),
        interval_number.number,
        interval_number.project_id.id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub fn parse_date_only(date_str: &str) -> Option<chrono::NaiveDate> {
    chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d").ok()
}

pub async fn change_project_interval<'e, 'c: 'e, E>(
    project_id: ProjectId,
    new_interval_number: IntervalNumber,
    pool: E,
) -> Result<(), sqlx::Error>
where
    E: sqlx::Executor<'c, Database = sqlx::Sqlite>,
{
    sqlx::query!(
        "UPDATE projects
         SET current_interval_number = ?
         WHERE id = ?",
        new_interval_number.number,
        project_id.id,
    )
    .execute(pool)
    .await?;

    Ok(())
}
