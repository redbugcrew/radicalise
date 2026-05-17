use std::collections::HashMap;

use sqlx::SqlitePool;

use crate::shared::entities::{Circle, CircleId, ProjectId};

pub async fn add_inside_circles(
    circles: Vec<Circle>,
    pool: &SqlitePool,
) -> Result<Vec<Circle>, sqlx::Error> {
    let needs_fetch = circles.iter().any(|c| c.inside_circle_id.is_some());
    if !needs_fetch {
        return Ok(circles);
    }

    let project_id = ProjectId::new(circles[0].project_id);
    let all_circles: HashMap<i64, Circle> = find_all_circles(project_id, pool)
        .await?
        .into_iter()
        .map(|c| (c.id, c))
        .collect();

    let mut result: HashMap<i64, Circle> = circles.into_iter().map(|c| (c.id, c)).collect();

    add_inside_circles_from(&all_circles, &mut result);

    Ok(result.into_values().collect())
}

fn add_inside_circles_from(all_circles: &HashMap<i64, Circle>, result: &mut HashMap<i64, Circle>) {
    let inside_ids: Vec<i64> = result
        .values()
        .filter_map(|c| c.inside_circle_id)
        .filter(|id| !result.contains_key(id))
        .collect();

    for id in inside_ids {
        if let Some(circle) = all_circles.get(&id) {
            result.insert(id, circle.clone());
            add_inside_circles_from(all_circles, result);
        }
    }
}

pub async fn find_all_circles(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<Circle>, sqlx::Error> {
    sqlx::query_as!(
        Circle,
        "SELECT id, project_id as \"project_id: i64\", name, slug, inside_circle_id
        FROM circles
        WHERE project_id = ?
        ORDER BY id ASC",
        project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_all_circles_ids(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<CircleId>, sqlx::Error> {
    sqlx::query_as!(
        CircleId,
        "SELECT id as \"id: i64\"
        FROM circles
        WHERE project_id = ?
        ORDER BY id ASC",
        project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_circle_by_id(
    circle_id: CircleId,
    pool: &SqlitePool,
) -> Result<Circle, sqlx::Error> {
    sqlx::query_as!(
        Circle,
        "SELECT id, project_id as \"project_id: i64\", name, slug, inside_circle_id
        FROM circles
        WHERE id = ?",
        circle_id.id
    )
    .fetch_one(pool)
    .await
}

pub async fn insert_circle(
    circle: &Circle,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Circle, sqlx::Error> {
    let rec = sqlx::query!(
        "INSERT INTO circles (project_id, name, slug, inside_circle_id) VALUES (?, ?, ?, ?)",
        project_id.id,
        circle.name,
        circle.slug,
        circle.inside_circle_id
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
        "UPDATE circles SET name = ?, slug = ?, inside_circle_id = ? WHERE id = ? AND project_id = ?",
        circle.name,
        circle.slug,
        circle.inside_circle_id,
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
