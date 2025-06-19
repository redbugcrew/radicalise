use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::entities::{Collective, Interval, Involvement, InvolvementStatus, Person};

#[derive(Serialize, Deserialize, ToSchema)]
struct InitialInvolvementsData {
    pub collective_involvements: Vec<Involvement>,
    pub crew_involvements: Vec<Involvement>,
}

#[derive(Serialize, Deserialize, ToSchema)]
struct InitialData {
    pub collective: Collective,
    pub people: Vec<Person>,
    pub intervals: Vec<Interval>,
    pub current_interval: Interval,
    pub involvements: InitialInvolvementsData,
}

const COLLECTIVE_GROUP_ID: i64 = 1;
const COLLECTIVE_ID: i64 = 1;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_state))
        .routes(routes!(get_involvements))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = InitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ())
    ),)]
async fn get_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let collective_result = sqlx::query_as!(
        Collective,
        "SELECT id, name FROM groups WHERE id = ?",
        COLLECTIVE_GROUP_ID
    )
    .fetch_one(&pool)
    .await;

    match collective_result {
        Ok(collective) => {
            let people_result = sqlx::query_as!(Person, "SELECT id, display_name FROM people")
                .fetch_all(&pool)
                .await;

            let intervals_result = sqlx::query_as!(
                Interval,
                "SELECT id, start_date, end_date FROM intervals WHERE collective_id = ?",
                COLLECTIVE_ID
            )
            .fetch_all(&pool)
            .await;

            let current_interval_result = sqlx::query_as!(
                Interval,
                "SELECT id, start_date, end_date FROM intervals WHERE collective_id = ? AND start_date <= date('now') AND (end_date IS NULL OR end_date >= date('now'))",
                COLLECTIVE_ID
            )
            .fetch_one(&pool)
            .await;

            if intervals_result.is_err()
                || people_result.is_err()
                || current_interval_result.is_err()
            {
                return (StatusCode::NOT_FOUND, ()).into_response();
            }
            let people = people_result.unwrap();
            let intervals = intervals_result.unwrap();
            let current_interval = current_interval_result.unwrap();

            let collective_involvements_result =
                find_all_group_involvements(current_interval.id, COLLECTIVE_GROUP_ID, &pool).await;
            let crew_involvements_result =
                find_all_crew_involvements(current_interval.id, &pool).await; // Assuming crew group ID is 2

            if collective_involvements_result.is_err() || crew_involvements_result.is_err() {
                return (StatusCode::NOT_FOUND, ()).into_response();
            }
            let collective_involvements = collective_involvements_result.unwrap();
            let crew_involvements = crew_involvements_result.unwrap();

            let initial_data = InitialData {
                collective,
                people,
                intervals,
                current_interval,
                involvements: InitialInvolvementsData {
                    collective_involvements,
                    crew_involvements,
                },
            };
            return (StatusCode::OK, Json(initial_data)).into_response();
        }
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}

#[utoipa::path(get, path = "/interval/{interval_id}/involvements", responses(
        (status = 200, description = "Involvements successfully", body = Vec<Involvement>),
        (status = NOT_FOUND, description = "Not found", body = ())
    ), params(
            ("interval_id" = i64, Path, description = "Interval ID")
        ),)]
async fn get_involvements(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let involvements_result =
        find_all_group_involvements(interval_id, COLLECTIVE_GROUP_ID, &pool).await;

    match involvements_result {
        Ok(involvements) => (StatusCode::OK, Json(involvements)).into_response(),
        Err(e) => {
            println!("Error fetching involvements: {:?}", e);
            return (StatusCode::NOT_FOUND, ()).into_response();
        }
    }
}

async fn find_all_group_involvements(
    interval_id: i64,
    group_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<Involvement>, sqlx::Error> {
    sqlx::query_as!(
        Involvement,
        "SELECT id, person_id, group_id, start_interval_id, end_interval_id, status as \"status: InvolvementStatus\" FROM involvements
        WHERE
          (start_interval_id <= ? AND (end_interval_id IS NULL OR end_interval_id >= ?)) AND
          group_id = ?",
        interval_id,
        interval_id,
        group_id
    )
    .fetch_all(pool)
    .await
}

async fn find_all_crew_involvements(
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<Involvement>, sqlx::Error> {
    sqlx::query_as!(
        Involvement,
        "SELECT involvements.id, person_id, group_id, start_interval_id, end_interval_id, status as \"status: InvolvementStatus\" FROM involvements
        LEFT JOIN groups ON involvements.group_id = groups.id
        WHERE
          (start_interval_id <= ? AND (end_interval_id IS NULL OR end_interval_id >= ?)) AND
          groups.type = ?",
        interval_id,
        interval_id,
        "crew",
    )
    .fetch_all(pool)
    .await
}
