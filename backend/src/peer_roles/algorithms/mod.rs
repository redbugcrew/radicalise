use rand::Rng;

use crate::{peer_roles::match_results::MatchResults, shared::entities::PeerRoleDistributionType};

mod random_pairs;
mod rotated_pairs;

mod helpers;
mod random_pairs;
mod rotated_pairs;

pub use helpers::match_history::MatchHistory;
pub use random_pairs::random_pairs;
pub use rotated_pairs::rotated_pairs;

pub trait PairingAlgorithm {
    fn distribute<PeerId, R>(&self, people: Vec<PeerId>, rng: &mut R) -> MatchResults<PeerId>
    where
        PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
        R: Rng;
}

impl PairingAlgorithm for PeerRoleDistributionType {
    fn distribute<PeerId, R>(&self, people: Vec<PeerId>, rng: &mut R) -> MatchResults<PeerId>
    where
        PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
        R: Rng,
    {
        match self {
            Self::RandomPairs => random_pairs(people, rng),
            Self::RotatedPairs => rotated_pairs(people, rng),
        }
    }
}

fn remove_person<PeerId>(person: &PeerId, people: &mut Vec<PeerId>)
where
    PeerId: Eq,
{
    people.retain(|p| *p != *person);
}
