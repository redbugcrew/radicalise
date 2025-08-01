use axum::{extract::Path, http::StatusCode, response::IntoResponse, Extension, Json};
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::{
    entry_pathways::repo::{find_entry_pathway_by_auth_token}, my_collective::repo::find_collective, realtime::RealtimeState, shared::{
        entities::{CollectiveId, EntryPathway, ExpressionOfInterest},
        events::AppEvent,
    }
};

pub mod events;
pub mod repo;

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
    request_body(content = ExpressionOfInterest, content_type = "application/json")
)]
pub async fn create_eoi(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    axum::extract::Json(submission): axum::extract::Json<ExpressionOfInterest>,
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
        Ok(entry_pathway) => {
            // raise the realtime event
            let event = events::EntryPathwayEvent::EntryPathwayUpdated(entry_pathway);
            realtime_state
                .broadcast_app_event(None, AppEvent::EntryPathwayEvent(event))
                .await;

            return (StatusCode::CREATED, ()).into_response();
        }
        Err(e) => {
            // If is a unique constraint violation, return a 400 Bad Request
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

#[utoipa::path(
    get,
    path = "/entry_pathway/by_auth_token/{auth_token}",
    params(
        ("auth_token" = String, Path, description = "Authentication token for the entry pathway")
    ),
    responses(
        (status = OK, body = EntryPathway),
        (status = NOT_FOUND, description = "Entry pathway not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ())
    ),
)]
pub async fn get_entry_pathway_by_auth_token(
    Path(auth_token): Path<String>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let result = find_entry_pathway_by_auth_token(&auth_token, &pool).await; 
    match result {
        Ok(Some(entry_pathway)) => {
            return (StatusCode::OK, Json(entry_pathway)).into_response();
        }
        Ok(None) => {
            println!("No entry pathway found for auth token: {}", auth_token);
            return (StatusCode::NOT_FOUND, ()).into_response();
        }
        Err(e) => {
            eprintln!("Failed to find entry pathway by auth token: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    }
}