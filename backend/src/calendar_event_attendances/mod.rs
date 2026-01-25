pub mod events;
pub mod repo;

use std::vec;

use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    calendar_event_attendances::{
        events::CalendarEventAttendancesEvent, repo::upsert_event_attendance,
    },
    people::repo::find_person_by_user_id,
    realtime::RealtimeState,
    shared::{
        entities::{AttendanceIntention, UserId},
        events::AppEvent,
    },
};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_calendar_event_attendance))
}

#[derive(Deserialize, ToSchema)]
pub struct CreateAttendanceRequest {
    pub calendar_event_id: i64,
    pub intention: Option<AttendanceIntention>,
}

#[utoipa::path(
    post,
    path = "/",
    request_body(content = CreateAttendanceRequest, content_type = "application/json"),
    responses(
        (status = CREATED, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, body = ())
    )
)]
async fn create_calendar_event_attendance(
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(input): axum::extract::Json<CreateAttendanceRequest>,
) -> impl IntoResponse {
    let user_id = UserId::new(auth_session.user.clone().unwrap().id);

    let person = match find_person_by_user_id(
        user_id.clone(),
        crate::shared::default_collective_id(),
        &pool,
    )
    .await
    {
        Ok(person) => person,
        Err(e) => {
            println!("error finding person for user_id {:?}: {}", user_id, e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    println!(
        "updating calendar event attendance with: intention: {:?}, calendar_event_id:{}, person_id: {}",
        input.intention, input.calendar_event_id, person.id
    );

    let result = upsert_event_attendance(
        input.calendar_event_id,
        input.intention,
        person.typed_id(),
        &pool,
    )
    .await;

    match result {
        Ok(attendance) => {
            let event = AppEvent::CalendarEventAttendancesEvent(
                CalendarEventAttendancesEvent::CalendarEventAttendanceUpdated(attendance),
            );
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;

            (StatusCode::CREATED, Json(vec![event])).into_response()
        }
        Err(e) => {
            println!("error updating calender event attendance: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    }
}
