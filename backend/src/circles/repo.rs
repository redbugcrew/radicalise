use sqlx::SqlitePool;

use crate::shared::entities::{Circle, CircleId, ProjectId};

pub async fn find_all_circles(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<Circle>, sqlx::Error> {
    sqlx::query_as!(
        Circle,
        "SELECT id as \"id: i64\", project_id as \"project_id: i64\", name, slug
        FROM circles
        WHERE project_id = ?
        ORDER BY id ASC",
        project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn insert_circle(
    circle: &Circle,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Circle, sqlx::Error> {
    let rec = sqlx::query!(
        "INSERT INTO circles (project_id, name, slug) VALUES (?, ?, ?)",
        project_id.id,
        circle.name,
        circle.slug
    )
    .execute(pool)
    .await?;

    Ok(Circle {
        id: rec.last_insert_rowid(),
        ..circle.clone()
    })
}

pub async fn update_circle(
    circle_id: CircleId,
    circle: &Circle,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Circle, sqlx::Error> {
    sqlx::query!(
        "UPDATE circles SET name = ?, slug = ? WHERE id = ? AND project_id = ?",
        circle.name,
        circle.slug,
        circle_id.id,
        project_id.id
    )
    .execute(pool)
    .await?;

    Ok(Circle {
        id: circle_id.id,
        project_id: project_id.id,
        ..circle.clone()
    })
}
