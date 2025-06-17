use axum::{Extension, routing::get};
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

use crate::database::prepare_database;

mod auth;
mod collective;
mod database;

#[macro_use]
extern crate lazy_static;

#[tokio::main]
async fn main() {
    #[derive(OpenApi)]
    #[openapi()]
    struct ApiDoc;

    let cors = CorsLayer::new().allow_origin(Any); // Allow all origins (open policy)

    let pool = prepare_database()
        .await
        .expect("Failed to prepare database");

    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .route("/", get(|| async { "Hello, World!" }))
        .nest("/auth", crate::auth::router())
        .nest("/collective", crate::collective::router())
        .split_for_parts();

    let router = router
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", api.clone()))
        .layer(cors)
        .layer(Extension(pool));

    let app = router.into_make_service();

    // run our app with hyper, listening globally on port 8000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();

    println!("Listening on http://localhost:8000, Ctrl+C to stop");

    axum::serve(listener, app).await.unwrap();
}
