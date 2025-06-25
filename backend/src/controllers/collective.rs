use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::entities::{
    Collective, CollectiveInvolvement, Crew, CrewInvolvement, Interval, InvolvementStatus, Person,
};

#[derive(Serialize, Deserialize, ToSchema)]
struct IntervalInvolvementData {
    pub collective_involvements: Vec<CollectiveInvolvement>,
    pub crew_involvements: Vec<CrewInvolvement>,
}

#[derive(Serialize, Deserialize, ToSchema)]
struct InitialData {
    pub collective: Collective,
    pub people: Vec<Person>,
    pub crews: Vec<Crew>,
    pub intervals: Vec<Interval>,
    pub current_interval: Interval,
    pub involvements: IntervalInvolvementData,
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
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
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

            let crews_result = sqlx::query_as!(Crew, "SELECT id, name, description FROM crews")
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
                || crews_result.is_err()
            {
                return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
            }
            let people = people_result.unwrap();
            let intervals = intervals_result.unwrap();
            let current_interval = current_interval_result.unwrap();
            let crews = crews_result.unwrap();

            let collective_involvements_result =
                find_all_collective_involvements(current_interval.id, &pool).await;
            let crew_involvements_result =
                find_all_crew_involvements(current_interval.id, &pool).await; // Assuming crew group ID is 2

            if collective_involvements_result.is_err() || crew_involvements_result.is_err() {
                return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
            }
            let collective_involvements = collective_involvements_result.unwrap();
            let crew_involvements = crew_involvements_result.unwrap();

            let initial_data = InitialData {
                collective,
                people,
                crews,
                intervals,
                current_interval,
                involvements: IntervalInvolvementData {
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
        (status = 200, description = "Fetched Involvements successfully", body = IntervalInvolvementData),
        (status = NOT_FOUND, description = "Not found", body = ())
    ), params(
            ("interval_id" = i64, Path, description = "Interval ID")
        ),)]
async fn get_involvements(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let collective_involvements_result = find_all_collective_involvements(interval_id, &pool).await;
    let crew_involvements_result = find_all_crew_involvements(interval_id, &pool).await;

    if collective_involvements_result.is_err() || crew_involvements_result.is_err() {
        return (StatusCode::NOT_FOUND, ()).into_response();
    }
    let collective_involvements = collective_involvements_result.unwrap();
    let crew_involvements = crew_involvements_result.unwrap();

    let result = IntervalInvolvementData {
        collective_involvements,
        crew_involvements,
    };

    return (StatusCode::OK, Json(result)).into_response();
}

async fn find_all_collective_involvements(
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CollectiveInvolvement>, sqlx::Error> {
    let collective_id = COLLECTIVE_ID;

    sqlx::query_as!(
        CollectiveInvolvement,
        "SELECT id, person_id, collective_id, interval_id, status as \"status: InvolvementStatus\"
        FROM collective_involvements
        WHERE
          interval_id = ? AND
          collective_id = ?",
        interval_id,
        collective_id
    )
    .fetch_all(pool)
    .await
}

async fn find_all_crew_involvements(
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT crew_involvements.id, person_id, crew_id, interval_id, status as \"status: InvolvementStatus\"
        FROM crew_involvements
        LEFT JOIN groups ON crew_involvements.crew_id = groups.id
        WHERE
          interval_id = ?",
        interval_id
    )
    .fetch_all(pool)
    .await
}
