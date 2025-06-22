use axum::{
    Extension,
    http::{Response, StatusCode},
    response::IntoResponse,
};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use uuid::Uuid;

use crate::auth::auth_repo::{AuthRepo, AuthRepoError};

pub fn auth_router() -> OpenApiRouter {
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
    let repo = AuthRepo::new(&pool);

    let user = repo
        .user_for_email(payload.email.clone())
        .await
        .map_err(repo_error_handler)?;

    let password_reset_token = Uuid::new_v4().to_string();

    repo.set_password_reset_token(&user.id, password_reset_token.clone())
        .await
        .map_err(repo_error_handler)?;

    println!(
        "We got the user: {} with email: {}, set token: {}",
        user.display_name,
        user.email.as_deref().unwrap_or("No email provided"),
        password_reset_token
    );

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
