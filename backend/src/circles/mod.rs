use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    circles::events::CirclesEvent,
    realtime::RealtimeState,
    shared::{default_project_id, entities::Circle, events::AppEvent},
};

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_circle))
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
    match repo::insert_circle(&data, default_project_id(), &pool).await {
        Ok(circle) => {
            let event = AppEvent::CirclesEvent(CirclesEvent::CircleUpdated(circle));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::CREATED, Json(vec![event])).into_response()
        }
        Err(err) => {
            if let sqlx::Error::Database(db_err) = &err {
                if db_err
                    .message()
                    .contains("UNIQUE constraint failed: circles.project_id, circles.slug")
                {
                    return (
                        StatusCode::BAD_REQUEST,
                        "A circle with this slug already exists in the project".to_string(),
                    )
                        .into_response();
                }
            }

            eprintln!("Failed to create circle: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create circle").into_response()
        }
    }
}
