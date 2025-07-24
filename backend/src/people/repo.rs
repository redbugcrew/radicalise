use sqlx::SqlitePool;

use crate::shared::entities::{CollectiveId, Person, PersonId};

pub async fn update_person(
    input: Person,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        UPDATE people
        SET display_name = ?, about = ?, avatar_id = ?
        WHERE id = ? AND collective_id = ?",
        input.display_name,
        input.about,
        input.avatar_id,
        input.id,
        collective_id.id
    )
    .execute(pool)
    .await?;

    find_person_by_id(input.typed_id(), collective_id, pool).await
}

pub async fn find_person_by_id(
    person_id: PersonId,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        SELECT id, collective_id, display_name, about, avatar_id
        FROM people
        WHERE
            id = ? AND
            collective_id = ?",
        person_id.id,
        collective_id.id
    )
    .fetch_one(pool)
    .await
}

pub async fn find_all_people(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<Person>, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        SELECT id, collective_id, display_name, about, avatar_id
        FROM people
        WHERE collective_id = ?",
        collective_id.id
    )
    .fetch_all(pool)
    .await
}
