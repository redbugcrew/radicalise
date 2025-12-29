pub mod repo;

use axum::{Extension, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession, calander_event_attendances::repo::upsert_event_attendance,
};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_calendar_event_attendance))
}

#[derive(Deserialize, ToSchema)]
pub struct CreateAttendanceRequest {
    pub calendar_event_id: i64,
    pub intention: String,
}

#[utoipa::path(
    post,
    path = "/",
    request_body(content = CreateAttendanceRequest, content_type = "application/json"),

    responses(
        (status = OK, body = ())),
    )]

async fn create_calendar_event_attendance(
    auth_session: AuthSession,
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(input): axum::extract::Json<CreateAttendanceRequest>,
) -> impl IntoResponse {
    let user_id = auth_session.user.unwrap().id;
    println!(
        "updating calender event attendance with: intention: {}, calendar_event_id:{}, user_id:{}",
        input.intention, input.calendar_event_id, user_id
    );
    let result =
        upsert_event_attendance(input.calendar_event_id, input.intention, user_id, &pool).await;
    match result {
        Ok(_) => (StatusCode::OK, ()),
        Err(e) => {
            println!("error updating calender event attendance: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    }
}
