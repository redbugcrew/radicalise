use axum::{Extension, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;

use crate::{
    my_collective::repo::find_collective,
    shared::entities::{CollectiveId, Eoi},
};

mod repo;

#[utoipa::path(
    post,
    path = "/eoi",
    responses(
        (status = 201, body = ()),
        (status = BAD_REQUEST, body = String),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
    request_body(content = Eoi, content_type = "application/json")
)]
pub async fn create_eoi(
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(submission): axum::extract::Json<Eoi>,
) -> impl IntoResponse {
    println!("Creating EOI for details: {:?}", submission);

    let collective_result =
        find_collective(CollectiveId::new(submission.collective_id), &pool).await;
    if collective_result.is_err() {
        eprintln!("Collective not found for ID: {}", submission.collective_id);
        return (StatusCode::BAD_REQUEST, "Collective not found".to_string()).into_response();
    }
    let collective = collective_result.unwrap();

    if !collective.feature_eoi {
        eprintln!(
            "EOI feature is not enabled for collective ID: {}",
            submission.collective_id
        );
        return (
            StatusCode::BAD_REQUEST,
            "EOI feature is not enabled".to_string(),
        )
            .into_response();
    }

    let create_result = repo::create_eoi(submission, &pool).await;

    match create_result {
        Ok(_) => (StatusCode::CREATED, ()),
        Err(e) => {
            eprintln!("Failed to create EOI: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    }
    .into_response()
}
