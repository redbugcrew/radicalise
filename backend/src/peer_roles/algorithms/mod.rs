use crate::{peer_roles::match_results::MatchResults, shared::entities::PeerRoleDistributionType};
use rand::Rng;

mod helpers;
mod random_pairs;
mod rotated_pairs;
mod sticky_unidirectional;

pub use helpers::match_history::{IntervalsAgo, MatchHistory};
pub use random_pairs::random_pairs;
pub use rotated_pairs::rotated_pairs;
pub use sticky_unidirectional::sticky_unidirectional;

pub trait PairingAlgorithm {
    /// Whether this algorithm needs historical match data. The caller uses this
    /// to decide whether to fetch it before calling `distribute`.
    fn requires_match_history(&self) -> bool;

    fn distribute<PeerId, R>(
        &self,
        people: Vec<PeerId>,
        history: Option<&MatchHistory<PeerId>>,
        constraint_edges: Option<&[(PeerId, PeerId)]>,
        rng: &mut R,
    ) -> MatchResults<PeerId>
    where
        PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
        R: Rng;
}

impl PairingAlgorithm for PeerRoleDistributionType {
    fn requires_match_history(&self) -> bool {
        match self {
            Self::RandomPairs => false,
            Self::RotatedPairs => true,
            Self::StickyUnidirectional => true,
        }
    }

    fn distribute<PeerId, R>(
        &self,
        people: Vec<PeerId>,
        match_history: Option<&MatchHistory<PeerId>>,
        constraint_edges: Option<&[(PeerId, PeerId)]>,
        rng: &mut R,
    ) -> MatchResults<PeerId>
    where
        PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
        R: Rng,
    {
        match self {
            Self::RandomPairs => random_pairs(people, constraint_edges, rng),
            Self::RotatedPairs => rotated_pairs(
                people,
                match_history.expect("History required"),
                constraint_edges,
                rng,
            ),
            Self::StickyUnidirectional => sticky_unidirectional(
                people,
                match_history.expect("History required"),
                constraint_edges,
                rng,
            ),
        }
    }
}

fn remove_person<PeerId>(person: &PeerId, people: &mut Vec<PeerId>)
where
    PeerId: Eq,
{
    people.retain(|p| *p != *person);
}
