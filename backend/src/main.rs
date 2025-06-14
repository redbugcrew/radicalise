use axum::{Router, routing::get};
use tower_http::cors::{Any, CorsLayer};

use crate::database::prepare_database;

mod database;

#[macro_use]
extern crate lazy_static;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new().allow_origin(Any); // Allow all origins (open policy)

    let _pool = prepare_database().await;

    // build our application with a single route
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .layer(cors);

    // run our app with hyper, listening globally on port 8000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();

    println!("Listening on http://localhost:8000, Ctrl+C to stop");

    axum::serve(listener, app).await.unwrap();
}
