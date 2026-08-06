use crate::peer_roles::algorithms::IntervalsAgo;

use super::super::match_results::MatchResults;
use super::helpers::match_history::MatchHistory;
use rand::Rng;
use rand::seq::IndexedRandom;
use std::collections::VecDeque;

pub fn sticky_unidirectional<PeerId, R: Rng>(
    people: Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    rng: &mut R,
) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let churn_data = people_intervals_since_churned(people.clone(), history);

    // Print the churn data
    println!("History: {:?}", history);
    println!("Churn data: {:?}", churn_data);

    let mut unmatched = VecDeque::from(people);
    let mut result_chain = Vec::<PeerId>::new();

    let mut last_person = match unmatched.pop_front() {
        Some(person) => person,
        None => return MatchResults::new(),
    };
    result_chain.push(last_person.clone());

    while let Some(person) = select_next_person(last_person.clone(), &mut unmatched, history) {
        println!("Selected person: {:?}", person);
        last_person = person;
        result_chain.push(last_person.clone());
    }

    MatchResults::from_chain(result_chain)
}

fn select_next_person<PeerId>(
    last_person: PeerId,
    unmatched: &mut VecDeque<PeerId>,
    history: &MatchHistory<PeerId>,
) -> Option<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let previous_peer = history.last_peer_matched(&last_person);
    println!("Previous peer for {:?}: {:?}", last_person, previous_peer);

    // If previous peer is in the unmatches list then return it
    if let Some(peer) = previous_peer {
        if unmatched.contains(&peer) {
            unmatched.retain(|p| p != &peer);
            return Some(peer);
        }
    }

    // Otherwise return the next person in the unmatched list
    unmatched.pop_front()
}

fn person_recently_churned<PeerId, R: Rng>(
    people: Vec<PeerId>,
    churn_data: &Vec<(PeerId, IntervalsAgo)>,
    rng: &mut R,
) -> Option<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let people = people_recently_churned(people, churn_data);
    let person = people.choose(rng);
    person.cloned()
}

fn people_recently_churned<PeerId>(
    people: Vec<PeerId>,
    churn_data: &Vec<(PeerId, IntervalsAgo)>,
) -> Vec<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let people_churn_data = churn_data
        .iter()
        .filter(|(p, _)| people.contains(p))
        .cloned()
        .collect::<Vec<_>>();

    let min_interval = match people_churn_data
        .iter()
        .map(|(_, interval)| *interval)
        .min()
    {
        Some(interval) => interval,
        None => return people,
    };

    let recently_churned_people: Vec<PeerId> = people_churn_data
        .into_iter()
        .filter(|(_, interval)| *interval == min_interval)
        .map(|(p, _)| p)
        .collect();

    if recently_churned_people.is_empty() {
        people
    } else {
        recently_churned_people
    }
}

fn people_intervals_since_churned<PeerId>(
    people: Vec<PeerId>,
    history: &MatchHistory<PeerId>,
) -> Vec<(PeerId, IntervalsAgo)>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    people
        .into_iter()
        .map(|p| {
            let intervals_ago = history
                .last_churned_as_peer(&p)
                .unwrap_or(IntervalsAgo(i64::MAX));
            (p, intervals_ago)
        })
        .collect()
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
    fn preserves_all_existing_relationships() {
        let mut rng = SmallRng::seed_from_u64(0);

        let history = parse_circles(
            r#"
                andi > bob > fred > carol > dave
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
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [bob], bob: [carol], carol: [dave], dave: [andi]}"
        );
    }
}
