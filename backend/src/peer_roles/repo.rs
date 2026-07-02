use sqlx::SqlitePool;

use crate::shared::entities::{PeerRole, PeerRoleDistributionType, ProjectId};

pub async fn find_all_peer_roles(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<PeerRole>, sqlx::Error> {
    let rows = sqlx::query_as!(
        PeerRole,
        r#"
        SELECT id, name, project_id, circle_id, distribution_type as "distribution_type: PeerRoleDistributionType"
        FROM peer_roles
        WHERE project_id = ?
        "#,
        project_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}
