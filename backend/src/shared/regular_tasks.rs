use sqlx::SqlitePool;

use crate::{
    intervals::repo::{
        find_intervals_needing_implicit_involvements, find_previous_interval,
        mark_implicit_involvements_processed,
    },
    my_collective::involvements_repo::{
        delete_implicit_collective_involvements, find_all_collective_involvements,
        insert_collective_involvement_if_missing,
    },
};

use super::entities::{CollectiveId, CollectiveInvolvement, Interval};

pub async fn check_intervals_tasks(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let intervals =
        find_intervals_needing_implicit_involvements(collective_id.clone(), pool).await?;

    for interval in intervals {
        println!(
            "Checking interval {} for implicit involvements",
            interval.id
        );
        if let Err(e) =
            add_interval_implicit_involvements(&interval, collective_id.clone(), false, pool).await
        {
            eprintln!(
                "Error adding implicit involvements for interval {}: {:?}",
                interval.id, e
            );
        }
    }

    Ok(())
}

pub async fn add_interval_implicit_involvements(
    interval: &Interval,
    collective_id: CollectiveId,
    recompute: bool,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let previous_interval =
        match find_previous_interval(collective_id.clone(), interval.typed_id(), pool).await? {
            Some(prev) => prev,
            None => return Ok(()),
        };

    let previous_collective_involvements =
        find_all_collective_involvements(collective_id.clone(), previous_interval.typed_id(), pool)
            .await?;

    if recompute {
        delete_implicit_collective_involvements(collective_id.clone(), interval.typed_id(), pool)
            .await?;
    }

    for previous_involvement in previous_collective_involvements {
        let new_involvement = CollectiveInvolvement {
            id: -1, // -1 indicates a new record
            person_id: previous_involvement.person_id.clone(),
            collective_id: previous_involvement.collective_id,
            interval_id: interval.id,
            status: previous_involvement.status,
            private_capacity_planning: false,
            capacity_planning: None,
            capacity_score: None,
            participation_intention: None,
            opt_out_type: None,
            opt_out_planned_return_date: None,
            intention_context: None,
            implicit_counter: previous_involvement.implicit_counter + 1,
        };
        let result = insert_collective_involvement_if_missing(new_involvement.into(), pool).await;
        if result.is_err() {
            eprintln!(
                "Error inserting implicit involvement for person_id: {} in interval {}: {:?}",
                previous_involvement.person_id.clone(),
                interval.id,
                result
            );
        }
    }

    mark_implicit_involvements_processed(interval.typed_id(), true, pool).await?;

    Ok(())
}
