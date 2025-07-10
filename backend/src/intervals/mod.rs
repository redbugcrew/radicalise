use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    intervals::events::IntervalsEvent,
    realtime::RealtimeState,
    shared::{COLLECTIVE_ID, entities::Interval, events::AppEvent},
};

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_interval))
}

#[utoipa::path(post, path = "/",
    request_body(content = Interval, content_type = "application/json"),
    responses(
        (status = 201, description = "Collective found successfully", body = Vec<AppEvent>),
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

    match repo::insert_interval(interval, COLLECTIVE_ID, &pool).await {
        Ok(response) => {
            let event = AppEvent::IntervalsEvent(IntervalsEvent::IntervalCreated(response));
            realtime_state
                .broadcast_app_event(auth_session, event.clone())
                .await;
            return (StatusCode::CREATED, Json(vec![event])).into_response();
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
