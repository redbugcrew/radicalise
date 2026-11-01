use axum::{
    Extension, Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    people::repo::create_person,
    shared::entities::{Project, UserId},
};

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
    ServerError,
}

impl From<repo::CreateProjectError> for CreateProjectError {
    fn from(e: repo::CreateProjectError) -> Self {
        match e {
            repo::CreateProjectError::SlugAlreadyTaken => CreateProjectError::SlugAlreadyTaken,
            _ => CreateProjectError::ServerError, // Default mapping for other errors
        }
    }
}

#[derive(Deserialize, ToSchema, Clone)]
pub struct NewProjectData {
    name: String,
    slug: String,
    person_name: String,
}

impl Into<Project> for NewProjectData {
    fn into(self) -> Project {
        Project {
            name: self.name,
            slug: self.slug,
            id: -1,
            ..Project::default()
        }
    }
}

#[utoipa::path(post, path = "/",
    request_body(content = NewProjectData, content_type = "application/json"),
    responses(
        (status = CREATED, body = Project),
        (status = BAD_REQUEST, description = "Bad request", body = CreateProjectError),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = UNAUTHORIZED, body = ()),
    )
)]
pub async fn create_project(
    Extension(pool): Extension<SqlitePool>,
    auth_session: AuthSession,
    Json(input): Json<NewProjectData>,
) -> impl IntoResponse {
    let user_id = match auth_session.user().await {
        Some(user) => UserId::new(user.id),
        None => {
            eprintln!("Unauthorized access to get_visible_projects");
            return (StatusCode::UNAUTHORIZED, ()).into_response();
        }
    };

    let project = match repo::create_project(input.clone().into(), &pool).await {
        Ok(project) => project,
        Err(e) => {
            return match e {
                repo::CreateProjectError::SqlxError(e) => db_error(e, "Failed to create project with links"),
                e => (StatusCode::BAD_REQUEST, Json(CreateProjectError::from(e))).into_response(),
            };
        }
    };

    match create_person(project.typed_id(), user_id, input.person_name, &pool).await {
        Ok(person) => person,
        Err(e) => {
            eprintln!("Database error: {:?} - {}", e, "creating person for new project");
            return (StatusCode::BAD_REQUEST, Json(CreateProjectError::ServerError)).into_response();
        }
    };

    (StatusCode::CREATED, Json(project)).into_response()
}
