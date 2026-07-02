use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    intervals::{events::IntervalsEvent, tasks::add_interval_implicit_involvements},
    realtime::RealtimeState,
    shared::{default_project_id, entities::Interval, events::AppEvent},
};

pub mod events;
pub mod repo;
pub mod tasks;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_interval))
        .routes(routes!(start_next_interval))
}

#[utoipa::path(post, path = "/",
    request_body(content = Interval, content_type = "application/json"),
    responses(
        (status = 201, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),
)]
async fn create_interval(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(interval): axum::extract::Json<Interval>,
) -> impl IntoResponse {
    println!("Creating interval: {:?}", interval);

    match repo::insert_interval(interval, default_project_id(), &pool).await {
        Ok(response) => {
            let event = AppEvent::IntervalsEvent(IntervalsEvent::IntervalCreated(response));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            return (StatusCode::CREATED, Json(vec![event])).into_response();
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}

#[derive(utoipa::ToSchema)]
enum StartNextIntervalError {
    CurrentIntervalNotFound,
    NextIntervalNotFound,
    CouldntSetUpInterval,
    InternalServerError,
}

impl IntoResponse for StartNextIntervalError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::CurrentIntervalNotFound => {
                (StatusCode::BAD_REQUEST, "Current interval not found").into_response()
            }
            Self::NextIntervalNotFound => {
                (StatusCode::BAD_REQUEST, "Next interval not found").into_response()
            }
            Self::CouldntSetUpInterval => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Couldn't set up interval",
            )
                .into_response(),
            Self::InternalServerError => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error").into_response()
            }
        }
    }
}

#[utoipa::path(
    post,
    path = "/start_next_interval",
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = StartNextIntervalError),
    ),
)]
async fn start_next_interval(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
) -> impl IntoResponse {
    println!("Starting next interval");

    let project_id = default_project_id();

    let current_interval = match repo::find_current_interval(project_id.clone(), &pool).await {
        Ok(interval) => interval,
        Err(_) => {
            return StartNextIntervalError::CurrentIntervalNotFound.into_response();
        }
    };

    let next_interval = match repo::find_next_interval(
        project_id.clone(),
        current_interval.typed_id(),
        &pool,
    )
    .await
    {
        Ok(Some(interval)) => interval,
        Ok(None) => {
            return StartNextIntervalError::NextIntervalNotFound.into_response();
        }
        Err(_) => {
            return StartNextIntervalError::InternalServerError.into_response();
        }
    };

    match add_interval_implicit_involvements(&next_interval, project_id.clone(), false, &pool).await
    {
        Ok(_) => (),
        Err(_) => return StartNextIntervalError::CouldntSetUpInterval.into_response(),
    };

    match repo::change_project_interval(project_id.clone(), next_interval.typed_id(), &pool).await {
        Ok(_) => {
            let event = AppEvent::IntervalsEvent(IntervalsEvent::IntervalStarted(next_interval));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            return (StatusCode::OK, Json(vec![event])).into_response();
        }
        Err(_) => StartNextIntervalError::InternalServerError.into_response(),
    }
}
