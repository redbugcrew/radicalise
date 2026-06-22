use rand::Rng;
use rand::seq::IndexedRandom;
use std::collections::BTreeMap;

#[derive(Debug)]
struct MatchResults<PeerId> {
    matches: BTreeMap<PeerId, Vec<PeerId>>,
}

impl<PeerId> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Eq + std::hash::Hash + Ord,
{
    fn new() -> Self {
        MatchResults {
            matches: BTreeMap::new(),
        }
    }

    fn to_string(&self) -> String {
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

    fn insert_one(&mut self, person: PeerId, peer: PeerId) {
        self.matches
            .entry(person)
            .or_insert_with(Vec::new)
            .push(peer);
    }

    fn insert_none(&mut self, person: PeerId) {
        self.matches.entry(person).or_insert_with(Vec::new);
    }

    fn contains_key(&self, person: &PeerId) -> bool {
        self.matches.contains_key(person)
    }
}

pub fn match_everyone<PeerId, R: Rng>(people: Vec<PeerId>, rng: &mut R) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let mut unmatched = people.clone();
    let mut results = MatchResults::new();

    for person in &people {
        // If person is already in the results, skip them
        if results.contains_key(person) {
            println!("Already matched person: {:?}, skipping", person);
            continue;
        }

        println!(
            "Matching for person: {:?} from values {:?}",
            person, unmatched
        );

        match find_one_match_for_person(person, &unmatched, rng) {
            Some(peer) => {
                results.insert_one(person.clone(), peer.clone());
                results.insert_one(peer.clone(), person.clone());

                println!(" Matched one, results are {:?}", results.to_string());

                unmatched.retain(|p| *p != *person && *p != peer);
            }
            None => results.insert_none(person.clone()),
        }
    }
    results
}

fn find_one_match_for_person<PeerId, R: Rng>(
    person: &PeerId,
    unmatched: &Vec<PeerId>,
    rng: &mut R,
) -> Option<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord,
{
    let available_peers: Vec<PeerId> = unmatched.iter().filter(|&p| p != person).cloned().collect();
    if available_peers.is_empty() {
        return None;
    }

    let chosen_peer = available_peers.choose(rng).cloned();

    chosen_peer
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand::rngs::SmallRng;

    #[test]
    fn match_everyone_returns_empty_matches_by_default() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result = match_everyone::<String, _>(vec![], &mut rng);
        assert!(result.matches.is_empty());
    }

    #[test]
    fn match_everyone_matches_two_people() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result =
            match_everyone::<String, _>(vec!["andi".to_string(), "bob".to_string()], &mut rng);

        assert_eq!(result.to_string(), "{andi: [bob], bob: [andi]}");
    }

    #[test]
    fn match_everyone_matches_four_people() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result = match_everyone::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [bob], bob: [andi], carol: [dave], dave: [carol]}"
        );
    }
}
