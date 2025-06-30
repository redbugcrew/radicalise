use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{me::repo::MyInitialData, shared::COLLECTIVE_ID};

mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(get_state))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = MyInitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),)]
async fn get_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let result = repo::find_initial_data_for_me(COLLECTIVE_ID, 1, 1, &pool).await;

    match result {
        Ok(initial_data) => (StatusCode::OK, Json(initial_data)).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
