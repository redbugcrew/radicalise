use sqlx::SqlitePool;

use crate::shared::entities::{CollectiveId, CrewId, IntervalId, Person, PersonId, UserId};

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

pub async fn find_person_by_user_id(
    user_id: UserId,
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Person, sqlx::Error> {
    sqlx::query_as!(
        Person,
        "
        SELECT id, collective_id, display_name, about, avatar_id
        FROM people
        WHERE
            user_id = ? AND
            collective_id = ?",
        user_id.id,
        collective_id.id
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
        SELECT p.id, p.collective_id, p.display_name, p.about, p.avatar_id
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
