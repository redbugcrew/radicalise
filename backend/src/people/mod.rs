use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    people::events::PeopleEvent,
    realtime::RealtimeState,
    shared::{default_collective_id, entities::Person, events::AppEvent},
};

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(update_person))
}

#[utoipa::path(put, path = "/{person_id}",
    request_body(content = Person, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = ()),
    ),
)]
pub async fn update_person(
    Path(person_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Json(input): Json<Person>,
) -> impl IntoResponse {
    println!("Updating person with ID {}: {:?}", person_id, input);

    if input.id != person_id {
        return (StatusCode::BAD_REQUEST, "Person ID mismatch").into_response();
    }

    match repo::update_person(input, default_collective_id(), &pool).await {
        Ok(response) => {
            let event = AppEvent::PeopleEvent(PeopleEvent::PersonUpdated(response));
            realtime_state
                .broadcast_app_event(auth_session, event.clone())
                .await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
