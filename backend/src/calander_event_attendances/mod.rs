use axum::{
    response::IntoResponse,
    http::StatusCode,
};
use utoipa_axum::{router::OpenApiRouter, routes};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_calendar_event_attendance))
}

#[utoipa::path(
    get,
    path = "/",
    responses(
        (status = OK, body = ()),
    ),
    )]

async fn create_calendar_event_attendance(
) ->impl IntoResponse {
    println!("RSVP recorded");
    (StatusCode::OK, ())
}

