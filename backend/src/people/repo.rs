use sqlx::SqlitePool;

use crate::{
    repo_utilities::InsertRecordError,
    shared::entities::{Person, PersonId, ProjectId, UserId},
};

pub async fn insert_person_without_user(
    project_id: ProjectId,
    display_name: String,
    pool: &SqlitePool,
) -> Result<Person, InsertRecordError> {
    let result = sqlx::query_as!(
        Person,
        "
        INSERT INTO people (project_id, display_name)
        VALUES (?, ?)
        RETURNING id AS \"id!\", project_id, display_name, about, avatar_id",
        project_id.id,
        display_name,
    )
    .fetch_one(pool)
    .await?;

    Ok(result)
}

pub async fn update_person(project_id: ProjectId, input: Person, pool: &SqlitePool) -> Result<Person, sqlx::Error> {
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
        project_id.id,
    )
    .execute(pool)
    .await?;

    find_person_by_id(input.typed_id(), pool).await
}

pub async fn find_person_by_id(person_id: PersonId, pool: &SqlitePool) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        SELECT id, project_id, display_name, about, avatar_id
        FROM people
        WHERE
            id = ?",
        person_id.id,
    )
    .fetch_one(pool)
    .await
}

pub async fn find_person_by_user_id(user_id: UserId, project_id: ProjectId, pool: &SqlitePool) -> Result<Option<Person>, sqlx::Error> {
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
    .fetch_optional(pool)
    .await
}

pub async fn find_person_by_calendar_token(calendar_token: &str, pool: &SqlitePool) -> Result<Person, sqlx::Error> {
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

pub async fn find_all_people(project_id: ProjectId, pool: &SqlitePool) -> Result<Vec<Person>, sqlx::Error> {
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

pub async fn delete_person(person_id: PersonId, pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query!("DELETE FROM people WHERE id = ?", person_id.id).execute(pool).await?;

    Ok(())
}

pub async fn update_person_user_id(person_id: PersonId, user_id: UserId, pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query!("UPDATE people SET user_id = ? WHERE id = ?", user_id.id, person_id.id)
        .execute(pool)
        .await?;

    Ok(())
}
