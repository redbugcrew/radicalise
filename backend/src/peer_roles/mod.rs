use rand::rng;
use sqlx::SqlitePool;

use crate::{
    intervals::repo::mark_peer_roles_processed,
    my_project::involvements_repo::find_all_circle_involvements,
    peer_roles::repo::find_all_peer_roles,
    shared::entities::{
        CircleId, Interval, IntervalId, PeerRole, PeerRoleDistributionType, ProjectId,
    },
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
    let involvements = find_all_circle_involvements(
        ProjectId::new(peer_role.project_id),
        CircleId::new(peer_role.circle_id),
        IntervalId::new(interval.id),
        pool,
    )
    .await?;

    let people: Vec<i64> = involvements.into_iter().map(|i| i.person_id).collect();

    println!(
        "Assigning peer role for people ids '{:?}' in interval {} ({} people)",
        people,
        interval.id,
        people.len()
    );

    let results = match peer_role.distribution_type {
        PeerRoleDistributionType::RandomPairs => {
            let mut rng = rng();
            algorithms::random_pairs(people, &mut rng)
        }
    };

    println!(
        "Peer role '{}' (interval {}): {}",
        peer_role.name,
        interval.id,
        results.to_string()
    );

    Ok(())
}
