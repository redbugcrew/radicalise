use axum::Extension;
use axum::Json;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::my_project::repo::find_projects_for_user;
use crate::shared::entities::UserId;
use crate::{auth::auth_backend::AuthSession, shared::entities::Project};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(get_visible_projects))
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
            eprintln!("Unauthorized access to get_visible_projects");
            return (StatusCode::UNAUTHORIZED, ()).into_response();
        }
    };

    let projects = find_projects_for_user(user_id, &pool).await.unwrap_or_default();

    (StatusCode::OK, Json(projects)).into_response()
}
