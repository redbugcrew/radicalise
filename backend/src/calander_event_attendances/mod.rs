mod repo;

use axum::{
    response::IntoResponse,
    http::StatusCode,
};
use serde::Deserialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_calendar_event_attendance))
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
    axum::extract::Json(input): axum::extract::Json<CreateAttendanceRequest>,
) ->impl IntoResponse {
    println!("intention: {}, calendar_event_id:{}", input.intention, input.calendar_event_id);   
    (StatusCode::OK, ())
}

