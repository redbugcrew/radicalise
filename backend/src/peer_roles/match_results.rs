use std::collections::{BTreeMap, VecDeque};

#[derive(Debug)]
pub struct MatchResults<PeerId> {
    matches: BTreeMap<PeerId, Vec<PeerId>>,
}

impl<PeerId> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Eq + std::hash::Hash + Ord + std::fmt::Debug + Clone,
{
    pub fn new() -> Self {
        MatchResults {
            matches: BTreeMap::new(),
        }
    }

    pub fn from_chain(chain: Vec<PeerId>) -> Self {
        let mut result = MatchResults::new();

        if chain.len() < 2 {
            return result;
        }

        let mut unprocessed = VecDeque::from(chain);
        let mut person = unprocessed.pop_front();
        let first_person = person.clone();

        while let Some(current) = person.clone() {
            if let Some(next) = unprocessed.pop_front() {
                result.insert_one(current.clone(), next.clone());
                person = Some(next.clone());
            } else {
                break;
            }
        }

        if let Some(last) = person {
            if let Some(first) = first_person {
                result.insert_one(last.clone(), first.clone());
            }
        }

        result
    }

    pub fn to_string(&self) -> String {
        let entries: Vec<String> = self
            .matches
            .iter()
            .map(|(person, matches)| {
                let matches_str = matches
                    .iter()
                    .map(|m| m.to_string())
                    .collect::<Vec<String>>()
                    .join(", ");
                format!("{}: [{}]", person, matches_str)
            })
            .collect();
        format!("{{{}}}", entries.join(", "))
    }

    pub fn insert_reciprocal(&mut self, person: PeerId, peer: PeerId) {
        self.insert_one(person.clone(), peer.clone());
        self.insert_one(peer, person);
    }

    pub fn join_group(&mut self, person: PeerId, peer: PeerId) {
        let group = self.group_members(&person);

        for member in group {
            self.insert_reciprocal(member.clone(), peer.clone());
        }
    }

    pub fn contains_key(&self, person: &PeerId) -> bool {
        self.matches.contains_key(person)
    }

    pub fn edges(&self) -> Vec<(PeerId, PeerId)> {
        self.matches
            .iter()
            .flat_map(|(person, peers)| {
                peers.iter().map(move |peer| (person.clone(), peer.clone()))
            })
            .collect()
    }

    pub fn insert_one(&mut self, person: PeerId, peer: PeerId) {
        self.matches
            .entry(person)
            .or_insert_with(Vec::new)
            .push(peer);
    }

    pub fn insert_none(&mut self, person: PeerId) {
        self.matches.entry(person).or_insert_with(Vec::new);
    }

    fn group_members(&self, person: &PeerId) -> Vec<PeerId> {
        match self.matches.get(person) {
            Some(members) => {
                let mut result = vec![person.clone()];
                result.extend(members.clone());
                result
            }
            None => vec![person.clone()],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // from_chain

    #[test]
    fn from_chain_does_nothing_with_one_person() {
        let result = MatchResults::from_chain(vec!["andi".to_string()]);
        assert!(result.edges().is_empty());
    }

    #[test]
    fn from_chain_matches_two_people() {
        let result = MatchResults::from_chain(vec!["andi".to_string(), "bob".to_string()]);
        assert_eq!(result.to_string(), "{andi: [bob], bob: [andi]}");
    }
}
