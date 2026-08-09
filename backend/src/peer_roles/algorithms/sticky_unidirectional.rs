use super::super::match_results::MatchResults;
use super::helpers::match_history::MatchHistory;
use rand::Rng;
use rand::seq::IndexedRandom;

pub fn sticky_unidirectional<PeerId, R: Rng>(
    people: Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    _constraint_edges: Option<&[(PeerId, PeerId)]>,
    rng: &mut R,
) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    print!(
        "Running sticky unidirectional algorithm for {} people: ",
        people.len()
    );

    let mut unmatched = people.clone();
    let mut result_chain = Vec::<PeerId>::new();

    let mut person = match select_start_person(&mut unmatched, history, rng) {
        Some(person) => person,
        None => return MatchResults::new(),
    };
    result_chain.push(person.clone());

    println!("Starting with person: {}", person);

    while let Some(next_person) = select_next_person(
        person.clone(),
        &mut unmatched,
        &people,
        history,
        _constraint_edges,
        rng,
    ) {
        person = next_person;
        result_chain.push(person.clone());
    }

    print!(
        "Resulting chain: {}",
        result_chain
            .iter()
            .map(|p| p.to_string())
            .collect::<Vec<String>>()
            .join(" > ")
    );

    MatchResults::from_chain(result_chain)
}

fn select_start_person<PeerId, R: Rng>(
    unmatched: &mut Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    rng: &mut R,
) -> Option<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let candidates = only_people_in_last_round(history, unmatched);

    let chosen = if candidates.is_empty() {
        unmatched.choose(rng).clone()
    } else {
        candidates.choose(rng).clone()
    };

    let chosen = match chosen {
        Some(person) => person.clone(),
        None => return None,
    };

    pop_specific_person(unmatched, chosen)
}

fn select_next_person<PeerId, R: Rng>(
    last_person: PeerId,
    unmatched: &mut Vec<PeerId>,
    all_people: &Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    constraint_edges: Option<&[(PeerId, PeerId)]>,
    rng: &mut R,
) -> Option<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash + Ord,
{
    if let Some(peer) = next_in_previous_chain(last_person.clone(), unmatched, all_people, history)
    {
        if !is_constrained_match(&last_person, &peer, constraint_edges) {
            return Some(peer);
        }
    }

    let allowed: Vec<PeerId> = unmatched
        .iter()
        .filter(|person| !is_constrained_match(&last_person, person, constraint_edges))
        .cloned()
        .collect();

    let chosen = allowed.choose(rng).cloned()?;
    pop_specific_person(unmatched, chosen)
}

fn next_in_previous_chain<PeerId>(
    last_person: PeerId,
    unmatched: &mut Vec<PeerId>,
    all_people: &Vec<PeerId>,
    history: &MatchHistory<PeerId>,
) -> Option<PeerId>
where
    PeerId: Eq + std::hash::Hash + Clone,
{
    let previous_peer = match history.last_peer_matched(&last_person) {
        Some(peer) => peer,
        None => return None,
    };

    if unmatched.contains(&previous_peer) {
        return pop_specific_person(unmatched, previous_peer);
    } else {
        if !all_people.contains(&previous_peer) {
            return next_in_previous_chain(previous_peer, unmatched, all_people, history);
        }
    }

    None
}

fn pop_random_person<PeerId, R: Rng>(people: &mut Vec<PeerId>, rng: &mut R) -> Option<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash,
{
    let person = people.choose(rng);
    if let Some(person) = person {
        let person = person.clone();
        people.retain(|p| p != &person);
        Some(person)
    } else {
        None
    }
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

fn only_people_in_last_round<PeerId>(
    history: &MatchHistory<PeerId>,
    unmatched: &mut Vec<PeerId>,
) -> Vec<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash,
{
    let candidates: Vec<PeerId> = unmatched
        .iter()
        .filter(|person| history.has_match_in_previous_interval(person))
        .cloned()
        .collect();

    candidates
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

    fn from_circle(circle: &str) -> String {
        let parts: Vec<&str> = circle.split('>').map(|s| s.trim()).collect();
        let mut result = String::from("{");
        for i in 0..parts.len() {
            let a = parts[i];
            let b = parts[(i + 1) % parts.len()];
            result.push_str(&format!("{}: [{}]", a, b));
            if i < parts.len() - 1 {
                result.push_str(", ");
            }
        }
        result.push('}');
        result
    }

    #[test]
    fn returns_empty_matches_by_default() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result = sticky_unidirectional::<String, _>(vec![], &empty_history(), None, &mut rng);
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
        );
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
        );

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
        );

        assert_eq!(
            result.to_string(),
            "{andi: [dave], bob: [carol], carol: [andi], dave: [bob]}"
        );
    }

    #[test]
    fn preserves_existing_relationships_in_circle() {
        let mut rng = SmallRng::seed_from_u64(3);

        let history = parse_circles(
            r#"
                andi > bob > fred > carol > dave
            "#,
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
        );

        assert_eq!(result.to_string(), from_circle("andi > bob > carol > dave"));
    }

    #[test]
    fn inserts_new_person_gracefully() {
        let mut rng = SmallRng::seed_from_u64(3); // starting with andi

        let history = parse_circles(
            r#"
                bob > carol > dave
            "#,
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
        );

        assert_eq!(
            result.to_string(),
            "{andi: [carol], bob: [andi], carol: [dave], dave: [bob]}"
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
        );

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
}
