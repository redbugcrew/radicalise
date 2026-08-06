use std::collections::HashMap;

/// Number of intervals since a pair was matched. Larger means longer ago; a
/// never-matched pair is represented by the absence of an entry.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct IntervalsAgo(pub i64);

/// Pairwise record of how many intervals ago two people were matched for a given
/// peer role. A missing pair means they have never been matched.
#[allow(dead_code)] // Constructed/consumed once the rotated-pairs algorithm uses it.
#[derive(Debug, Clone)]
pub struct MatchHistory<PeerId> {
    last_matched: HashMap<(PeerId, PeerId), IntervalsAgo>,
}

#[allow(dead_code)] // Consumed once the rotated-pairs algorithm uses it.
impl<PeerId> MatchHistory<PeerId>
where
    PeerId: Eq + std::hash::Hash + Clone,
{
    pub fn new() -> Self {
        MatchHistory {
            last_matched: HashMap::new(),
        }
    }

    /// Record that `a` was matched to `b` `intervals_ago` intervals ago,
    /// keeping the most recent (smallest) value for the directed pair.
    pub fn record(&mut self, a: PeerId, b: PeerId, intervals_ago: IntervalsAgo) {
        Self::record_directed(&mut self.last_matched, a, b, intervals_ago);
    }

    /// How many intervals ago `a` and `b` were last matched, if ever.
    pub fn last_matched(&self, a: &PeerId, b: &PeerId) -> Option<IntervalsAgo> {
        self.last_matched.get(&(a.clone(), b.clone())).copied()
    }

    pub fn last_churned_as_peer(&self, peer: &PeerId) -> Option<IntervalsAgo> {
        let most_recent_record = match self.most_recent_record_as_peer(peer) {
            Some(record) => record,
            None => return None,
        };

        let last_person = &most_recent_record.0.0;

        let next_most_recent_record = self
            .last_matched
            .iter()
            .filter(|((record_person, record_peer), _)| {
                record_peer == peer && record_person != last_person
            })
            .min_by_key(|(_, intervals_ago)| *intervals_ago);

        let next_most_recent_record = match next_most_recent_record {
            Some(record) => record,
            None => return None,
        };

        Some(*next_most_recent_record.1)
    }

    pub fn last_peer_matched(&self, person: &PeerId) -> Option<PeerId> {
        self.most_recent_record(person)
            .map(|((_, peer), _)| peer.clone())
            .or(None)
    }

    fn record_directed(
        map: &mut HashMap<(PeerId, PeerId), IntervalsAgo>,
        a: PeerId,
        b: PeerId,
        intervals_ago: IntervalsAgo,
    ) {
        map.entry((a, b))
            .and_modify(|existing| *existing = (*existing).min(intervals_ago))
            .or_insert(intervals_ago);
    }

    fn most_recent_record(&self, person: &PeerId) -> Option<(&(PeerId, PeerId), &IntervalsAgo)> {
        self.last_matched
            .iter()
            .filter(|((a, _), _)| a == person)
            .min_by_key(|(_, intervals_ago)| *intervals_ago)
    }

    fn most_recent_record_as_peer(
        &self,
        peer: &PeerId,
    ) -> Option<(&(PeerId, PeerId), &IntervalsAgo)> {
        self.last_matched
            .iter()
            .filter(|((_, b), _)| b == peer)
            .min_by_key(|(_, intervals_ago)| *intervals_ago)
    }
}

impl<PeerId> Default for MatchHistory<PeerId>
where
    PeerId: Eq + std::hash::Hash + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Last peer matched

    #[test]
    fn returns_empty_with_no_data() {
        let history: MatchHistory<String> = MatchHistory::new();
        assert_eq!(history.last_peer_matched(&"andi".to_string()), None);
    }

    #[test]
    fn returns_peer_for_one_match() {
        let mut history: MatchHistory<String> = MatchHistory::new();

        history.record("andi".to_string(), "bob".to_string(), IntervalsAgo(1));

        assert_eq!(
            history.last_peer_matched(&"andi".to_string()),
            Some("bob".to_string())
        );
    }

    #[test]
    fn returns_most_recent_peer_for_multiple_matches() {
        let mut history: MatchHistory<String> = MatchHistory::new();

        history.record("andi".to_string(), "bob".to_string(), IntervalsAgo(2));
        history.record("andi".to_string(), "carol".to_string(), IntervalsAgo(1));

        assert_eq!(
            history.last_peer_matched(&"andi".to_string()),
            Some("carol".to_string())
        );
    }

    // last_churned_as_peer

    #[test]
    fn last_churned_as_peer_returns_none_with_no_data() {
        let history: MatchHistory<String> = MatchHistory::new();
        assert_eq!(history.last_churned_as_peer(&"bob".to_string()), None);
    }

    #[test]
    fn last_churned_as_peer_returns_none_if_never_churned() {
        let mut history: MatchHistory<String> = MatchHistory::new();
        history.record("andi".to_string(), "bob".to_string(), IntervalsAgo(1));

        assert_eq!(history.last_churned_as_peer(&"bob".to_string()), None);
    }
}
