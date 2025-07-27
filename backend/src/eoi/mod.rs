use axum::{Extension, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;

use crate::{
    my_collective::repo::find_collective,
    shared::entities::{CollectiveId, EOI},
};

#[utoipa::path(
    post,
    path = "/collective/{collective_id}/eoi",
    responses(
        (status = 201, body = ()),
        (status = NOT_FOUND, description = "Collective not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),
    params(
        ("collective_id" = i64, Path, description = "Collective ID")
    ),
    request_body(content = EOI, content_type = "application/json")
)]
pub async fn create_eoi(
    Extension(pool): Extension<SqlitePool>,
    Path(collective_id): Path<i64>,
    axum::extract::Json(submission): axum::extract::Json<EOI>,
) -> impl IntoResponse {
    println!(
        "Creating EOI for collective ID: {}, details: {:?}",
        collective_id, submission
    );

    let collective_result = find_collective(CollectiveId::new(collective_id), &pool).await;

    match collective_result {
        Ok(_) => (StatusCode::CREATED, ()).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}
