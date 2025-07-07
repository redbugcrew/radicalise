use utoipa_axum::router::OpenApiRouter;

pub fn api_router() -> OpenApiRouter {
    OpenApiRouter::new()
        .nest("/collective", crate::collective::router())
        .nest("/me", crate::me::router())
        .nest("/intervals", crate::intervals::router())
        .nest("/crews", crate::crews::router())
}
