use axum::{Json, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

#[derive(Serialize, Deserialize, ToSchema)]
struct Collective {
    pub id: u32,
    pub name: String,
}

pub(super) fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(get_state))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = Collective),
        (status = NOT_FOUND, description = "Collective was not found")
    ),)]
async fn get_state() -> impl IntoResponse {
    let collective = Collective {
        id: 1,
        name: "Example Collective".to_string(),
    };

    (StatusCode::OK, Json(collective))
}
