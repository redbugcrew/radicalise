use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use axum_login::tracing::event;
use sqlx::{SqlitePool, pool};
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession, realtime::RealtimeState, shared::{default_collective_id, entities::{CalendarEvent}, events::AppEvent}
};

use self::events::CalendarEventsEvent;

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_calendar_event))
        .routes(routes!(list_calendar_events))
        // .routes(routes!(update_event_record))
}

#[utoipa::path(
    post,
    path = "/",
    request_body(content = CalendarEvent, content_type = "application/json"),
    responses(
        (status = CREATED, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
async fn create_calendar_event(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(data): axum::extract::Json<CalendarEvent>,
) -> impl IntoResponse {
    println!("Creating calendar event: {:?}", data);

    match repo::insert_calendar_event_with_links(&data, data.event_template_id, default_collective_id(), &pool).await {
        Ok(calendar_event) => {
            let event = AppEvent::CalendarEventsEvent(CalendarEventsEvent::CalendarEventUpdated(
                calendar_event,
            ));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::CREATED, Json(vec![event])).into_response()  
        }
        Err(err) => {
            eprintln!("Failed to create calendar event: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
        }
    }
}

#[utoipa::path(
    get,
    path = "/",
    responses(
        (status = OK, body = Vec<CalendarEvent>),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]

async fn list_calendar_events(
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {

    match repo::list_calendar_events(default_collective_id(),&pool).await {
        Ok(calendar_events) => {
            (StatusCode::OK, Json(calendar_events)).into_response()
        }
        Err(err) => {
            eprintln!("Failed to list calendar event: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
        }
    }
}

    // (StatusCode::OK, 
    // Json(Vec::<CalendarEvent>::new()).into_response())
