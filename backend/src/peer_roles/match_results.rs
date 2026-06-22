use std::collections::BTreeMap;

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

    pub fn is_empty(&self) -> bool {
        self.matches.is_empty()
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
