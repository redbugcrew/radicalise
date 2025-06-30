use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    collective::repo::{InitialData, IntervalInvolvementData},
    shared::COLLECTIVE_ID,
};

mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_collective_state))
        .routes(routes!(get_involvements))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = InitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),)]
async fn get_collective_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let collective_result = repo::find_collective(COLLECTIVE_ID, &pool).await;

    match collective_result {
        Ok(collective) => {
            let initial_data_result =
                repo::find_initial_data_for_collective(collective, &pool).await;
            match initial_data_result {
                Ok(initial_data) => (StatusCode::OK, Json(initial_data)).into_response(),
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}

#[utoipa::path(get, path = "/interval/{interval_id}/involvements", responses(
        (status = 200, description = "Fetched Involvements successfully", body = IntervalInvolvementData),
        (status = NOT_FOUND, description = "Not found", body = ())
    ), params(
            ("interval_id" = i64, Path, description = "Interval ID")
        ),)]
async fn get_involvements(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let collective_involvements_result =
        repo::find_all_collective_involvements(interval_id, &pool).await;
    let crew_involvements_result = repo::find_all_crew_involvements(interval_id, &pool).await;

    if collective_involvements_result.is_err() || crew_involvements_result.is_err() {
        return (StatusCode::NOT_FOUND, ()).into_response();
    }
    let collective_involvements = collective_involvements_result.unwrap();
    let crew_involvements = crew_involvements_result.unwrap();

    let result = IntervalInvolvementData {
        interval_id,
        collective_involvements,
        crew_involvements,
    };

    return (StatusCode::OK, Json(result)).into_response();
}
