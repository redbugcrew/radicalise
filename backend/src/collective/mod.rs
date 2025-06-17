use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

#[derive(Serialize, Deserialize, ToSchema)]
struct Collective {
    pub id: i64,
    pub name: Option<String>,
}

pub(super) fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(get_state))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = Collective),
        (status = NOT_FOUND, description = "Collective was not found", body = ())
    ),)]
async fn get_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let result = sqlx::query_as!(Collective, "SELECT id, name FROM groups WHERE id = 1")
        .fetch_one(&pool)
        .await;

    match result {
        Ok(collective) => (StatusCode::OK, Json(collective)).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}
