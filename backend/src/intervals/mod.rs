use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    intervals::events::IntervalsEvent,
    shared::{COLLECTIVE_ID, entities::Interval},
};

mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_interval))
}

#[utoipa::path(post, path = "/",
    request_body(content = Interval, content_type = "application/json"),
    responses(
        (status = 201, description = "Collective found successfully", body = Vec<IntervalsEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),
)]
async fn create_interval(
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(interval): axum::extract::Json<Interval>,
) -> impl IntoResponse {
    println!("Creating interval: {:?}", interval);

    match repo::insert_interval(interval, COLLECTIVE_ID, &pool).await {
        Ok(response) => {
            let event = IntervalsEvent::IntervalCreated(response);
            return (StatusCode::CREATED, Json(vec![event])).into_response();
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
