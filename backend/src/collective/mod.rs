use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    collective::repo::{
        COLLECTIVE_ID, find_all_collective_involvements, find_all_crew_involvements,
        find_detailed_involvement,
    },
    entities::{
        Collective, CollectiveInvolvement, CollectiveInvolvementWithDetails, Crew, CrewInvolvement,
        Interval, InvolvementStatus, OptOutType, ParticipationIntention, Person,
    },
};

mod repo;

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

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_state))
        .routes(routes!(get_involvements))
        .routes(routes!(my_participation))
        .routes(routes!(update_my_participation))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = InitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),)]
async fn get_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let collective_result = sqlx::query_as!(
        Collective,
        "SELECT id, name, description FROM collectives WHERE id = ?",
        COLLECTIVE_ID
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

#[utoipa::path(
    get,
    path = "/interval/{interval_id}/my_participation",
    params(
        ("interval_id" = i64, Path, description = "Interval ID")
    ),
    responses(
        (status = 200, description = "Fetched my participation successfully", body = Option<CollectiveInvolvementWithDetails>),
        (status = NOT_FOUND, description = "Not found", body = ())
    ),
)]
async fn my_participation(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    auth_session: AuthSession,
) -> impl IntoResponse {
    match auth_session.user {
        Some(user) => {
            let result = find_detailed_involvement(interval_id, user.id, &pool).await;

            match result {
                Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
                Ok(None) => (StatusCode::NOT_FOUND, ()).into_response(),
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }
        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyParticipationInput {
    pub collective_id: i64,
    pub wellbeing: Option<String>,
    pub focus: Option<String>,
    pub capacity: Option<String>,
    pub participation_intention: Option<ParticipationIntention>,
    pub opt_out_type: Option<OptOutType>,
    pub opt_out_planned_return_date: Option<String>,
}

#[utoipa::path(
    post,
    path = "/interval/{interval_id}/my_participation",
    params(
        ("interval_id" = i64, Path, description = "Interval ID")
    ),
    request_body(
        content = MyParticipationInput, description = "Detailed involvement",
        content_type = "application/json"
    ),
    responses(
        (status = 200, description = "Updated my participation successfully", body = Option<CollectiveInvolvementWithDetails>),
        (status = NOT_FOUND, description = "Not found", body = ())
    ),
)]
async fn update_my_participation(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    auth_session: AuthSession,
    axum::extract::Json(input): axum::extract::Json<MyParticipationInput>,
) -> impl IntoResponse {
    match auth_session.user {
        Some(user) => {
            let status: InvolvementStatus = input.participation_intention.clone().map_or(
                InvolvementStatus::Participating,
                |intention| match intention {
                    ParticipationIntention::OptIn => InvolvementStatus::Participating,
                    ParticipationIntention::OptOut => InvolvementStatus::OnHiatus,
                },
            );

            let result = sqlx::query!(
                    "INSERT INTO collective_involvements (person_id, collective_id, interval_id, status, wellbeing, focus, capacity, participation_intention, opt_out_type, opt_out_planned_return_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(person_id, collective_id, interval_id) DO UPDATE SET
                        status = excluded.status,
                        wellbeing = excluded.wellbeing,
                        focus = excluded.focus,
                        capacity = excluded.capacity,
                        participation_intention = excluded.participation_intention,
                        opt_out_type = excluded.opt_out_type,
                        opt_out_planned_return_date = excluded.opt_out_planned_return_date",
                    user.id,
                    input.collective_id,
                    interval_id,
                    status,
                    input.wellbeing,
                    input.focus,
                    input.capacity,
                    input.participation_intention,
                    input.opt_out_type,
                    input.opt_out_planned_return_date
                )
                .execute(&pool)
                .await;

            if result.is_err() {
                eprintln!("Error updating involvement: {:?}", result.err());
                return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
            }

            // Fetch the updated involvement to return
            let output_result = find_detailed_involvement(interval_id, user.id, &pool).await;
            match output_result {
                Ok(Some(updated_involvement)) => {
                    return (StatusCode::OK, Json(updated_involvement)).into_response();
                }
                Ok(None) => return (StatusCode::NOT_FOUND, ()).into_response(),
                Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }

        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}
