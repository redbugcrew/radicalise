use super::super::match_results::MatchResults;
use super::helpers::match_history::MatchHistory;
use rand::Rng;
use rand::seq::IndexedRandom;

pub fn sticky_unidirectional<PeerId, R: Rng>(
    people: Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    rng: &mut R,
) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let mut unmatched = people.clone();
    let mut result_chain = Vec::<PeerId>::new();

    let mut person = match select_start_person(&mut unmatched, rng) {
        Some(person) => person,
        None => return MatchResults::new(),
    };
    result_chain.push(person.clone());

    println!("Starting with person: {}", person);

    while let Some(next_person) =
        select_next_person(person.clone(), &mut unmatched, &people, history, rng)
    {
        person = next_person;
        result_chain.push(person.clone());
    }

    MatchResults::from_chain(result_chain)
}

fn select_start_person<PeerId, R: Rng>(unmatched: &mut Vec<PeerId>, rng: &mut R) -> Option<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    return pop_random_person(unmatched, rng);
}

fn select_next_person<PeerId, R: Rng>(
    last_person: PeerId,
    unmatched: &mut Vec<PeerId>,
    all_people: &Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    rng: &mut R,
) -> Option<PeerId>
where
    PeerId: Clone + Eq + std::hash::Hash + Ord,
{
    if let Some(peer) = next_in_previous_chain(last_person.clone(), unmatched, all_people, history)
    {
        return Some(peer);
    }

    return pop_random_person(unmatched, rng);
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

        let result = sticky_unidirectional::<String, _>(vec![], &empty_history(), &mut rng);
        assert!(result.edges().is_empty());
    }

    #[test]
    fn return_empty_matches_if_theres_only_one_person() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result = sticky_unidirectional::<String, _>(
            vec!["andi".to_string()],
            &empty_history(),
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
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [bob], bob: [carol], carol: [dave], dave: [andi]}"
        );
    }
}
