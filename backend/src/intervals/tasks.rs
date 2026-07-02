use sqlx::SqlitePool;

use crate::{
    circles::repo::find_all_circles,
    intervals::repo::{find_previous_interval, mark_implicit_involvements_processed},
    my_project::involvements_repo::{
        delete_implicit_circle_involvements, find_all_circle_involvements,
        insert_circle_involvement_if_missing,
    },
    shared::entities::{CircleId, CircleInvolvement, Interval, OptOutType, ProjectId},
};

pub async fn add_interval_implicit_involvements(
    interval: &Interval,
    project_id: ProjectId,
    recompute: bool,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    println!(
        "{} implicit involvements for interval {}",
        if recompute { "Recomputing" } else { "Adding" },
        interval.id,
    );

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
    println!(
        "{} implicit involvements for interval {}, circle {}",
        if recompute { "Recomputing" } else { "Adding" },
        interval.id,
        circle_id.id
    );

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
        println!("  - deleting implicit involvements");
        delete_implicit_circle_involvements(circle_id.clone(), interval.typed_id(), pool).await?;
        println!("  - done deleting implicit involvements");
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
            implicit_counter: new_counter,
            ..CircleInvolvement::default()
        };

        println!(
            "  - inserting implicit involvement for person_id: {} in interval {}... ",
            new_involvement.person_id.clone(),
            interval.id
        );

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

    println!("  - marking implicit involvements as processed");
    mark_implicit_involvements_processed(interval.typed_id(), true, pool).await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;

    async fn setup_db() -> SqlitePool {
        let pool = SqlitePoolOptions::new()
            .connect("sqlite::memory:")
            .await
            .expect("Failed to create in-memory database");
        sqlx::migrate!()
            .run(&pool)
            .await
            .expect("Failed to run migrations");
        pool
    }

    #[tokio::test]
    async fn no_involvements_added_when_no_previous_interval() {
        let pool = setup_db().await;

        sqlx::query!(
            "INSERT INTO intervals (id, start_date, end_date, project_id) VALUES (1, '2026-01-01', '2026-03-31', 1)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test interval");

        let interval = Interval {
            id: 1,
            start_date: "2026-01-01".to_string(),
            end_date: "2026-03-31".to_string(),
        };

        let result = add_interval_circle_implicit_involvements(
            &interval,
            ProjectId::new(1),
            CircleId::new(1),
            false,
            &pool,
        )
        .await;

        assert!(result.is_ok(), "Expected Ok(()), got {:?}", result.err());

        let count = sqlx::query_scalar!("SELECT COUNT(*) FROM circle_involvements")
            .fetch_one(&pool)
            .await
            .expect("Failed to count involvements");
        assert_eq!(count, 0, "Expected no involvements to be created");
    }

    #[tokio::test]
    async fn implicit_involvement_added_for_second_interval() {
        let pool = setup_db().await;

        sqlx::query!(
            "INSERT INTO users (id, email, hashed_password) VALUES (1, 'test@example.com', 'hashed')"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test user");

        sqlx::query!(
            "INSERT INTO people (id, display_name, project_id, user_id) VALUES (1, 'Test Person', 1, 1)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert test person");

        sqlx::query!(
            "INSERT INTO intervals (id, start_date, end_date, project_id) VALUES (1, '2026-01-01', '2026-03-31', 1)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert first interval");

        sqlx::query!(
            "INSERT INTO intervals (id, start_date, end_date, project_id) VALUES (2, '2026-04-01', '2026-06-30', 1)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert second interval");

        // circle id=1 already exists from migrations (inserted by add-circles migration)
        sqlx::query!(
            "INSERT INTO circle_involvements (person_id, circle_id, interval_id, status, implicit_counter) VALUES (1, 1, 1, 'Active', 0)"
        )
        .execute(&pool)
        .await
        .expect("Failed to insert circle involvement in first interval");

        let second_interval = Interval {
            id: 2,
            start_date: "2026-04-01".to_string(),
            end_date: "2026-06-30".to_string(),
        };

        let result = add_interval_circle_implicit_involvements(
            &second_interval,
            ProjectId::new(1),
            CircleId::new(1),
            false,
            &pool,
        )
        .await;
        assert!(result.is_ok(), "Expected Ok(()), got {:?}", result.err());

        let count = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM circle_involvements WHERE interval_id = 2 AND person_id = 1"
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to count involvements");
        assert_eq!(
            count, 1,
            "Expected one implicit involvement for person in second interval"
        );

        // If we run it again with recompute=true, it should not create duplicates and should keep the same implicit_counter value
        let result = add_interval_circle_implicit_involvements(
            &second_interval,
            ProjectId::new(1),
            CircleId::new(1),
            true,
            &pool,
        )
        .await;
        assert!(result.is_ok(), "Expected Ok(()), got {:?}", result.err());

        let count = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM circle_involvements WHERE interval_id = 2 AND person_id = 1"
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to count involvements");
        assert_eq!(
            count, 1,
            "Expected one implicit involvement for person in second interval"
        );
    }
}
