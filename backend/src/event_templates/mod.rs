use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    realtime::RealtimeState,
    shared::{default_collective_id, entities::EventTemplate, events::AppEvent},
};

use self::events::EventTemplatesEvent;

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_event_template))
        .routes(routes!(update_event_template))
}

#[utoipa::path(
    post,
    path = "/",
    request_body(content = EventTemplate, content_type = "application/json"),
    responses(
        (status = 201, body = ()),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
async fn create_event_template(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(data): axum::extract::Json<EventTemplate>,
) -> impl IntoResponse {
    println!("Creating event template: {:?}", data);

    match repo::insert_event_template_with_links(&data, default_collective_id(), &pool).await {
        Ok(event_template) => {
            let event = AppEvent::EventTemplatesEvent(EventTemplatesEvent::EventTemplateUpdated(
                event_template,
            ));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(err) => {
            eprintln!("Failed to create event template: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
        }
    }
}

#[utoipa::path(
    put,
    path = "/{event_template_id}",
    request_body(content = EventTemplate, content_type = "application/json"),
    responses(
        (status = 201, body = ()),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
async fn update_event_template(
    Path(event_template_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(data): axum::extract::Json<EventTemplate>,
) -> impl IntoResponse {
    println!(
        "Updating event template with ID {}: {:?}",
        event_template_id, data
    );

    match repo::update_event_template_with_links(&data, default_collective_id(), &pool).await {
        Ok(event_template) => {
            let event = AppEvent::EventTemplatesEvent(EventTemplatesEvent::EventTemplateUpdated(
                event_template,
            ));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(err) => {
            eprintln!("Failed to create event template: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
        }
    }
}
