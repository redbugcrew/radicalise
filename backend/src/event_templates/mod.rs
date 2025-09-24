use axum::{http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::shared::events::AppEvent;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_event_template))
}

#[derive(Deserialize, ToSchema, Debug)]
pub struct EventTemplateCreationData {
    pub name: String,
}

#[utoipa::path(post, path = "/",
    request_body(content = EventTemplateCreationData, content_type = "application/json"),
    responses(
        (status = 201, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
async fn create_event_template(
    axum::extract::Json(event_template): axum::extract::Json<EventTemplateCreationData>,
) -> impl IntoResponse {
    println!("Creating event template: {:?}", event_template);

    (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
}
