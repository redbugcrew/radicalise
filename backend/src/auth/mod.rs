use crate::auth::auth_routes::auth_router;

mod auth_email;
mod auth_repo;
pub mod auth_routes;
mod passwords;

pub fn router() -> utoipa_axum::router::OpenApiRouter {
    auth_router()
}
