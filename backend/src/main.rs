use axum::{Router, routing::get};
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

use crate::database::prepare_database;

mod auth;
mod database;

#[macro_use]
extern crate lazy_static;

#[utoipa::path(post, path = "forgot_password", responses((status = OK, body = String)))]
async fn forgot_password() -> axum::response::Response {
    println!("Handling forgot password request");

    // Here you would implement the logic for handling the forgot password request
    // For now, we will just return a placeholder response
    axum::response::Response::builder()
        .status(axum::http::StatusCode::OK)
        .body(axum::body::Body::from("Forgot password endpoint"))
        .unwrap()
}

#[tokio::main]
async fn main() {
    #[derive(OpenApi)]
    #[openapi(
        tags(
            (name = "todo", description = "Todo items management API")
        )
    )]
    struct ApiDoc;

    //let cors = CorsLayer::new().allow_origin(Any); // Allow all origins (open policy)

    let _pool = prepare_database()
        .await
        .expect("Failed to prepare database");

    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .route("/", get(|| async { "Hello, World!" }))
        .nest("/auth", crate::auth::router())
        .split_for_parts();

    let router =
        router.merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", api.clone()));

    // // build our application with a single route
    // let app = Router::new()
    //     .route("/", get(|| async { "Hello, World!" }))
    //     .merge(router)
    //     .layer(cors);
    let app = router.into_make_service();

    // run our app with hyper, listening globally on port 8000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();

    println!("Listening on http://localhost:8000, Ctrl+C to stop");

    axum::serve(listener, app).await.unwrap();
}
