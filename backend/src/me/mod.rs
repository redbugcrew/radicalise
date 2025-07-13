use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    collective::involvements_repo::find_collective_involvement,
    me::{
        events::{MeEvent, strip_private_data},
        my_involvement::{MyParticipationInput, update_my_involvements},
        repo::MyInitialData,
    },
    realtime::RealtimeState,
    shared::{COLLECTIVE_ID, entities::CollectiveInvolvement, events::AppEvent},
};

pub mod events;
mod my_involvement;
mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_my_state))
        .routes(routes!(my_participation))
        .routes(routes!(update_my_participation))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = MyInitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),)]
async fn get_my_state(
    Extension(pool): Extension<SqlitePool>,
    auth_session: AuthSession,
) -> impl IntoResponse {
    match auth_session.user {
        Some(user) => {
            let result = repo::find_initial_data_for_me(COLLECTIVE_ID, user.id, &pool).await;

            match result {
                Ok(initial_data) => (StatusCode::OK, Json(initial_data)).into_response(),
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }
        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}

#[utoipa::path(
    get,
    path = "/participation/interval/{interval_id}",
    params(
        ("interval_id" = i64, Path, description = "Interval ID")
    ),
    responses(
        (status = 200, description = "Fetched my participation successfully", body = Option<CollectiveInvolvement>),
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
            let result =
                find_collective_involvement(COLLECTIVE_ID, user.id, interval_id, &pool).await;

            match result {
                Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
                Ok(None) => (StatusCode::NOT_FOUND, ()).into_response(),
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }
        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}

#[utoipa::path(
    post,
    path = "/interval/{interval_id}/my_participation",
    params(
        ("interval_id" = i64, Path, description = "Interval ID")
    ),
    request_body(
        content = MyParticipationInput,
        content_type = "application/json"
    ),
    responses(
        (status = 200, description = "Updated my participation successfully", body = Vec<AppEvent>),
        (status = NOT_FOUND, description = "Not found", body = ())
    ),
)]
async fn update_my_participation(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(input): axum::extract::Json<MyParticipationInput>,
) -> impl IntoResponse {
    match auth_session.user {
        Some(user) => {
            let update_result = update_my_involvements(user.id, interval_id, input, &pool).await;

            if update_result.is_err() {
                eprintln!("Error updating my involvements: {:?}", update_result.err());
                return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
            }

            // Fetch the updated involvement to return
            let output_result =
                repo::find_interval_data_for_me(COLLECTIVE_ID, user.id, interval_id, &pool).await;
            match output_result {
                Ok(interval_data) => {
                    let public_interval_data = strip_private_data(&interval_data);
                    let public_event =
                        AppEvent::MeEvent(MeEvent::IntervalDataChanged(public_interval_data));
                    realtime_state
                        .broadcast_app_event_for_user(user.id.clone(), public_event.clone())
                        .await;

                    let my_event = AppEvent::MeEvent(MeEvent::IntervalDataChanged(interval_data));
                    return (StatusCode::OK, Json(vec![my_event])).into_response();
                }
                Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }

        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}
