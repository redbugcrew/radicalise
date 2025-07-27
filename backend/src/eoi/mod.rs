use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::{
    my_collective::repo::find_collective,
    shared::entities::{CollectiveId, Eoi},
};

mod repo;

#[derive(ToSchema, Debug, Serialize)]
enum EoiError {
    CollectiveNotFound,
    EoiFeatureDisabled,
    EmailAlreadyExists,
}

#[utoipa::path(
    post,
    path = "/eoi",
    responses(
        (status = 201, body = ()),
        (status = BAD_REQUEST, body = EoiError),
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
        return (StatusCode::BAD_REQUEST, Json(EoiError::CollectiveNotFound)).into_response();
    }
    let collective = collective_result.unwrap();

    if !collective.feature_eoi {
        eprintln!(
            "EOI feature is not enabled for collective ID: {}",
            submission.collective_id
        );
        return (StatusCode::BAD_REQUEST, Json(EoiError::EoiFeatureDisabled)).into_response();
    }

    let create_result = repo::create_eoi(submission, &pool).await;

    match create_result {
        Ok(_) => (StatusCode::CREATED, ()),
        Err(e) => {
            // If is a uniqu e constraint violation, return a 400 Bad Request
            if let sqlx::Error::Database(db_error) = &e {
                eprintln!("Database error: {}", db_error);
                println!("Database error code: {:?}", db_error.code());
                if db_error.code() == Some(std::borrow::Cow::Borrowed("2067")) {
                    eprintln!("EOI already exists for this collective");
                    return (StatusCode::BAD_REQUEST, Json(EoiError::EmailAlreadyExists))
                        .into_response();
                }
            }

            eprintln!("Failed to create EOI: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    }
    .into_response()
}
