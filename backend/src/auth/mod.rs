use axum::{
    Extension,
    http::{Response, StatusCode},
    response::IntoResponse,
};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::auth::auth_repo::{AuthRepo, AuthRepoError};

mod auth_repo;

pub(super) fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(forgot_password))
}

#[derive(ToSchema, Deserialize)]
struct ForgotPasswordRequest {
    email: String,
}

#[utoipa::path(
    post, path = "/forgot_password",
    responses(
        (status = OK, body = String),
        (status = INTERNAL_SERVER_ERROR, body = String),
        (status = UNAUTHORIZED, body = String)
    ),
    request_body(content = ForgotPasswordRequest, description = "Forgot password request", content_type = "application/json")
)]
async fn forgot_password(
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(payload): axum::extract::Json<ForgotPasswordRequest>,
) -> Result<Response<axum::body::Body>, Response<axum::body::Body>> {
    println!(
        "Handling forgot password request for email {}",
        payload.email.clone()
    );

    let repo = AuthRepo::new(&pool);

    let _user = repo
        .user_for_email(payload.email.clone())
        .await
        .map_err(repo_error_handler)?;

    // Here you would implement the logic for handling the forgot password request
    // For now, we will just return a placeholder response
    Ok((StatusCode::INTERNAL_SERVER_ERROR, ()).into_response())
}

fn repo_error_handler(error: AuthRepoError) -> Response<axum::body::Body> {
    let result = match error {
        crate::auth::auth_repo::AuthRepoError::UserNotFound => (StatusCode::UNAUTHORIZED, ()),
        crate::auth::auth_repo::AuthRepoError::DatabaseError => {
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    };
    result.into_response()
}
