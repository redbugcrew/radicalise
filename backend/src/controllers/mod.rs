use utoipa_axum::router::OpenApiRouter;

pub mod collective;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .nest("/auth", crate::auth::router())
        .nest("/collective", crate::controllers::collective::router())
}
