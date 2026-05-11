use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    circles::events::CirclesEvent,
    realtime::RealtimeState,
    shared::{
        default_project_id,
        entities::{Circle, CircleId},
        events::AppEvent,
    },
};

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_circle))
        .routes(routes!(update_circle))
}

#[utoipa::path(
    post,
    path = "/",
    request_body(content = Circle, content_type = "application/json"),
    responses(
        (status = CREATED, body = Vec<AppEvent>),
        (status = BAD_REQUEST, body = String),
        (status = INTERNAL_SERVER_ERROR, body = String),
    ),
)]
async fn create_circle(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(data): axum::extract::Json<Circle>,
) -> impl IntoResponse {
    println!("Creating circle: {:?}", data);

    match repo::insert_circle(&data, default_project_id(), &pool).await {
        Ok(circle) => {
            let event = broadcast_circle_update_event(auth_session, &realtime_state, circle).await;
            (StatusCode::CREATED, Json(vec![event])).into_response()
        }
        Err(err) => {
            if is_slug_unique_error(&err) {
                return (
                    StatusCode::BAD_REQUEST,
                    "A circle with this slug already exists in the project".to_string(),
                )
                    .into_response();
            }

            eprintln!("Failed to create circle: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create circle").into_response()
        }
    }
}

#[utoipa::path(
    put,
    path = "/{circle_id}",
    request_body(content = Circle, content_type = "application/json"),
    responses(
        (status = OK, body = Vec<AppEvent>),
        (status = BAD_REQUEST, body = String),
        (status = INTERNAL_SERVER_ERROR, body = String),
    ),
)]
async fn update_circle(
    Path(circle_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(data): axum::extract::Json<Circle>,
) -> impl IntoResponse {
    println!("Updating circle with ID {}: {:?}", circle_id, data);

    match repo::update_circle(CircleId::new(circle_id), &data, default_project_id(), &pool).await {
        Ok(circle) => {
            let event = broadcast_circle_update_event(auth_session, &realtime_state, circle).await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(err) => {
            if is_slug_unique_error(&err) {
                return (
                    StatusCode::BAD_REQUEST,
                    "A circle with this slug already exists in the project".to_string(),
                )
                    .into_response();
            }

            eprintln!("Failed to create circle: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create circle").into_response()
        }
    }
}

async fn broadcast_circle_update_event(
    auth_session: AuthSession,
    realtime_state: &RealtimeState,
    circle: Circle,
) -> AppEvent {
    let event = AppEvent::CirclesEvent(CirclesEvent::CircleUpdated(circle));
    let realtime_state = realtime_state.clone();

    realtime_state
        .broadcast_app_event(Some(auth_session), event.clone())
        .await;

    event
}

fn is_slug_unique_error(err: &sqlx::Error) -> bool {
    if let sqlx::Error::Database(db_err) = err {
        return db_err
            .message()
            .contains("UNIQUE constraint failed: circles.project_id, circles.slug");
    }
    false
}
