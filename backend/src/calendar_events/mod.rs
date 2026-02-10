use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    realtime::RealtimeState,
    shared::{
        default_collective_id,
        entities::{CalendarEvent, CalendarEventId},
        events::AppEvent,
    },
};

use self::events::CalendarEventsEvent;

pub mod events;
mod ical;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_calendar_event))
        .routes(routes!(update_calendar_event))
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

    match repo::insert_calendar_event_with_links(
        &data,
        data.event_template_id,
        default_collective_id(),
        &pool,
    )
    .await
    {
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
    put,
    path = "/{event_id}",
    request_body(content = CalendarEvent, content_type = "application/json"),
    responses(
        (status = OK, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
async fn update_calendar_event(
    Path(event_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    axum::extract::Json(data): axum::extract::Json<CalendarEvent>,
) -> impl IntoResponse {
    println!("Updating calendar event with ID {}: {:?}", event_id, data);

    match repo::update_calendar_event_with_links(
        CalendarEventId::new(event_id),
        &data,
        data.event_template_id,
        default_collective_id(),
        &pool,
    )
    .await
    {
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
    path = "/{calendar_token}/calendar.ics",
    responses(
        (status = OK, body = String, description = "ICS calendar data"),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
pub async fn get_calendar_ics(Path(calendar_token): Path<String>) -> impl IntoResponse {
    println!(
        "Received request for calendar ICS with token: {}",
        calendar_token
    );

    let my_calendar = ical::get_ical_string();

    (StatusCode::OK, my_calendar).into_response()
}
