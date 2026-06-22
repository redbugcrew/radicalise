mod random_pairs;

fn remove_person<PeerId>(person: &PeerId, people: &mut Vec<PeerId>)
where
    PeerId: Eq,
{
    people.retain(|p| *p != *person);
}
