use rand::rng;
use sqlx::SqlitePool;
use std::collections::{HashMap, HashSet};

use crate::{
    intervals::repo::mark_peer_roles_processed,
    my_project::involvements_repo::find_all_circle_involvements,
    peer_roles::{
        algorithms::PairingAlgorithm,
        enrollments_repo::{load_match_history, upsert_peer_enrollments},
        peer_roles_repo::find_all_peer_roles,
    },
    shared::entities::{CircleId, Interval, IntervalId, PeerRole, ProjectId},
};

mod algorithms;
pub mod enrollments_repo;
mod match_results;
pub mod peer_roles_repo;

#[derive(Debug)]
pub enum AssignPeerRolesError {
    ConstraintViolation(String),
    Database(sqlx::Error),
}

impl std::fmt::Display for AssignPeerRolesError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ConstraintViolation(message) => write!(f, "{}", message),
            Self::Database(error) => write!(f, "{}", error),
        }
    }
}

impl std::error::Error for AssignPeerRolesError {}

impl From<sqlx::Error> for AssignPeerRolesError {
    fn from(error: sqlx::Error) -> Self {
        Self::Database(error)
    }
}

pub async fn assign_interval_peer_roles(
    interval: &Interval,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<(), AssignPeerRolesError> {
    println!("Assigning peer roles for interval {}", interval.id);

    let peer_roles = find_all_peer_roles(project_id, pool).await?;
    let ordered_roles = order_peer_roles(peer_roles).map_err(|message| {
        println!("{}", message);
        AssignPeerRolesError::ConstraintViolation(message)
    })?;

    let mut computed_edges: HashMap<i64, Vec<(i64, i64)>> = HashMap::new();

    for peer_role in ordered_roles {
        let constraint_edges = peer_role
            .constrained_by_id
            .and_then(|id| computed_edges.get(&id).map(Vec::as_slice));

        let edges = assign_interval_peer_role(interval, &peer_role, constraint_edges, pool).await?;

        computed_edges.insert(peer_role.id, edges);
    }

    mark_peer_roles_processed(interval.typed_id(), true, pool).await?;

    Ok(())
}

fn order_peer_roles(roles: Vec<PeerRole>) -> Result<Vec<PeerRole>, String> {
    let by_id: HashMap<i64, PeerRole> = roles.into_iter().map(|r| (r.id, r)).collect();
    let mut ordered = Vec::new();
    let mut visited = HashSet::new();
    let mut temp_mark = HashSet::new();

    fn visit(
        id: i64,
        by_id: &HashMap<i64, PeerRole>,
        ordered: &mut Vec<PeerRole>,
        visited: &mut HashSet<i64>,
        temp_mark: &mut HashSet<i64>,
    ) -> Result<(), String> {
        if temp_mark.contains(&id) {
            return Err(format!(
                "Cycle detected in peer role constraints at role {}",
                id
            ));
        }

        if visited.contains(&id) {
            return Ok(());
        }

        temp_mark.insert(id);

        if let Some(role) = by_id.get(&id) {
            if let Some(constraint_id) = role.constrained_by_id {
                if !by_id.contains_key(&constraint_id) {
                    return Err(format!(
                        "Peer role {} is constrained by non-existent role {}",
                        id, constraint_id
                    ));
                }

                visit(constraint_id, by_id, ordered, visited, temp_mark)?;
            }

            ordered.push(role.clone());
        }

        temp_mark.remove(&id);
        visited.insert(id);

        Ok(())
    }

    for id in by_id.keys().copied().collect::<Vec<_>>() {
        visit(id, &by_id, &mut ordered, &mut visited, &mut temp_mark)?;
    }

    Ok(ordered)
}

async fn assign_interval_peer_role(
    interval: &Interval,
    peer_role: &PeerRole,
    constraint_edges: Option<&[(i64, i64)]>,
    pool: &SqlitePool,
) -> Result<Vec<(i64, i64)>, AssignPeerRolesError> {
    let involvements = find_all_circle_involvements(
        ProjectId::new(peer_role.project_id),
        CircleId::new(peer_role.circle_id),
        IntervalId::new(interval.id),
        pool,
    )
    .await?;

    let mut people: Vec<i64> = involvements.into_iter().map(|i| i.person_id).collect();

    if let Some(edges) = constraint_edges {
        let allowed: HashSet<i64> = edges.iter().flat_map(|(a, b)| [*a, *b]).collect();
        people.retain(|person_id| allowed.contains(person_id));

        println!(
            "Peer role '{}' constrained by role {}; filtered to {} people",
            peer_role.name,
            peer_role.constrained_by_id.unwrap(),
            people.len()
        );
    }

    println!(
        "Assigning peer role for people ids '{:?}' in interval {} ({} people)",
        people,
        interval.id,
        people.len()
    );

    let history = if peer_role.distribution_type.requires_match_history() {
        Some(load_match_history(peer_role.id, interval.id, pool).await?)
    } else {
        None
    };

    let results = {
        let mut rng = rng();
        peer_role
            .distribution_type
            .distribute(people, history.as_ref(), constraint_edges, &mut rng)
    };

    println!(
        "Peer role '{}' (interval {}): {}",
        peer_role.name,
        interval.id,
        results.to_string()
    );

    let edges = results.edges();
    upsert_peer_enrollments(interval.id, peer_role.id, edges.clone(), pool).await?;

    Ok(edges)
}
