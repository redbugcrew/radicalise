use std::collections::HashMap;

use sqlx::SqlitePool;

use crate::shared::{
    entities::{CollectiveId, Crew, CrewId, CrewInvolvement, CrewWithLinks, IntervalId},
    links_repo::{find_all_links_for_owner_type, hash_links_by_owner, update_links_for_owner},
};

pub async fn find_all_crews_with_links(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<CrewWithLinks>, sqlx::Error> {
    let crews = find_all_crews(collective_id, pool).await?;

    let links = find_all_links_for_owner_type("crews".to_string(), pool).await?;
    let links_hash = hash_links_by_owner(links);

    let crews: Vec<CrewWithLinks> = crews
        .into_iter()
        .map(|crew| CrewWithLinks {
            id: crew.id,
            name: crew.name,
            description: crew.description,
            collective_id: crew.collective_id,
            links: Some(links_hash.get(&crew.id).cloned().unwrap_or_else(Vec::new)),
        })
        .collect();

    Ok(crews)
}

pub async fn find_all_crews(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<Crew>, sqlx::Error> {
    sqlx::query_as!(
        Crew,
        "SELECT id, name, description, collective_id FROM crews WHERE collective_id = ?",
        collective_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn update_crew(
    collective_id: CollectiveId,
    crew: Crew,
    pool: &SqlitePool,
) -> Result<Crew, sqlx::Error> {
    sqlx::query_as!(
        Crew,
        "UPDATE crews SET name = ?, description = ? WHERE id = ? AND collective_id = ? ",
        crew.name,
        crew.description,
        crew.id,
        collective_id.id
    )
    .execute(pool)
    .await?;

    Ok(crew)
}

pub async fn update_crew_with_links(
    collective_id: CollectiveId,
    crew: CrewWithLinks,
    pool: &SqlitePool,
) -> Result<CrewWithLinks, sqlx::Error> {
    let crew_result = update_crew(
        collective_id,
        Crew {
            id: crew.id,
            name: crew.name,
            description: crew.description,
            collective_id: crew.collective_id,
        },
        pool,
    )
    .await?;

    let links = update_links_for_owner(crew.id, "crews".to_string(), crew.links, pool).await?;

    Ok(CrewWithLinks {
        id: crew_result.id,
        name: crew_result.name,
        description: crew_result.description,
        collective_id: crew_result.collective_id,
        links,
    })
}

pub async fn find_crew_involvements(
    crew_id: CrewId,
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT id, person_id, crew_id, interval_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE crew_id = ? AND interval_id = ?",
        crew_id.id,
        interval_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn set_crew_convenor(
    crew_id: CrewId,
    interval_id: IntervalId,
    person_id: Option<i64>,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    println!(
        "Setting crew {} convenor for interval {} to person {:?}",
        crew_id.id, interval_id.id, person_id
    );

    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "UPDATE crew_involvements SET convenor = FALSE
        WHERE crew_id = ? AND interval_id = ?",
        crew_id.id,
        interval_id.id
    )
    .execute(&mut *transaction)
    .await?;

    if person_id.is_some() {
        sqlx::query!(
            "UPDATE crew_involvements SET convenor = TRUE
        WHERE crew_id = ? AND interval_id = ? AND person_id = ?",
            crew_id.id,
            interval_id.id,
            person_id
        )
        .execute(&mut *transaction)
        .await?;
    }

    transaction.commit().await?;

    Ok(())
}

pub async fn intervals_participated_since_last_convened(
    crew_id: CrewId,
    before_interval_id: IntervalId,
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
        crew_id.id,
        before_interval_id.id,
        crew_id.id,
        before_interval_id.id
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
