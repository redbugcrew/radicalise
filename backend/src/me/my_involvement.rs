use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::{
    crews::repo::{
        find_crew_involvements, intervals_participated_since_last_convened, set_crew_convenor,
    },
    intervals::repo::{IntervalType, find_interval, get_interval_type},
    me::repo::{self},
    my_collective::involvements_repo::{
        CollectiveInvolvementRecord, upsert_collective_involvement,
    },
    shared::entities::{
        CrewId, CrewInvolvement, IntervalId, InvolvementStatus, OptOutType, ParticipationIntention,
        PersonId,
    },
};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyParticipationInput {
    pub collective_id: i64,
    pub private_capacity_planning: bool,
    pub wellbeing: Option<String>,
    pub focus: Option<String>,
    pub capacity_score: Option<i64>,
    pub capacity: Option<String>,
    pub participation_intention: Option<ParticipationIntention>,
    pub opt_out_type: Option<OptOutType>,
    pub opt_out_planned_return_date: Option<String>,
    pub crew_involvements: Option<Vec<CrewInvolvement>>,
    pub intention_context: Option<String>,
}

pub fn calculate_status(
    participation_intention: Option<ParticipationIntention>,
    opt_out_type: Option<OptOutType>,
) -> InvolvementStatus {
    match participation_intention {
        Some(ParticipationIntention::OptIn) => InvolvementStatus::Participating,
        Some(ParticipationIntention::OptOut) => match opt_out_type {
            Some(OptOutType::Hiatus) => InvolvementStatus::OnHiatus,
            Some(OptOutType::Exit) => InvolvementStatus::Exiting,
            None => InvolvementStatus::OnHiatus, // Default to OnHiatus if no opt-out type is set
        },
        None => InvolvementStatus::Participating, // We might revisit this later
    }
}

pub async fn update_my_involvements(
    person_id: PersonId,
    interval_id: IntervalId,
    input: MyParticipationInput,
    pool: &sqlx::SqlitePool,
) -> Result<(), sqlx::Error> {
    let status: InvolvementStatus = calculate_status(
        input.participation_intention.clone(),
        input.opt_out_type.clone(),
    );

    let interval = find_interval(interval_id.clone(), &pool).await?;
    let interval_type = get_interval_type(interval);

    if interval_type == IntervalType::Past {
        return Err(past_interval_error());
    }

    upsert_collective_involvement(
        CollectiveInvolvementRecord {
            id: -1, // ID will be auto-generated
            person_id: person_id.id,
            collective_id: input.collective_id,
            interval_id: interval_id.id,
            status,
            private_capacity_planning: input.private_capacity_planning,
            wellbeing: input.wellbeing,
            focus: input.focus,
            capacity_score: input.capacity_score,
            capacity: input.capacity,
            participation_intention: input.participation_intention,
            opt_out_type: input.opt_out_type,
            opt_out_planned_return_date: input.opt_out_planned_return_date,
            intention_context: input.intention_context,
        },
        pool,
    )
    .await?;

    if let Some(crew_involvements) = input.crew_involvements {
        // Update crew involvements
        let impacted_crew_ids = repo::update_crew_involvements(
            person_id,
            interval_id.clone(),
            crew_involvements,
            &pool,
        )
        .await?;

        for crew_id in impacted_crew_ids {
            update_convenor_if_needed(crew_id, interval_id.clone(), interval_type, &pool).await?;
        }
    }
    Ok(())
}

async fn update_convenor_if_needed(
    crew_id: CrewId,
    interval_id: IntervalId,
    interval_type: IntervalType,
    pool: &sqlx::SqlitePool,
) -> Result<(), sqlx::Error> {
    if interval_type == IntervalType::Past {
        return Err(past_interval_error());
    }

    let crew_involvements =
        find_crew_involvements(crew_id.clone(), interval_id.clone(), pool).await?;
    let convenor_involvements: Vec<&CrewInvolvement> = crew_involvements
        .iter()
        .filter(|involvement| involvement.convenor)
        .collect();

    let volunteered_convenor_involvements: Vec<&CrewInvolvement> = crew_involvements
        .iter()
        .filter(|involvement| involvement.volunteered_convenor)
        .collect();

    // If this is the current interval, and there's already a convenor, do nothing
    if interval_type == IntervalType::Current && !convenor_involvements.is_empty() {
        println!(
            "Crew {} already has a convenor for interval {} of type {:?}",
            crew_id.id, interval_id.id, interval_type
        );
        return Ok(());
    }

    let person_ids = volunteered_convenor_involvements
        .iter()
        .map(|involvement| involvement.person_id)
        .collect::<Vec<i64>>();
    let best_convenor =
        get_best_convenor_person_id(crew_id.clone(), interval_id.clone(), person_ids, pool).await?;

    set_crew_convenor(crew_id, interval_id, best_convenor, pool).await?;

    Ok(())
}

async fn get_best_convenor_person_id(
    crew_id: CrewId,
    interval_id: IntervalId,
    mut person_ids: Vec<i64>,
    pool: &sqlx::SqlitePool,
) -> Result<Option<i64>, sqlx::Error> {
    // If there are no volunteered convenors, return None
    if person_ids.is_empty() {
        return Ok(None);
    }

    // If there is only one volunteered convenor, return them
    if person_ids.len() == 1 {
        return Ok(Some(person_ids[0]));
    }

    person_ids =
        filter_by_longest_since_convened_this_crew(person_ids, crew_id, interval_id, pool).await?;
    if person_ids.len() == 1 {
        return Ok(Some(person_ids[0]));
    }

    // If there are still multiple volunteered convenors, sort them by id and return the first one
    person_ids.sort_unstable();

    Ok(Some(person_ids[0]))
}

fn past_interval_error() -> sqlx::Error {
    let result =
        sqlx::Error::InvalidArgument("Cannot update involvements for a past interval".to_string());
    eprintln!("error: {}", result);
    result
}

async fn filter_by_longest_since_convened_this_crew(
    person_ids: Vec<i64>,
    crew_id: CrewId,
    current_interval_id: IntervalId,
    pool: &sqlx::SqlitePool,
) -> Result<Vec<i64>, sqlx::Error> {
    let data = intervals_since_last_convened(
        person_ids.clone(),
        crew_id.clone(),
        current_interval_id,
        pool,
    )
    .await?;

    let most_intervals: i64 = data
        .iter()
        .map(|result| result.intervals_since_convened)
        .max()
        .unwrap_or_else(|| {
            eprintln!(
                "No intervals since convened found for crew {} with person_ids {:?}",
                crew_id.id, person_ids
            );
            0
        });

    let filtered_ids: Vec<i64> = data
        .into_iter()
        .filter(|record| record.intervals_since_convened == most_intervals)
        .map(|record| record.person_id)
        .collect();

    if filtered_ids.is_empty() {
        panic!(
            "No crew members found for crew {} with intervals since convened {}",
            crew_id.id, most_intervals
        );
    } else {
        Ok(filtered_ids)
    }
}

struct IntervalLastConvenedResult {
    person_id: i64,
    intervals_since_convened: i64,
}

async fn intervals_since_last_convened(
    person_ids: Vec<i64>,
    crew_id: CrewId,
    current_interval_id: IntervalId,
    pool: &sqlx::SqlitePool,
) -> Result<Vec<IntervalLastConvenedResult>, sqlx::Error> {
    let data =
        intervals_participated_since_last_convened(crew_id, current_interval_id, pool).await?;

    let result: Vec<IntervalLastConvenedResult> = person_ids
        .into_iter()
        .map(|person_id| {
            let intervals_since_convened: i64 = data.get(&person_id).cloned().unwrap_or(0);
            IntervalLastConvenedResult {
                person_id,
                intervals_since_convened,
            }
        })
        .collect();

    Ok(result)
}
