use utoipa_axum::router::OpenApiRouter;

pub fn api_router() -> OpenApiRouter {
    OpenApiRouter::new()
        .nest("/collective", crate::collective::router())
        .nest("/me", crate::me::router())
}
