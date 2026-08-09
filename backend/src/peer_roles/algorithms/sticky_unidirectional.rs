use super::super::match_results::MatchResults;
use super::helpers::match_history::{IntervalsAgo, MatchHistory};
use rand::Rng;
use rand::seq::SliceRandom;

const MAX_SEARCH_NODES: usize = 1_000_000;

pub fn sticky_unidirectional<PeerId, R: Rng>(
    people: Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    constraint_edges: Option<&[(PeerId, PeerId)]>,
    rng: &mut R,
) -> Result<MatchResults<PeerId>, super::PairingAlgorithmError>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    if people.len() <= 1 {
        return Ok(MatchResults::new());
    }

    let start_candidates = ordered_start_candidates(&people, history, rng);

    let mut best_cycle: Option<Vec<PeerId>> = None;
    let mut best_score: usize = 0;
    let mut visited: usize = 0;

    for start in start_candidates {
        let mut unmatched: Vec<PeerId> = people
            .iter()
            .filter(|p| *p != &start)
            .cloned()
            .collect();
        let mut path = vec![start.clone()];

        build_best_cycle(
            &start,
            &mut path,
            &mut unmatched,
            history,
            constraint_edges,
            rng,
            &mut best_cycle,
            &mut best_score,
            &mut visited,
        );

        if visited > MAX_SEARCH_NODES {
            break;
        }

        if best_score == people.len() {
            break;
        }
    }

    match best_cycle {
        Some(cycle) => Ok(MatchResults::from_chain(cycle)),
        None => Err(super::PairingAlgorithmError::ConstraintViolation(
            "Could not build a valid cycle".to_string(),
        )),
    }
}

fn ordered_start_candidates<PeerId, R: Rng>(
    people: &[PeerId],
    history: &MatchHistory<PeerId>,
    rng: &mut R,
) -> Vec<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let mut with_history: Vec<PeerId> = people
        .iter()
        .filter(|p| history.has_match_in_previous_interval(p))
        .cloned()
        .collect();
    let mut without_history: Vec<PeerId> = people
        .iter()
        .filter(|p| !history.has_match_in_previous_interval(p))
        .cloned()
        .collect();

    with_history.shuffle(rng);
    without_history.shuffle(rng);

    with_history.extend(without_history);
    with_history
}

fn build_best_cycle<PeerId, R: Rng>(
    first_person: &PeerId,
    path: &mut Vec<PeerId>,
    unmatched: &mut Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    constraint_edges: Option<&[(PeerId, PeerId)]>,
    rng: &mut R,
    best_cycle: &mut Option<Vec<PeerId>>,
    best_score: &mut usize,
    visited: &mut usize,
) -> bool
where
    PeerId: Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    *visited += 1;
    if *visited > MAX_SEARCH_NODES {
        return false;
    }

    if unmatched.is_empty() {
        let last = path.last().unwrap();
        if !is_constrained_match(last, first_person, constraint_edges) {
            let score = historical_edges_in_cycle(path, first_person, history);
            if score >= *best_score {
                *best_score = score;
                *best_cycle = Some(path.clone());
            }
        }
        return true;
    }

    let current_score = historical_edges_in_path(path, history);
    let remaining_steps = unmatched.len() + 1;
    if current_score + remaining_steps <= *best_score {
        return true;
    }

    let last = path.last().unwrap().clone();
    let candidates = ordered_candidates(
        &last,
        unmatched,
        history,
        constraint_edges,
        rng,
    );

    for candidate in candidates {
        path.push(candidate.clone());
        pop_specific_person(unmatched, candidate.clone());

        if !build_best_cycle(
            first_person,
            path,
            unmatched,
            history,
            constraint_edges,
            rng,
            best_cycle,
            best_score,
            visited,
        ) {
            path.pop();
            unmatched.push(candidate);
            return false;
        }

        path.pop();
        unmatched.push(candidate);
    }

    true
}

fn ordered_candidates<PeerId, R: Rng>(
    last_person: &PeerId,
    unmatched: &[PeerId],
    history: &MatchHistory<PeerId>,
    constraint_edges: Option<&[(PeerId, PeerId)]>,
    rng: &mut R,
) -> Vec<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let mut from_last_interval: Vec<PeerId> = Vec::new();
    let mut others: Vec<PeerId> = Vec::new();

    for person in unmatched {
        if is_constrained_match(last_person, person, constraint_edges) {
            continue;
        }

        if history.last_matched(last_person, person) == Some(IntervalsAgo(1)) {
            from_last_interval.push(person.clone());
        } else {
            others.push(person.clone());
        }
    }

    from_last_interval.shuffle(rng);
    others.shuffle(rng);

    from_last_interval.extend(others);
    from_last_interval
}

fn historical_edges_in_cycle<PeerId>(
    path: &[PeerId],
    first_person: &PeerId,
    history: &MatchHistory<PeerId>,
) -> usize
where
    PeerId: Clone + Eq + std::hash::Hash,
{
    let mut count = historical_edges_in_path(path, history);
    if path.len() >= 2
        && history.last_matched(path.last().unwrap(), first_person) == Some(IntervalsAgo(1))
    {
        count += 1;
    }
    count
}

fn historical_edges_in_path<PeerId>(
    path: &[PeerId],
    history: &MatchHistory<PeerId>,
) -> usize
where
    PeerId: Clone + Eq + std::hash::Hash,
{
    if path.len() < 2 {
        return 0;
    }
    path.windows(2)
        .filter(|w| history.last_matched(&w[0], &w[1]) == Some(IntervalsAgo(1)))
        .count()
}

fn is_constrained_match<PeerId>(
    last_person: &PeerId,
    candidate: &PeerId,
    constraint_edges: Option<&[(PeerId, PeerId)]>,
) -> bool
where
    PeerId: Eq + std::hash::Hash,
{
    let Some(edges) = constraint_edges else {
        return false;
    };

    edges
        .iter()
        .any(|(a, b)| a == last_person && b == candidate || a == candidate && b == last_person)
}

fn pop_specific_person<PeerId>(people: &mut Vec<PeerId>, person: PeerId) -> Option<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash,
{
    if people.contains(&person) {
        people.retain(|p| p != &person);
        Some(person)
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use crate::peer_roles::algorithms::IntervalsAgo;

    use super::*;
    use rand::SeedableRng;
    use rand::rngs::SmallRng;

    fn empty_history() -> MatchHistory<String> {
        MatchHistory::new()
    }

    pub fn add_circle_to_history(
        history: &mut MatchHistory<String>,
        circle: Vec<&str>,
        intervals_ago: IntervalsAgo,
    ) {
        for i in 0..circle.len() {
            let a = circle[i].to_string();
            let b = circle[(i + 1) % circle.len()].to_string();
            history.record(a, b, intervals_ago);
        }
    }

    #[allow(dead_code)] // Kept for future tests; current tests build history directly.
    fn parse_circles(data: &str) -> MatchHistory<String> {
        let mut history = MatchHistory::new();
        let lines = data
            .lines()
            .map(|line| line.trim())
            .filter(|line| !line.is_empty());

        for (index, line) in lines.enumerate() {
            let parts: Vec<&str> = line.split('>').map(|s| s.trim()).collect();
            let intervals_ago = IntervalsAgo(index as i64);

            add_circle_to_history(&mut history, parts, intervals_ago);
        }

        history
    }

    #[test]
    fn returns_empty_matches_by_default() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result =
            sticky_unidirectional::<String, _>(vec![], &empty_history(), None, &mut rng).unwrap();
        assert!(result.edges().is_empty());
    }

    #[test]
    fn return_empty_matches_if_theres_only_one_person() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result = sticky_unidirectional::<String, _>(
            vec!["andi".to_string()],
            &empty_history(),
            None,
            &mut rng,
        )
        .unwrap();
        assert!(result.edges().is_empty());
    }

    #[test]
    fn matches_two_people_with_no_history() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result = sticky_unidirectional::<String, _>(
            vec!["andi".to_string(), "bob".to_string()],
            &empty_history(),
            None,
            &mut rng,
        )
        .unwrap();

        assert_eq!(result.to_string(), "{andi: [bob], bob: [andi]}");
    }

    #[test]
    fn matches_four_people_with_no_history() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result = sticky_unidirectional::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &empty_history(),
            None,
            &mut rng,
        )
        .unwrap();

        let people_in_result: std::collections::HashSet<String> = result
            .edges()
            .iter()
            .flat_map(|(a, b)| vec![a.clone(), b.clone()])
            .collect();

        assert_eq!(people_in_result.len(), 4);
        assert!(people_in_result.contains("andi"));
        assert!(people_in_result.contains("bob"));
        assert!(people_in_result.contains("carol"));
        assert!(people_in_result.contains("dave"));
    }

    #[test]
    fn preserves_existing_relationships_in_circle() {
        let mut rng = SmallRng::seed_from_u64(3);

        let mut history = empty_history();
        add_circle_to_history(
            &mut history,
            vec!["andi", "bob", "fred", "carol", "dave"],
            IntervalsAgo(1),
        );

        let result = sticky_unidirectional::<String, _>(
            vec![
                "andi".to_string(),
                "carol".to_string(),
                "bob".to_string(),
                "dave".to_string(),
            ],
            &history,
            None,
            &mut rng,
        )
        .unwrap();

        let edges: std::collections::HashSet<(String, String)> =
            result.edges().iter().cloned().collect();

        // Historical edges among current people: andi>bob, carol>dave, dave>andi.
        // Because fred is missing, a 4-cycle cannot keep all three, but it
        // should keep as many as possible (at least two).
        let historical_edges = [
            ("andi".to_string(), "bob".to_string()),
            ("carol".to_string(), "dave".to_string()),
            ("dave".to_string(), "andi".to_string()),
        ];

        let preserved = historical_edges
            .iter()
            .filter(|edge| edges.contains(edge))
            .count();

        assert!(
            preserved >= 2,
            "Expected at least 2 historical edges to be preserved, got {} in {}",
            preserved,
            result.to_string()
        );
    }

    #[test]
    fn inserts_new_person_gracefully() {
        let mut rng = SmallRng::seed_from_u64(3); // starting with andi

        let mut history = empty_history();
        add_circle_to_history(
            &mut history,
            vec!["bob", "carol", "dave"],
            IntervalsAgo(1),
        );

        let result = sticky_unidirectional::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &history,
            None,
            &mut rng,
        )
        .unwrap();

        let people_in_result: std::collections::HashSet<String> = result
            .edges()
            .iter()
            .flat_map(|(a, b)| vec![a.clone(), b.clone()])
            .collect();

        assert!(people_in_result.contains("andi"), "New person andi should be matched");

        let edges: std::collections::HashSet<(String, String)> =
            result.edges().iter().cloned().collect();

        // Historical edges among current people: bob>carol, carol>dave, dave>bob.
        let historical_edges = [
            ("bob".to_string(), "carol".to_string()),
            ("carol".to_string(), "dave".to_string()),
            ("dave".to_string(), "bob".to_string()),
        ];

        let preserved = historical_edges
            .iter()
            .filter(|edge| edges.contains(edge))
            .count();

        assert!(
            preserved >= 2,
            "Expected at least 2 historical edges to be preserved, got {} in {}",
            preserved,
            result.to_string()
        );
    }

    #[test]
    fn avoids_matching_pairs_from_constraint_edges() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result = sticky_unidirectional::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &empty_history(),
            Some(&[
                ("andi".to_string(), "dave".to_string()),
                ("dave".to_string(), "andi".to_string()),
            ]),
            &mut rng,
        )
        .unwrap();

        // Without constraints this seed produces andi > dave > bob > carol.
        // We want to make sure andi and dave are not matched to each other.
        for (person, peer) in result.edges() {
            assert!(
                !((person == "andi" && peer == "dave") || (person == "dave" && peer == "andi")),
                "Expected constraint edge andi-dave to be avoided, got {} -> {}",
                person,
                peer
            );
        }
    }

    #[test]
    fn avoids_constrained_cycle_close() {
        // Seed 7 used to build andi > bob > dave > carol and then fail because
        // the closing edge carol > andi was constrained. With retries the
        // algorithm should find a valid cycle that avoids the constraint.
        let mut rng = SmallRng::seed_from_u64(7);

        let result = sticky_unidirectional::<String, _>(
            vec![
                "andi".to_string(),
                "bob".to_string(),
                "carol".to_string(),
                "dave".to_string(),
            ],
            &empty_history(),
            Some(&[
                ("andi".to_string(), "carol".to_string()),
                ("carol".to_string(), "andi".to_string()),
            ]),
            &mut rng,
        )
        .unwrap();

        for (person, peer) in result.edges() {
            assert!(
                !((person == "andi" && peer == "carol")
                    || (person == "carol" && peer == "andi")),
                "Expected constraint edge andi-carol to be avoided, got {} -> {}",
                person,
                peer
            );
        }
    }

    #[test]
    fn retries_find_valid_cycle_when_first_attempt_strands_people() {
        // Two triangles (a,b,c) and (d,e,f) joined by limited cross-edges.
        // Valid cycles exist, e.g. a > d > b > e > c > f > a, but some
        // greedy choices can strand people. Retries should find a valid cycle.
        let mut rng = SmallRng::seed_from_u64(1);

        let result = sticky_unidirectional::<String, _>(
            vec![
                "a".to_string(),
                "b".to_string(),
                "c".to_string(),
                "d".to_string(),
                "e".to_string(),
                "f".to_string(),
            ],
            &empty_history(),
            Some(&[
                ("a".to_string(), "b".to_string()),
                ("b".to_string(), "a".to_string()),
                ("b".to_string(), "c".to_string()),
                ("c".to_string(), "b".to_string()),
                ("a".to_string(), "c".to_string()),
                ("c".to_string(), "a".to_string()),
                ("d".to_string(), "e".to_string()),
                ("e".to_string(), "d".to_string()),
                ("e".to_string(), "f".to_string()),
                ("f".to_string(), "e".to_string()),
                ("d".to_string(), "f".to_string()),
                ("f".to_string(), "d".to_string()),
                ("c".to_string(), "d".to_string()),
                ("d".to_string(), "c".to_string()),
            ]),
            &mut rng,
        )
        .unwrap();

        let people_in_result: std::collections::HashSet<String> = result
            .edges()
            .iter()
            .flat_map(|(a, b)| vec![a.clone(), b.clone()])
            .collect();

        let missing: Vec<&str> = ["a", "b", "c", "d", "e", "f"]
            .into_iter()
            .filter(|person| !people_in_result.contains(*person))
            .collect();

        assert!(
            missing.is_empty(),
            "Expected all people to be matched, but missing {:?}: {}",
            missing,
            result.to_string()
        );
    }
}
