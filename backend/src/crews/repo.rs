use std::collections::HashMap;

use sqlx::SqlitePool;

use crate::shared::{
    entities::{Crew, CrewId, CrewInvolvement, CrewState, CrewStatus, CrewWithLinks, IntervalNumber, ProjectId},
    links_repo::{find_all_links_for_owner_type, hash_links_by_owner, update_links_for_owner},
};

pub async fn find_all_crews_with_links(project_id: ProjectId, pool: &SqlitePool) -> Result<Vec<CrewWithLinks>, sqlx::Error> {
    let crews = find_all_crews(project_id, pool).await?;

    let links = find_all_links_for_owner_type("crews".to_string(), pool).await?;
    let links_hash = hash_links_by_owner(links);

    let crews: Vec<CrewWithLinks> = crews
        .into_iter()
        .map(|crew| CrewWithLinks {
            id: crew.id,
            name: crew.name,
            description: crew.description,
            project_id: crew.project_id,
            links: Some(links_hash.get(&crew.id).cloned().unwrap_or_else(Vec::new)),
        })
        .collect();

    Ok(crews)
}

pub async fn find_all_crews(project_id: ProjectId, pool: &SqlitePool) -> Result<Vec<Crew>, sqlx::Error> {
    sqlx::query_as!(
        Crew,
        "SELECT id, name, description, project_id FROM crews WHERE project_id = ?",
        project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn update_crew(project_id: ProjectId, crew: Crew, pool: &SqlitePool) -> Result<Crew, sqlx::Error> {
    sqlx::query_as!(
        Crew,
        "UPDATE crews SET name = ?, description = ? WHERE id = ? AND project_id = ? ",
        crew.name,
        crew.description,
        crew.id,
        project_id.id
    )
    .execute(pool)
    .await
    .map_err(|e| {
        println!("Error updating crew: {:?}", e);
        e
    })?;

    Ok(crew)
}

pub async fn create_crew(project_id: ProjectId, crew: Crew, pool: &SqlitePool) -> Result<Crew, sqlx::Error> {
    let crew = sqlx::query_as!(
        Crew,
        "INSERT INTO crews (name, description, project_id)
        VALUES (?, ?, ?)
        RETURNING id AS \"id!\", name, description, project_id",
        crew.name,
        crew.description,
        project_id.id
    )
    .fetch_one(pool)
    .await?;

    Ok(crew)
}

pub async fn update_crew_with_links(project_id: ProjectId, crew: CrewWithLinks, pool: &SqlitePool) -> Result<CrewWithLinks, sqlx::Error> {
    let crew_result = update_crew(
        project_id,
        Crew {
            id: crew.id,
            name: crew.name,
            description: crew.description,
            project_id: crew.project_id,
        },
        pool,
    )
    .await?;

    let links = update_links_for_owner(crew.id, "crews".to_string(), crew.links, pool).await?;

    Ok(CrewWithLinks::new(crew_result, links))
}

pub async fn create_available_crew_with_links(
    interval_number: IntervalNumber,
    crew: CrewWithLinks,
    pool: &SqlitePool,
) -> Result<CrewWithLinks, sqlx::Error> {
    let crew = create_crew_with_links(interval_number.project_id.clone(), crew, pool).await?;

    set_crew_status(crew.typed_id(), interval_number, CrewStatus::Available, pool).await?;

    Ok(crew)
}

pub async fn create_crew_with_links(project_id: ProjectId, crew: CrewWithLinks, pool: &SqlitePool) -> Result<CrewWithLinks, sqlx::Error> {
    let crew_result = create_crew(
        project_id,
        Crew {
            id: crew.id,
            name: crew.name,
            description: crew.description,
            project_id: crew.project_id,
        },
        pool,
    )
    .await?;

    let links = update_links_for_owner(crew_result.id, "crews".to_string(), crew.links, pool).await?;

    Ok(CrewWithLinks::new(crew_result, links))
}

pub async fn find_crew_involvements(
    crew_id: CrewId,
    interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT id, person_id, crew_id, interval_number, project_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE crew_id = ? AND interval_number = ? AND project_id = ?",
        crew_id.id,
        interval_number.number,
        interval_number.project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn set_crew_convenor(
    crew_id: CrewId,
    interval_number: IntervalNumber,
    person_id: Option<i64>,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    println!(
        "Setting crew {} convenor for interval {} to person {:?}",
        crew_id.id, interval_number.number, person_id
    );

    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "UPDATE crew_involvements SET convenor = FALSE
        WHERE crew_id = ? AND interval_number = ? AND project_id = ?",
        crew_id.id,
        interval_number.number,
        interval_number.project_id.id
    )
    .execute(&mut *transaction)
    .await?;

    if person_id.is_some() {
        sqlx::query!(
            "UPDATE crew_involvements SET convenor = TRUE
            WHERE crew_id = ? AND interval_number = ? AND project_id = ? AND person_id = ?",
            crew_id.id,
            interval_number.number,
            interval_number.project_id.id,
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
    before_interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<HashMap<i64, i64>, sqlx::Error> {
    let result = sqlx::query!(
        "
        SELECT crew_involvements.person_id, COUNT(interval_number) as \"count: i64\"
        FROM crew_involvements
        LEFT JOIN (
            SELECT person_id, MAX(interval_number) as last_convened
            FROM crew_involvements
            WHERE
                crew_id = ? AND
                convenor = TRUE AND
                interval_number <= ? AND
                project_id = ?
            GROUP BY person_id
        ) i ON crew_involvements.person_id = i.person_id
        WHERE
            interval_number > last_convened AND
            convenor = FALSE AND
            crew_id = ? AND
            interval_number <= ? AND
            project_id = ?
        GROUP BY crew_involvements.person_id
        ",
        crew_id.id,
        before_interval_number.number,
        before_interval_number.project_id.id,
        crew_id.id,
        before_interval_number.number,
        before_interval_number.project_id.id
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

pub async fn set_crew_status(
    crew_id: CrewId,
    interval_number: IntervalNumber,
    state: CrewStatus,
    pool: &SqlitePool,
) -> Result<CrewState, sqlx::Error> {
    let result = sqlx::query_as!(
        CrewState,
        "INSERT INTO crew_states (crew_id, interval_number, project_id, state)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(crew_id, interval_number, project_id) DO UPDATE SET state = excluded.state
        RETURNING *",
        crew_id.id,
        interval_number.number,
        interval_number.project_id.id,
        state
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {
        println!(
            "Error setting crew status: {:?} with crew_id: {:?}, interval_number: {:?}, state: {:?}",
            e, crew_id, interval_number, state
        );
        e
    })?;

    Ok(result)
}

pub async fn find_crew_states_for_interval(interval_number: IntervalNumber, pool: &SqlitePool) -> Result<Vec<CrewState>, sqlx::Error> {
    let result = sqlx::query_as!(
        CrewState,
        "SELECT id, crew_id, state, interval_number, project_id
        FROM crew_states
        WHERE interval_number = ? AND project_id = ?",
        interval_number.number,
        interval_number.project_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(result)
}
