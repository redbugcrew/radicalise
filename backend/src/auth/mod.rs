use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::auth::{auth_backend::User, auth_repo::AuthRepo, auth_routes::auth_router};

pub mod auth_backend;
mod auth_email;
pub mod auth_repo;
pub mod auth_routes;

pub fn router() -> utoipa_axum::router::OpenApiRouter {
    auth_router()
}

#[derive(Serialize, ToSchema)]
pub struct UserPermissions {
    pub signup_enabled: bool,
    pub first_use: bool,
    pub is_admin: bool,
    pub can_create_projects: bool,
}

pub async fn load_user_permissions(current_user: &Option<User>, pool: &SqlitePool) -> UserPermissions {
    let repo = AuthRepo::new(pool);
    let has_users = repo.has_users().await.unwrap_or(false);

    UserPermissions {
        signup_enabled: !has_users,
        first_use: !has_users,
        is_admin: current_user.as_ref().is_some_and(|user| user.is_admin),
        can_create_projects: current_user.as_ref().is_some_and(|user| user.can_create_projects),
    }
}
