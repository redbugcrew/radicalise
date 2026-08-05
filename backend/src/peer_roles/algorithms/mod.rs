use crate::{peer_roles::match_results::MatchResults, shared::entities::PeerRoleDistributionType};
use rand::Rng;

mod helpers;
mod random_pairs;
mod rotated_pairs;
mod sticky_unidirectional;

pub use helpers::interval_last_matched::IntervalLastMatched;
pub use random_pairs::random_pairs;
pub use rotated_pairs::rotated_pairs;
pub use sticky_unidirectional::sticky_unidirectional;

pub trait PairingAlgorithm {
    /// Whether this algorithm needs historical match data. The caller uses this
    /// to decide whether to fetch it before calling `distribute`.
    fn requires_interval_last_matched(&self) -> bool;

    fn distribute<PeerId, R>(
        &self,
        people: Vec<PeerId>,
        history: Option<&IntervalLastMatched<PeerId>>,
        rng: &mut R,
    ) -> MatchResults<PeerId>
    where
        PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
        R: Rng;
}

impl PairingAlgorithm for PeerRoleDistributionType {
    fn requires_interval_last_matched(&self) -> bool {
        match self {
            Self::RandomPairs => false,
            Self::RotatedPairs => true,
            Self::StickyUnidirectional => false,
        }
    }

    fn distribute<PeerId, R>(
        &self,
        people: Vec<PeerId>,
        interval_last_matched: Option<&IntervalLastMatched<PeerId>>,
        rng: &mut R,
    ) -> MatchResults<PeerId>
    where
        PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
        R: Rng,
    {
        match self {
            Self::RandomPairs => random_pairs(people, rng),
            Self::RotatedPairs => rotated_pairs(
                people,
                interval_last_matched.expect("History required"),
                rng,
            ),
            Self::StickyUnidirectional => sticky_unidirectional(people, rng),
        }
    }
}

fn remove_person<PeerId>(person: &PeerId, people: &mut Vec<PeerId>)
where
    PeerId: Eq,
{
    people.retain(|p| *p != *person);
}
