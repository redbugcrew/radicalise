use sqlx::SqlitePool;

use crate::shared::entities::Person;

pub async fn update_person(input: Person, pool: &SqlitePool) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "UPDATE people SET display_name = ?, about = ?, avatar_id = ? WHERE id = ?",
        input.display_name,
        input.about,
        input.avatar_id,
        input.id
    )
    .execute(pool)
    .await?;

    find_person_by_id(input.id, pool).await
}

pub async fn find_person_by_id(person_id: i64, pool: &SqlitePool) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "SELECT id, display_name, about, avatar_id FROM people WHERE id = ?",
        person_id
    )
    .fetch_one(pool)
    .await
}
