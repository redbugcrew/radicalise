use std::collections::HashMap;

/// Pairwise record of the most recent interval in which two people were matched
/// for a given peer role. A missing pair means they have never been matched.
#[allow(dead_code)] // Constructed/consumed once the rotated-pairs algorithm uses it.
#[derive(Debug, Clone)]
pub struct MatchHistory<PeerId> {
    last_matched: HashMap<(PeerId, PeerId), i64>,
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

    /// Record that `a` and `b` were matched in `interval_id`, keeping the most
    /// recent (highest) interval for the pair. Stored symmetrically.
    pub fn record(&mut self, a: PeerId, b: PeerId, interval_id: i64) {
        Self::record_directed(&mut self.last_matched, a.clone(), b.clone(), interval_id);
        Self::record_directed(&mut self.last_matched, b, a, interval_id);
    }

    /// The interval in which `a` and `b` were last matched, if ever.
    pub fn last_matched(&self, a: &PeerId, b: &PeerId) -> Option<i64> {
        self.last_matched.get(&(a.clone(), b.clone())).copied()
    }

    pub fn last_peer_matched(&self, person: &PeerId) -> Option<PeerId> {
        self.most_recent_record(person)
            .map(|((_, peer), _)| peer.clone())
            .or(None)
    }

    fn record_directed(
        map: &mut HashMap<(PeerId, PeerId), i64>,
        a: PeerId,
        b: PeerId,
        interval_id: i64,
    ) {
        map.entry((a, b))
            .and_modify(|existing| *existing = (*existing).max(interval_id))
            .or_insert(interval_id);
    }

    fn most_recent_record(&self, person: &PeerId) -> Option<(&(PeerId, PeerId), &i64)> {
        self.last_matched
            .iter()
            .filter(|((a, _), _)| a == person)
            .max_by_key(|(_, interval)| *interval)
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

        history.record("andi".to_string(), "bob".to_string(), 1);

        assert_eq!(
            history.last_peer_matched(&"andi".to_string()),
            Some("bob".to_string())
        );
    }

    #[test]
    fn returns_most_recent_peer_for_multiple_matches() {
        let mut history: MatchHistory<String> = MatchHistory::new();

        history.record("andi".to_string(), "bob".to_string(), 1);
        history.record("andi".to_string(), "carol".to_string(), 2);

        assert_eq!(
            history.last_peer_matched(&"andi".to_string()),
            Some("carol".to_string())
        );
    }
}
