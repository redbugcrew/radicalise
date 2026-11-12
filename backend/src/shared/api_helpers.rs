use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

pub fn db_error(e: impl std::fmt::Debug, msg: &str) -> Response {
    tracing::error!("Database error: {:?} - {}", e, msg);
    (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
}
