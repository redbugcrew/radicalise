use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    my_project::repo::{find_project_by_slug, find_projects_for_user},
    shared::entities::{Project, UserId},
};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_project_by_slug))
        .routes(routes!(crate::calendar_events::get_calendar_ics))
        .routes(routes!(crate::invitations::get_invitation))
        .routes(routes!(get_visible_projects))
}

#[utoipa::path(get, path = "/projects/by_slug/{project_slug}", responses(
        (status = 200, body = Project),
        (status = NOT_FOUND, description = "Project was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ), params(
            ("project_slug" = String, Path, description = "Project slug")
        ),)]
async fn get_project_by_slug(Path(project_slug): Path<String>, Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let project_result = find_project_by_slug(project_slug, &pool).await;

    match project_result {
        Ok(project) => (StatusCode::OK, Json(project)).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}

#[utoipa::path(
    get,
    path = "/projects/visible",
    responses(
        (status = 200, body = [Project]),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ()),
    ),
)]
async fn get_visible_projects(auth_session: AuthSession, Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let user_id = match auth_session.user().await {
        Some(user) => UserId::new(user.id),
        None => {
            eprintln!("Unauthorized access to get_project_state");
            return (StatusCode::UNAUTHORIZED, ()).into_response();
        }
    };

    let projects = find_projects_for_user(user_id, &pool).await.unwrap_or_default();

    return (StatusCode::OK, Json(projects)).into_response();
}
