use std::collections::HashMap;

use sqlx::SqlitePool;

use crate::shared::entities::{Crew, CrewInvolvement};

pub async fn update_crew(crew: Crew, pool: &SqlitePool) -> Result<Crew, sqlx::Error> {
    sqlx::query_as!(
        Crew,
        "UPDATE crews SET name = ?, description = ? WHERE id = ?",
        crew.name,
        crew.description,
        crew.id
    )
    .fetch_one(pool)
    .await?;

    Ok(crew)
}

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

pub async fn intervals_participated_since_last_convened(
    crew_id: i64,
    before_interval_id: i64,
    pool: &SqlitePool,
) -> Result<HashMap<i64, i64>, sqlx::Error> {
    let result = sqlx::query!(
        "
        SELECT crew_involvements.person_id, COUNT(interval_id) as \"count: i64\"
        FROM crew_involvements
        LEFT JOIN (
            SELECT person_id, MAX(interval_id) as last_convened
            FROM crew_involvements
            WHERE
                crew_id = ? AND
                convenor = TRUE AND
                interval_id <= ?
            GROUP BY person_id
        ) i ON crew_involvements.person_id = i.person_id
        WHERE
            interval_id > last_convened AND
            convenor = FALSE AND
            crew_id = ? AND
            interval_id <= ?
        GROUP BY crew_involvements.person_id
        ",
        crew_id,
        before_interval_id,
        crew_id,
        before_interval_id
    )
    .fetch_all(pool)
    .await?;

    let mut map: HashMap<i64, i64> = HashMap::new();
    for row in result {
        if let Some(count) = row.count {
            map.insert(row.person_id, count);
        }
    }

    Ok(map)
}
