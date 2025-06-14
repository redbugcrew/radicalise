use utoipa_axum::{router::OpenApiRouter, routes};

pub(super) fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(forgot_password))
}

#[utoipa::path(post, path = "/forgot_password", responses((status = OK, body = String)))]
async fn forgot_password() -> axum::response::Response {
    println!("Handling forgot password request");

    // Here you would implement the logic for handling the forgot password request
    // For now, we will just return a placeholder response
    axum::response::Response::builder()
        .status(axum::http::StatusCode::OK)
        .body(axum::body::Body::from("Forgot password endpoint"))
        .unwrap()
}
