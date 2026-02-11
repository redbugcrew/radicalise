use axum::{
    Extension, Json,
    extract::Path,
    http::{StatusCode, header},
    response::IntoResponse,
};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    calendar_events::repo::list_calendar_events_person_attending,
    my_collective::repo::find_collective,
    people::repo::find_person_by_calendar_token,
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
        (status = OK, body = String, description = "ICS calendar data", content_type = "text/calendar"),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
pub async fn get_calendar_ics(
    Path(calendar_token): Path<String>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    println!(
        "Received request for calendar ICS with token: {}",
        calendar_token
    );

    let collective = match find_collective(default_collective_id(), &pool).await {
        Ok(collective) => collective,
        Err(err) => {
            eprintln!("Error looking up collective: {}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    let person = match find_person_by_calendar_token(&calendar_token, &pool).await {
        Ok(person) => person,
        Err(err) => {
            eprintln!("Error looking up person by calendar token: {}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    let events = match list_calendar_events_person_attending(
        collective.typed_id(),
        person.typed_id(),
        &pool,
    )
    .await
    {
        Ok(events) => events,
        Err(err) => {
            eprintln!("Error listing calendar events for person: {}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    let calendar_name = format!(
        "{} - {}",
        collective.name.unwrap_or("Radicalize".to_string()),
        person.display_name
    );

    let my_calendar = ical::get_ical_string(calendar_name, events);

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/calendar")],
        my_calendar,
    )
        .into_response()
}
