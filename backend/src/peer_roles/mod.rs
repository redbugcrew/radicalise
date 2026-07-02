use sqlx::SqlitePool;

use crate::{
    peer_roles::repo::find_all_peer_roles,
    shared::entities::{Interval, ProjectId},
};

mod algorithms;
mod match_results;
mod repo;

async fn assign_interval_peer_roles(
    interval: &Interval,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    println!("Assigning peer roles for interval {}", interval.id);

    let peer_roles = find_all_peer_roles(project_id, pool).await?;

    Ok(())
}
