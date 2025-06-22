use argon2::{
    Argon2,
    password_hash::{PasswordHasher, SaltString},
};
use axum::{
    Extension,
    http::{Response, StatusCode},
    response::IntoResponse,
};
use rand::rngs::OsRng;
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use uuid::Uuid;

use crate::auth::{
    auth_email::reset_password_email,
    auth_repo::{AuthRepo, AuthRepoError},
};

pub fn auth_router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(forgot_password))
        .routes(routes!(reset_password))
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

fn repo_error_handler(error: AuthRepoError) -> Response<axum::body::Body> {
    let result = match error {
        crate::auth::auth_repo::AuthRepoError::UserNotFound => (StatusCode::UNAUTHORIZED, ()),
        crate::auth::auth_repo::AuthRepoError::DatabaseError => {
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    };
    result.into_response()
}

fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);

    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| {
            eprintln!("Error while hashing password: {}", e);
            e
        })
        .map(|hash| hash.to_string())
}
