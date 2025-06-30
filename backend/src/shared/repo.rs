use sqlx::SqlitePool;

use crate::shared::entities::Interval;

pub async fn find_current_interval(
    collective_id: i64,
    pool: &SqlitePool,
) -> Result<Interval, sqlx::Error> {
    sqlx::query_as!(
        Interval,
        "SELECT id, start_date, end_date FROM intervals WHERE collective_id = ? AND start_date <= date('now') AND (end_date IS NULL OR end_date >= date('now'))",
        collective_id
    )
    .fetch_one(pool)
    .await
}
