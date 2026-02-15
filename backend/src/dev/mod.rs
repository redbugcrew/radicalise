use axum::{Extension, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    intervals::repo::find_all_intervals,
    my_collective::involvements_repo::set_implicit_counter_to_zero,
    shared::{
        default_collective_id, entities::CollectiveId,
        regular_tasks::add_interval_implicit_involvements,
    },
};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(recompute_implicit_involvements))
}

#[utoipa::path(
    post,
    path = "/recompute_implicit_involvements",
    responses(
        (status = 200, description = "Recomputation started successfully", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    )
)]
async fn recompute_implicit_involvements(
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let intervals = find_all_intervals(default_collective_id(), &pool)
        .await
        .unwrap();

    set_implicit_counter_to_zero(default_collective_id(), &pool)
        .await
        .unwrap();

    for interval in intervals {
        println!(
            "Recomputing implicit involvements for interval {}",
            interval.id
        );
        if let Err(e) =
            add_interval_implicit_involvements(&interval, default_collective_id(), true, &pool)
                .await
        {
            eprintln!(
                "Error recomputing implicit involvements for interval {}: {:?}",
                interval.id, e
            );
        }
    }

    (StatusCode::OK, ()).into_response()
}
