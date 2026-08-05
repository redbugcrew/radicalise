use super::super::match_results::MatchResults;
use super::helpers::match_history::MatchHistory;
use rand::Rng;
use std::collections::VecDeque;

pub fn sticky_unidirectional<PeerId, R: Rng>(
    people: Vec<PeerId>,
    history: &MatchHistory<PeerId>,
    _rng: &mut R,
) -> MatchResults<PeerId>
where
    PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
{
    let mut unmatched = VecDeque::from(people);
    let mut result_chain = Vec::<PeerId>::new();

    while unmatched.len() >= 1 {
        let person = unmatched.pop_front().unwrap();
        result_chain.push(person);
    }

    MatchResults::from_chain(result_chain)
}

// fn people_recently_churned<PeerId>(
//     people: Vec<PeerId>,
//     history: &IntervalLastMatched<PeerId>,
// ) -> Vec<PeerId>
// where
//     PeerId: std::fmt::Display + Clone + Eq + std::hash::Hash + Ord + std::fmt::Debug,
// {
//     people
//         .into_iter()
//         .filter_map(|person| history.last_peer_matched(&person))
//         .collect()
// }

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand::rngs::SmallRng;

    fn empty_history() -> MatchHistory<String> {
        MatchHistory::new()
    }

    pub fn parse(data: &str) -> MatchHistory<String> {
        let mut history = MatchHistory::new();

        for line in data.lines() {
            let parts: Vec<&str> = line.split("->").collect();
            if parts.len() != 2 {
                continue;
            }
            let a = parts[0].trim().to_string();
            let rest: Vec<&str> = parts[1].split(':').collect();
            if rest.len() != 2 {
                continue;
            }
            let b = rest[0].trim().to_string();
            if let Ok(interval_id) = rest[1].trim().parse::<i64>() {
                history.record(a, b, interval_id);
            }
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
            "{andi: [bob], bob: [carol], carol: [dave], dave: [andi]}"
        );
    }

    #[test]
    fn starts_from_person_recently_churned() {
        let mut rng = SmallRng::seed_from_u64(0);

        let history = parse(
            r#"
                andi->bob: 1
                andi->bob: 2
                bob->carol: 1
                bob->fred: 2
                carol->dave: 1
                carol->dave: 2
                dave->andi: 1
                dave->andi: 2
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
            "{bob: [carol], carol: [dave], dave: [andi], andi: [bob]}"
        );
    }
}
