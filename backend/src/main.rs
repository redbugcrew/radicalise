use axum::{Extension, http::header, routing::get};
use axum_login::{
    AuthManagerLayerBuilder, login_required,
    tower_sessions::{Expiry, SessionManagerLayer},
};
use resend_rs::Resend;
use std::env;
use time::Duration;
use tower_http::cors::CorsLayer;
use tower_sessions::MemoryStore;
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

use crate::{
    api::api_router, auth::auth_backend::AppAuthBackend, database::prepare_database,
    static_server::frontend_handler,
};

mod api;
mod auth;
mod collective;
mod database;
mod intervals;
mod me;
mod shared;
mod static_server;

#[macro_use]
extern crate lazy_static;

#[tokio::main]
async fn main() {
    #[derive(OpenApi)]
    #[openapi()]
    struct ApiDoc;

    // CONFIG PARAMS
    let base_url =
        std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());

    // CORS
    let cors = CorsLayer::new()
        .allow_origin(base_url.parse::<header::HeaderValue>().unwrap())
        .allow_headers([header::AUTHORIZATION, header::ACCEPT, header::CONTENT_TYPE])
        .allow_credentials(true);

    // DATABASE
    let pool = prepare_database()
        .await
        .expect("Failed to prepare database");

    // SESSION MANAGEMENT
    let session_store = MemoryStore::default();
    let session_layer = SessionManagerLayer::new(session_store)
        .with_secure(false)
        .with_expiry(Expiry::OnInactivity(Duration::days(30)));
    let backend = AppAuthBackend::new(pool.clone());
    let auth_layer = AuthManagerLayerBuilder::new(backend, session_layer).build();

    // EMAIL
    let resend_key =
        env::var("RESEND_API_KEY").unwrap_or_else(|_| "YOUR-RESEND-KEY-HERE".to_string());

    let client = reqwest::Client::builder()
        .user_agent("Radicalise/1.0")
        .use_rustls_tls()
        .build()
        .expect("Failed to build reqwest client");

    let resend = Resend::with_client(&resend_key, client);

    // ROUTES
    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .nest(
            "/api",
            OpenApiRouter::new()
                .nest("/auth", crate::auth::router())
                .merge(api_router().route_layer(login_required!(AppAuthBackend))),
        )
        .split_for_parts();

    let router = router
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", api.clone()))
        .fallback_service(get(frontend_handler))
        .layer(cors)
        .layer(Extension(pool))
        .layer(Extension(resend))
        .layer(auth_layer);

    // SERVICE
    let app = router.into_make_service();

    // run our app with hyper, listening globally on port 8000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();

    println!("Listening on http://localhost:8000, Ctrl+C to stop");

    axum::serve(listener, app).await.unwrap();
}
