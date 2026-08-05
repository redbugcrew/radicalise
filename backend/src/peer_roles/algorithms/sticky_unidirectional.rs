use super::super::match_results::MatchResults;
use rand::Rng;
use std::collections::VecDeque;

pub fn sticky_unidirectional<PeerId, R: Rng>(
    people: Vec<PeerId>,
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

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand::rngs::SmallRng;

    #[test]
    fn returns_empty_matches_by_default() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result = sticky_unidirectional::<String, _>(vec![], &mut rng);
        assert!(result.edges().is_empty());
    }

    #[test]
    fn return_empty_matches_if_theres_only_one_person() {
        let mut rng = SmallRng::seed_from_u64(0);

        let result = sticky_unidirectional::<String, _>(vec!["andi".to_string()], &mut rng);
        assert!(result.edges().is_empty());
    }

    #[test]
    fn matches_two_people_with_no_history() {
        let mut rng = SmallRng::seed_from_u64(0);
        let result = sticky_unidirectional::<String, _>(
            vec!["andi".to_string(), "bob".to_string()],
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
            &mut rng,
        );

        assert_eq!(
            result.to_string(),
            "{andi: [bob], bob: [carol], carol: [dave], dave: [andi]}"
        );
    }

    #[test]
    fn starts_from_person_recently_churned() {}
}
