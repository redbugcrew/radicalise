use sqlx::SqlitePool;

use crate::{
    intervals::repo::mark_peer_roles_processed,
    peer_roles::repo::find_all_peer_roles,
    shared::entities::{Interval, PeerRole, ProjectId},
};

mod algorithms;
mod match_results;
mod repo;

pub async fn assign_interval_peer_roles(
    interval: &Interval,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    println!("Assigning peer roles for interval {}", interval.id);

    let peer_roles = find_all_peer_roles(project_id, pool).await?;

    for peer_role in peer_roles {
        assign_interval_peer_role(interval, &peer_role, pool).await?;
    }

    mark_peer_roles_processed(interval.typed_id(), true, pool).await?;

    Ok(())
}

async fn assign_interval_peer_role(
    interval: &Interval,
    peer_role: &PeerRole,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    Ok(())
}
