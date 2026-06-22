use rand::seq::IndexedRandom;
use std::collections::HashMap;

struct MatchResults<PeerId> {
    matches: HashMap<PeerId, Vec<PeerId>>,
}

impl<PeerId> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Eq + std::hash::Hash,
{
    fn new() -> Self {
        MatchResults {
            matches: HashMap::new(),
        }
    }

    fn to_string(&self) -> String {
        let mut result = String::from("{");
        for (person, matches) in &self.matches {
            let matches_str = matches
                .iter()
                .map(|m| m.to_string())
                .collect::<Vec<String>>()
                .join(", ");
            result.push_str(&format!("{}: [{}], ", person, matches_str));
        }
        result.push('}');
        result
    }

    fn insert(&mut self, person: PeerId, peers: Vec<PeerId>) {
        self.matches.insert(person, peers);
    }
}

pub fn match_everyone<PeerId>(people: Vec<PeerId>) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash,
{
    let mut unmatched = people.clone();
    let mut results = MatchResults::new();

    for person in &people {
        let peer = find_one_match_for_person(person, &mut unmatched);
        results.insert(person.clone(), peer.into_iter().collect());
    }
    results
}

fn find_one_match_for_person<PeerId>(person: &PeerId, unmatched: &mut Vec<PeerId>) -> Option<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash,
{
    // Randomly select a peer from the unmatched list, excluding the person themselves
    let mut rng = rand::rng();
    let available_peers: Vec<PeerId> = unmatched.iter().filter(|&p| p != person).cloned().collect();
    if available_peers.is_empty() {
        return None;
    }

    let chosen_peer = available_peers.choose(&mut rng).cloned();

    // Remove the chosen peer from the unmatched list
    if let Some(peer) = &chosen_peer {
        unmatched.retain(|p| p != peer);
    }

    chosen_peer
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn match_everyone_returns_empty_matches_by_default() {
        let result = match_everyone::<String>(vec![]);
        assert!(result.matches.is_empty());
    }

    #[test]
    fn match_everyone_matches_two_people() {
        let result = match_everyone::<String>(vec!["andi".to_string(), "bob".to_string()]);

        assert_eq!(result.to_string(), "{andi: [bob], bob: [andi]}");
    }
}
