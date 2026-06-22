use rand::Rng;
use rand::seq::IndexedRandom;

use super::super::match_results::MatchResults;

pub fn random_pairs<PeerId, R: Rng>(people: Vec<PeerId>, rng: &mut R) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let mut unmatched = people.clone();
    let mut results = MatchResults::new();

    for person in &people {
        // If person is already in the results, skip them
        if results.contains_key(person) {
            continue;
        }

        match find_one_match_for_person(person, &unmatched, rng) {
            Some(peer) => {
                results.insert_reciprocal(person.clone(), peer.clone());
                unmatched.retain(|p| *p != peer);
            }
            None => {
                println!(
                    " No match found for person: {:?}, this person to an existing pair",
                    person
                );
                match people.choose(rng).cloned() {
                    Some(existing_peer) => {
                        results.join_group(existing_peer.clone(), person.clone());
                    }
                    None => {
                        results.insert_none(person.clone());
                    }
                }
            }
        }
        unmatched.retain(|p| *p != *person);
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
    fn returns_empty_matches_by_default() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result = random_pairs::<String, _>(vec![], &mut rng);
        assert!(result.is_empty());
    }

    #[test]
    fn matches_two_people() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result =
            random_pairs::<String, _>(vec!["andi".to_string(), "bob".to_string()], &mut rng);

        assert_eq!(result.to_string(), "{andi: [bob], bob: [andi]}");
    }

    #[test]
    fn matches_four_people() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result = random_pairs::<String, _>(
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

    #[test]
    fn matches_odd_number_of_people() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result = random_pairs::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dana".to_string(),
                "eve".to_string(),
            ],
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [carol], bob: [dana, eve], carol: [andi], dana: [bob, eve], eve: [bob, dana]}"
        );
    }
}
