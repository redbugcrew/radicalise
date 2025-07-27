use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    crews::events::CrewsEvent,
    realtime::RealtimeState,
    shared::{default_collective_id, entities::CrewWithLinks, events::AppEvent},
};

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(update_crew))
}

#[utoipa::path(put, path = "/{crew_id}",
    request_body(content = CrewWithLinks, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = ()),
    ),
)]
pub async fn update_crew(
    Path(crew_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Json(input): Json<CrewWithLinks>,
) -> impl IntoResponse {
    println!("Updating crew with ID {}: {:?}", crew_id, input);

    if input.id != crew_id {
        return (StatusCode::BAD_REQUEST, "Crew ID mismatch").into_response();
    }

    match repo::update_crew_with_links(default_collective_id(), input, &pool).await {
        Ok(response) => {
            let event = AppEvent::CrewsEvent(CrewsEvent::CrewUpdated(response));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
