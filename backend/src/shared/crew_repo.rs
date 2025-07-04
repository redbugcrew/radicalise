use sqlx::SqlitePool;

use crate::shared::entities::CrewInvolvement;

pub async fn find_crew_involvements(
    crew_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT id, person_id, crew_id, interval_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE crew_id = ? AND interval_id = ?",
        crew_id,
        interval_id
    )
    .fetch_all(pool)
    .await
}

pub async fn set_crew_convenor(
    crew_id: i64,
    interval_id: i64,
    person_id: Option<i64>,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    println!(
        "Setting crew {} convenor for interval {} to person {:?}",
        crew_id, interval_id, person_id
    );

    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "UPDATE crew_involvements SET convenor = FALSE
        WHERE crew_id = ? AND interval_id = ?",
        crew_id,
        interval_id
    )
    .execute(&mut *transaction)
    .await?;

    if person_id.is_some() {
        sqlx::query!(
            "UPDATE crew_involvements SET convenor = TRUE
        WHERE crew_id = ? AND interval_id = ? AND person_id = ?",
            crew_id,
            interval_id,
            person_id
        )
        .execute(&mut *transaction)
        .await?;
    }

    transaction.commit().await?;

    Ok(())
}
