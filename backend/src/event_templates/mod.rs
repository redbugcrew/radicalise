use axum::{Extension, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::shared::default_collective_id;

use self::repo::EventTemplateCreationData;

pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_event_template))
}

#[utoipa::path(post, path = "/",
    request_body(content = EventTemplateCreationData, content_type = "application/json"),
    responses(
        (status = 201, body = ()),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
)]
async fn create_event_template(
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(event_template): axum::extract::Json<EventTemplateCreationData>,
) -> impl IntoResponse {
    println!("Creating event template: {:?}", event_template);

    match repo::insert_event_template_with_links(&event_template, default_collective_id(), &pool)
        .await
    {
        Ok(event) => (StatusCode::CREATED, ()).into_response(),
        Err(err) => {
            eprintln!("Failed to create event template: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
        }
    }
}
