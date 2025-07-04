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
    pool: &SqlitePool,
) -> Result<Interval, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "INSERT INTO intervals (start_date, end_date)
         VALUES (?, ?)
         RETURNING id, start_date, end_date",
        interval.start_date,
        interval.end_date
    )
    .fetch_one(pool)
    .await
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
