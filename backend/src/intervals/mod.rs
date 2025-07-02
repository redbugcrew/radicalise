use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::shared::entities::Interval;

mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_interval))
}

#[utoipa::path(post, path = "/",
    responses(
        (status = 200, description = "Collective found successfully", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),
    request_body(content = Interval, content_type = "application/json")
)]
async fn create_interval(Extension(_pool): Extension<SqlitePool>) -> impl IntoResponse {
    let interval = Interval {
        id: 0, // This will be set by the database
        start_date: "2025-01-01".to_string(),
        end_date: "2025-01-08".to_string(),
    };

    println!("Creating interval: {:?}", interval);

    // match repo::insert_interval(interval, &pool).await {
    //     Ok(inserted_interval) => (StatusCode::OK, ()).into_response(),
    //     Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    // }

    (StatusCode::OK, ()).into_response()
}
