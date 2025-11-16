use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession, calendar_events, event_templates, realtime::RealtimeState, shared::{default_collective_id, entities::{CalendarEvent, EventTemplate}, events::AppEvent}
};

use self::events::CalendarEventsEvent;

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_calendar_event))
        // .routes(routes!(update_event_record))
}

#[utoipa::path(
    post,
    path = "/",
    request_body(content = CalendarEvent, content_type = "application/json"),
    responses(
        (status = 201, body = ()),
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
            (StatusCode::OK, Json(vec![event])).into_response()
            // StatusCode::OK    
        }
        Err(err) => {
            eprintln!("Failed to create calendar event: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
            //  StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

// #[utoipa::path(
//     put,
//     path = "/{event_record_id}",
//     request_body(content = EventRecord, content_type = "application/json"),
//     responses(
//         (status = 201, body = ()),
//         (status = INTERNAL_SERVER_ERROR, body = ()),
//     ),
// )]
// async fn update_event_record(
//     Path(event_record_id): Path<i64>,
//     Extension(pool): Extension<SqlitePool>,
//     Extension(realtime_state): Extension<RealtimeState>,
//     auth_session: AuthSession,
//     axum::extract::Json(data): axum::extract::Json<EventRecord>,
// ) -> impl IntoResponse {
//     println!(
//         "Updating event record with ID {}: {:?}",
//         event_record_id, data
//     );

//     // match repo::update_event_record_with_links(&data, default_collective_id(), &pool).await {
//     //     Ok(event_record) => {
//     //         let event = AppEvent::EventRecordsEvent(EventRecordsEvent::EventRecordUpdated(
//     //             event_record,
//     //         ));
//     //         realtime_state
//     //             .broadcast_app_event(Some(auth_session), event.clone())
//     //             .await;
//     //         (StatusCode::OK, Json(vec![event])).into_response()
//     //     }
//     //     Err(err) => {
//     //         eprintln!("Failed to create event record: {}", err);
//     //         (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
//     //     }
//     // }
//
