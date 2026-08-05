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
}

impl<PeerId> Default for MatchHistory<PeerId>
where
    PeerId: Eq + std::hash::Hash + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}
