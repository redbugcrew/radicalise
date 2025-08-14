use std::f64::consts::E;

use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    my_collective::{
        events::CollectiveEvent,
        involvements_repo::find_all_collective_involvements,
        repo::{InitialData, IntervalInvolvementData},
    },
    realtime::RealtimeState,
    shared::{
        default_collective_id,
        entities::{Collective, IntervalId},
        events::AppEvent,
    },
};

pub mod events;
pub mod involvements_repo;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_collective_state))
        .routes(routes!(get_involvements))
        .routes(routes!(update_collective))
}

#[utoipa::path(get, path = "/state", responses(
        (status = 200, description = "Collective found successfully", body = InitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),)]
async fn get_collective_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let collective_result = repo::find_collective_with_links(default_collective_id(), &pool).await;

    match collective_result {
        Ok(collective) => {
            let initial_data_result =
                repo::find_initial_data_for_collective(collective, &pool).await;
            match initial_data_result {
                Ok(initial_data) => (StatusCode::OK, Json(initial_data)).into_response(),
                Err(e) => {
                    eprintln!("Error fetching initial data: {:?}", e);
                    (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
                }
            }
        }
        Err(e) => {
            eprintln!("Error collective state: {:?}", e);
            (StatusCode::NOT_FOUND, ()).into_response()
        }
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
    let interval_id = IntervalId::new(interval_id);

    let collective_involvements_result =
        find_all_collective_involvements(default_collective_id(), interval_id.clone(), &pool).await;
    let crew_involvements_result =
        repo::find_all_crew_involvements(interval_id.clone(), &pool).await;

    if collective_involvements_result.is_err() || crew_involvements_result.is_err() {
        return (StatusCode::NOT_FOUND, ()).into_response();
    }
    let collective_involvements = collective_involvements_result.unwrap();
    let crew_involvements = crew_involvements_result.unwrap();

    let result = IntervalInvolvementData {
        interval_id: interval_id.id,
        collective_involvements,
        crew_involvements,
    };

    return (StatusCode::OK, Json(result)).into_response();
}

#[utoipa::path(put, path = "/",
    request_body(content = Collective, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),
)]
pub async fn update_collective(
    auth_session: AuthSession,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    Json(input): Json<Collective>,
) -> impl IntoResponse {
    println!("Updating collective: {:?}", input);

    match repo::update_collective_with_links(input, default_collective_id(), &pool).await {
        Ok(response) => {
            let event = AppEvent::CollectiveEvent(CollectiveEvent::CollectiveUpdated(response));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
