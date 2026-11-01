use axum::{
    Extension, Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::shared::entities::Project;

mod repo;

fn db_error(e: impl std::fmt::Debug, msg: &str) -> Response {
    eprintln!("Database error: {:?} - {}", e, msg);
    (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
}

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_project))
}

#[derive(Serialize, ToSchema)]
enum CreateProjectError {
    SlugAlreadyTaken,
}

impl From<repo::CreateProjectError> for CreateProjectError {
    fn from(e: repo::CreateProjectError) -> Self {
        match e {
            repo::CreateProjectError::SlugAlreadyTaken => CreateProjectError::SlugAlreadyTaken,
            _ => CreateProjectError::SlugAlreadyTaken, // Default mapping for other errors
        }
    }
}

#[utoipa::path(post, path = "/",
    request_body(content = Project, content_type = "application/json"),
    responses(
        (status = CREATED, body = Project),
        (status = BAD_REQUEST, description = "Bad request", body = CreateProjectError),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    )
)]
pub async fn create_project(Extension(pool): Extension<SqlitePool>, Json(input): Json<Project>) -> impl IntoResponse {
    println!("Creating project: {:?}", input);

    match repo::create_project(input, &pool).await {
        Ok(project) => (StatusCode::CREATED, Json(project)).into_response(),
        Err(e) => match e {
            repo::CreateProjectError::SqlxError(e) => db_error(e, "Failed to create project with links"),
            e => (StatusCode::BAD_REQUEST, Json(CreateProjectError::from(e))).into_response(),
        },
    }
}
