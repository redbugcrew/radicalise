use rand::Rng;
use rand::seq::IteratorRandom;

use super::super::match_results::MatchResults;
use super::MatchHistory;
use super::remove_person;

pub fn rotated_pairs<PeerId, R: Rng>(
    people: Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    rng: &mut R,
) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let mut unmatched = people.clone();
    let mut results = MatchResults::new();
    let mut last_peer = None;

    while unmatched.len() >= 2 {
        let person = unmatched.iter().choose(rng).cloned().unwrap();
        remove_person(&person, &mut unmatched);

        let peer = least_recent_match(&person, &unmatched, history, rng).unwrap();
        remove_person(&peer, &mut unmatched);

        results.insert_reciprocal(person, peer.clone());
        last_peer = Some(peer);
    }

    if let Some(person) = unmatched.into_iter().next() {
        match &last_peer {
            Some(peer) => results.join_group(peer.clone(), person),
            None => results.insert_none(person),
        }
    }

    results
}

/// Pick the peer that `person` least recently matched with. People never matched
/// with count as least recent; ties are broken randomly.
fn least_recent_match<PeerId, R: Rng>(
    person: &PeerId,
    candidates: &[PeerId],
    history: &MatchHistory<PeerId>,
    rng: &mut R,
) -> Option<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash,
{
    let least_recent = candidates
        .iter()
        .map(|p| history.last_matched(person, p))
        .min_by_key(|last| last.unwrap_or(i64::MIN))?;

    candidates
        .iter()
        .filter(|&p| history.last_matched(person, p) == least_recent)
        .choose(rng)
        .cloned()
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand::rngs::SmallRng;

    #[test]
    fn returns_empty_matches_by_default() {
        let mut rng = SmallRng::seed_from_u64(0);
        let history = MatchHistory::<String>::new();

        let result = rotated_pairs::<String, _>(vec![], &history, &mut rng);
        assert!(result.edges().is_empty());
    }

    #[test]
    fn return_empty_matches_if_theres_only_one_person() {
        let mut rng = SmallRng::seed_from_u64(0);
        let history = MatchHistory::<String>::new();

        let result = rotated_pairs::<String, _>(vec!["andi".to_string()], &history, &mut rng);
        assert!(result.edges().is_empty());
    }

    #[test]
    fn matches_two_people_with_no_history() {
        let mut rng = SmallRng::seed_from_u64(0);
        let history = MatchHistory::<String>::new();

        let result = rotated_pairs::<String, _>(
            vec!["andi".to_string(), "bob".to_string()],
            &history,
            &mut rng,
        );

        assert_eq!(result.to_string(), "{andi: [bob], bob: [andi]}");
    }

    #[test]
    fn matches_four_people() {
        let mut rng = SmallRng::seed_from_u64(0);
        let history = MatchHistory::<String>::new();

        let result = rotated_pairs::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &history,
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [dave], bob: [carol], carol: [bob], dave: [andi]}"
        );
    }

    #[test]
    fn matches_odd_number_of_people() {
        let mut rng = SmallRng::seed_from_u64(0);
        let history = MatchHistory::<String>::new();

        let result = rotated_pairs::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dana".to_string(),
                "eve".to_string(),
            ],
            &history,
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [dana, eve], bob: [carol], carol: [bob], dana: [andi, eve], eve: [andi, dana]}"
        );
    }

    #[test]
    fn picks_older_pair_first() {
        let mut rng = SmallRng::seed_from_u64(0);
        let mut history = MatchHistory::<String>::new();

        history.record("andi".to_string(), "bob".to_string(), 3);
        history.record("andi".to_string(), "carol".to_string(), 1);
        history.record("andi".to_string(), "dave".to_string(), 2);

        let result = rotated_pairs::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &history,
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [carol], bob: [dave], carol: [andi], dave: [bob]}"
        );
    }

    #[test]
    fn picks_never_matched_pair_first() {
        let mut rng = SmallRng::seed_from_u64(3); // picks andi first
        let mut history = MatchHistory::<String>::new();

        history.record("andi".to_string(), "carol".to_string(), 1);
        history.record("andi".to_string(), "dave".to_string(), 2);

        let result = rotated_pairs::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &history,
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [bob], bob: [andi], carol: [dave], dave: [carol]}"
        );
    }
}
