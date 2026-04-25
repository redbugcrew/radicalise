use sqlx::SqlitePool;

use crate::shared::entities::{Circle, ProjectId};

pub async fn find_all_circles(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<Circle>, sqlx::Error> {
    sqlx::query_as!(
        Circle,
        "SELECT id as \"id: i64\", project_id as \"project_id: i64\", name, slug
        FROM circles
        WHERE project_id = ?",
        project_id.id
    )
    .fetch_all(pool)
    .await
}
