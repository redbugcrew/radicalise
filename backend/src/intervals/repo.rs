use sqlx::SqlitePool;

use crate::shared::entities::Interval;

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
