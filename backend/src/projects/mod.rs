use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    projects::repo::CreateProjectError,
    shared::entities::{Project, UserId},
};

mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_project))
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

    let project = match repo::create_project_and_dependent_records(input.clone().into(), user_id, input.person_name.clone(), &pool).await {
        Ok(project) => project,
        Err(e) => {
            return (StatusCode::BAD_REQUEST, Json(e)).into_response();
        }
    };

    (StatusCode::CREATED, Json(project)).into_response()
}
