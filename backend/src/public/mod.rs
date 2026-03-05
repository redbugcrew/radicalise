use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{my_project::repo::find_project_by_slug, shared::entities::Project};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_project_by_slug))
        .routes(routes!(crate::entry_pathways::create_eoi))
        .routes(routes!(crate::entry_pathways::update_eoi))
        .routes(routes!(crate::entry_pathways::delete_eoi))
        .routes(routes!(crate::entry_pathways::get_eoi_by_auth_token))
        .routes(routes!(crate::calendar_events::get_calendar_ics))
}

#[utoipa::path(get, path = "/project/by_slug/{project_slug}", responses(
        (status = 200, body = Project),
        (status = NOT_FOUND, description = "Project was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ), params(
            ("project_slug" = String, Path, description = "Project slug")
        ),)]
async fn get_project_by_slug(
    Path(project_slug): Path<String>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let project_result = find_project_by_slug(project_slug, &pool).await;

    match project_result {
        Ok(project) => (StatusCode::OK, Json(project)).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}
