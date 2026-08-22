use resend_rs::Resend;
use sqlx::{SqlitePool, pool::maybe::MaybePoolConnection::PoolConnection};

use crate::{
    peer_roles,
    shared::entities::{PeerRole, PeerRoleDistributionType, ProjectId},
};

pub async fn find_all_peer_roles(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<PeerRole>, sqlx::Error> {
    let rows = sqlx::query_as!(
        PeerRole,
        r#"
        SELECT id, name, summary, project_id, circle_id, distribution_type as "distribution_type: PeerRoleDistributionType", constrained_by_id
        FROM peer_roles
        WHERE project_id = ?
        "#,
        project_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

//pub async fn create_peer_role(
//    record: PeerRole,
//    project_id: ProjectId,
//    pool: &SqlitePool,
//) -> Result<PeerRole, sqlx::Error> {
//    let result = sqlx::query!(
//       "INSERT INTO peer_roles (name)
//        VALUES(?)"
//    )
//    return create_peer_role(result.last_insert_rowid(), pool).await;
//}
