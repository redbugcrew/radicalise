use sqlx::SqlitePool;

use crate::{
    repo_utilities::InsertRecordError,
    shared::entities::{CrewId, IntervalId, Person, PersonId, ProjectId, UserId},
};

pub async fn insert_person(
    project_id: ProjectId,
    user_id: UserId,
    display_name: String,
    pool: &SqlitePool,
) -> Result<Person, InsertRecordError> {
    let result = sqlx::query_as!(
        Person,
        "
        INSERT INTO people (project_id, display_name, user_id)
        VALUES (?, ?, ?)
        RETURNING id, project_id, display_name, about, avatar_id",
        project_id.id,
        display_name,
        user_id.id
    )
    .fetch_one(pool)
    .await?;

    Ok(result)
}

pub async fn find_or_insert_person(
    project_id: ProjectId,
    user_id: UserId,
    display_name: String,
    pool: &SqlitePool,
) -> Result<Person, InsertRecordError> {
    match find_person_by_user_id(user_id.clone(), project_id.clone(), pool).await {
        Ok(person) => Ok(person),
        Err(sqlx::Error::RowNotFound) => {
            insert_person(project_id, user_id, display_name, pool).await
        }
        Err(err) => Err(InsertRecordError::from(err)),
    }
}

pub async fn update_person(
    input: Person,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        UPDATE people
        SET display_name = ?, about = ?, avatar_id = ?
        WHERE id = ? AND project_id = ?",
        input.display_name,
        input.about,
        input.avatar_id,
        input.id,
        project_id.id
    )
    .execute(pool)
    .await?;

    find_person_by_id(input.typed_id(), project_id, pool).await
}

pub async fn find_person_by_id(
    person_id: PersonId,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        SELECT id, project_id, display_name, about, avatar_id
        FROM people
        WHERE
            id = ? AND
            project_id = ?",
        person_id.id,
        project_id.id
    )
    .fetch_one(pool)
    .await
}

pub async fn find_person_by_user_id(
    user_id: UserId,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        SELECT id, project_id, display_name, about, avatar_id
        FROM people
        WHERE
            user_id = ? AND
            project_id = ?",
        user_id.id,
        project_id.id
    )
    .fetch_one(pool)
    .await
}

pub async fn find_person_by_calendar_token(
    calendar_token: &str,
    pool: &SqlitePool,
) -> Result<Person, sqlx::Error> {
    let result = sqlx::query_as!(
        Person,
        "
        SELECT p.id, p.project_id, p.display_name, p.about, p.avatar_id
        FROM people AS p
        INNER JOIN users ON p.user_id = users.id
        WHERE
            users.calendar_token = ?",
        calendar_token,
    )
    .fetch_one(pool)
    .await?;

    Ok(result)
}

pub async fn find_all_people(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<Person>, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        SELECT id, project_id, display_name, about, avatar_id
        FROM people
        WHERE project_id = ?",
        project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_crew_involved_emails(
    crew_id: CrewId,
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<Vec<String>, sqlx::Error> {
    let rows = sqlx::query!(
        "SELECT email
        FROM users
        INNER JOIN people ON users.id = people.user_id
        INNER JOIN crew_involvements ON people.id = crew_involvements.person_id
        WHERE crew_involvements.crew_id = ? AND crew_involvements.interval_id = ?",
        crew_id.id,
        interval_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().filter_map(|row| row.email).collect())
}
