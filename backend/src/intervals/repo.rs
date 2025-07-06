use sqlx::SqlitePool;

use crate::shared::entities::Interval;

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum IntervalType {
    Upcoming,
    Current,
    Past,
}

pub async fn insert_interval(
    interval: Interval,
    collective_id: i64,
    pool: &SqlitePool,
) -> Result<Interval, sqlx::Error> {
    let mut transaction = pool.begin().await?;

    let last_id = sqlx::query!(
        "SELECT MAX(id) AS id
        FROM intervals
        WHERE
            collective_id = ?",
        collective_id
    )
    .fetch_one(&mut *transaction)
    .await
    .map(|row| row.id)?;

    let next_id = last_id.map_or(1, |id| id + 1);

    sqlx::query_as!(
        Interval,
        "INSERT INTO intervals (id, start_date, end_date, collective_id)
         VALUES (?, ?, ?, ?)
         RETURNING id, start_date, end_date",
        next_id,
        interval.start_date,
        interval.end_date,
        collective_id
    )
    .fetch_one(&mut *transaction)
    .await?;

    transaction.commit().await?;

    Ok(Interval {
        id: next_id,
        start_date: interval.start_date,
        end_date: interval.end_date,
    })
}

pub async fn find_interval(interval_id: i64, pool: &SqlitePool) -> Result<Interval, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT id, start_date, end_date FROM intervals WHERE id = ?",
        interval_id
    )
    .fetch_one(pool)
    .await
}

pub async fn find_current_interval(
    collective_id: i64,
    pool: &SqlitePool,
) -> Result<Interval, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT id, start_date, end_date
        FROM intervals
        WHERE
            collective_id = ? AND
            start_date <= date('now') AND (end_date IS NULL OR end_date >= date('now'))
        ORDER BY id ASC
        LIMIT 1",
        collective_id
    )
    .fetch_one(pool)
    .await
}

pub async fn find_next_interval(
    collective_id: i64,
    current_interval_id: i64,
    pool: &SqlitePool,
) -> Result<Option<Interval>, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT id, start_date, end_date
        FROM intervals
        WHERE
            collective_id = ? AND
            id > ?
        ORDER BY id ASC
        LIMIT 1",
        collective_id,
        current_interval_id
    )
    .fetch_optional(pool)
    .await
}

pub fn get_interval_type(interval: Interval) -> IntervalType {
    let today = chrono::Utc::now().date_naive();
    let start_date = parse_date_only(&interval.start_date).unwrap();
    let end_date = parse_date_only(&interval.end_date);

    if start_date > today {
        return IntervalType::Upcoming;
    }

    if let Some(end_date) = end_date {
        if end_date < today {
            return IntervalType::Past;
        }
    }

    return IntervalType::Current;
}

pub fn parse_date_only(date_str: &str) -> Option<chrono::NaiveDate> {
    chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d").ok()
}
