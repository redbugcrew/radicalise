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

use crate::auth::{
    auth_email::reset_password_email,
    auth_repo::{AuthRepo, AuthRepoError},
    passwords::{hash_password, verify_password},
};

pub fn auth_router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(forgot_password))
        .routes(routes!(reset_password))
        .routes(routes!(login))
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
    Extension(resend): Extension<resend_rs::Resend>,
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

    reset_password_email(&resend, payload.email.clone(), password_reset_token.clone())
        .await
        .map_err(|e| {
            eprintln!("Failed to send reset password email: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to send email").into_response()
        })?;

    Ok((StatusCode::OK, ()).into_response())
}

#[derive(ToSchema, Deserialize)]
struct ResetPasswordRequest {
    token: String,
    password: String,
}

#[utoipa::path(
    post, path = "/reset_password",
    responses(
        (status = OK, body = String),
        (status = INTERNAL_SERVER_ERROR, body = String),
        (status = UNAUTHORIZED, body = String)
    ),
    request_body(content = ResetPasswordRequest, description = "Reset password request", content_type = "application/json")
)]
async fn reset_password(
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(payload): axum::extract::Json<ResetPasswordRequest>,
) -> Result<Response<axum::body::Body>, Response<axum::body::Body>> {
    let repo = AuthRepo::new(&pool);
    let hashed_password = hash_password(&payload.password)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response())?;

    repo.set_password_if_token_valid(payload.token, hashed_password, 24)
        .await
        .map_err(repo_error_handler)?;

    Ok((StatusCode::OK, ()).into_response())
}

#[derive(ToSchema, Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[utoipa::path(
    post, path = "/login",
    responses(
        (status = OK, body = String),
        (status = INTERNAL_SERVER_ERROR, body = String),
        (status = UNAUTHORIZED, body = String)
    ),
    request_body(content = LoginRequest, description = "Attempt to log in", content_type = "application/json")
)]
async fn login(
    Extension(pool): Extension<SqlitePool>,
    axum::extract::Json(payload): axum::extract::Json<LoginRequest>,
) -> Result<Response<axum::body::Body>, Response<axum::body::Body>> {
    let repo = AuthRepo::new(&pool);
    let user = repo
        .user_for_email(payload.email.clone())
        .await
        .map_err(repo_error_handler)?;

    if user.hashed_password.is_none() {
        return Err((StatusCode::UNAUTHORIZED, "No password set").into_response());
    }
    let hashed_password = user.hashed_password.unwrap();

    if verify_password(&hashed_password, &payload.password) {
        Ok((StatusCode::OK, ()).into_response())
    } else {
        Err((StatusCode::UNAUTHORIZED, "Invalid credentials").into_response())
    }
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
