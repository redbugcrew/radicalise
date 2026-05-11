use sqlx::SqlitePool;

use crate::{
    circles::repo::find_all_circles,
    intervals::repo::{
        find_intervals_needing_implicit_involvements, find_previous_interval,
        mark_implicit_involvements_processed,
    },
    my_project::involvements_repo::{
        delete_implicit_circle_involvements, find_all_circle_involvements,
        insert_circle_involvement_if_missing,
    },
    shared::entities::{CircleId, OptOutType},
};

use super::entities::{CircleInvolvement, Interval, ProjectId};

pub async fn check_intervals_tasks(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let intervals = find_intervals_needing_implicit_involvements(project_id.clone(), pool).await?;

    for interval in intervals {
        println!(
            "Checking interval {} for implicit involvements",
            interval.id
        );
        if let Err(e) =
            add_interval_implicit_involvements(&interval, project_id.clone(), false, pool).await
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
    project_id: ProjectId,
    recompute: bool,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let circles = find_all_circles(project_id.clone(), pool).await?;

    for circle in circles {
        if let Err(e) = add_interval_circle_implicit_involvements(
            interval,
            project_id.clone(),
            circle.typed_id(),
            recompute,
            pool,
        )
        .await
        {
            eprintln!(
                "Error adding implicit involvements for interval {}, circle {}: {:?}",
                interval.id, circle.id, e
            );
        }
    }

    Ok(())
}

async fn add_interval_circle_implicit_involvements(
    interval: &Interval,
    project_id: ProjectId,
    circle_id: CircleId,
    recompute: bool,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let previous_interval =
        match find_previous_interval(project_id.clone(), interval.typed_id(), pool).await? {
            Some(prev) => prev,
            None => return Ok(()),
        };

    let previous_circle_involvements = find_all_circle_involvements(
        project_id.clone(),
        circle_id.clone(),
        previous_interval.typed_id(),
        pool,
    )
    .await?;

    if recompute {
        delete_implicit_circle_involvements(circle_id.clone(), interval.typed_id(), pool).await?;
    }

    for previous_involvement in previous_circle_involvements {
        match previous_involvement.opt_out_type {
            Some(OptOutType::Exit) => continue,
            _ => {}
        }

        let new_counter = match previous_involvement.participation_intention {
            Some(_) => 0,
            None => previous_involvement.implicit_counter + 1,
        };

        let new_involvement = CircleInvolvement {
            id: -1, // -1 indicates a new record
            person_id: previous_involvement.person_id.clone(),
            project_id: previous_involvement.project_id,
            circle_id: previous_involvement.circle_id,
            interval_id: interval.id,
            status: previous_involvement.status,
            private_capacity_planning: false,
            capacity_planning: None,
            capacity_score: None,
            participation_intention: None,
            opt_out_type: None,
            opt_out_planned_return_date: None,
            intention_context: None,
            implicit_counter: new_counter,
        };
        let result = insert_circle_involvement_if_missing(new_involvement.into(), pool).await;
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
