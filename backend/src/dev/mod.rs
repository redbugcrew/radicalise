use axum::{Extension, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    circles::repo::find_all_circles,
    intervals::{repo::find_all_intervals, tasks::add_interval_implicit_involvements},
    my_project::involvements_repo::set_implicit_counter_to_zero,
    shared::entities::ProjectId,
};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(recompute_implicit_involvements))
}

#[utoipa::path(
    post,
    path = "/projects/{project_id}/recompute_implicit_involvements",
    params(
        ("project_id" = i64, Path, description = "Project ID")
    ),
    responses(
        (status = 200, description = "Recomputation started successfully", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    )
)]
async fn recompute_implicit_involvements(Path(project_id): Path<i64>, Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let intervals = find_all_intervals(ProjectId::new(project_id), &pool).await.unwrap();

    let circles = find_all_circles(ProjectId::new(project_id), &pool).await.unwrap();

    for circle in &circles {
        println!("Recomputing implicit involvements for circle {}", circle.id);

        set_implicit_counter_to_zero(circle.typed_id(), &pool).await.unwrap();
    }

    for interval in intervals {
        println!("Recomputing implicit involvements for interval {}", interval.id);
        if let Err(e) = add_interval_implicit_involvements(&interval, ProjectId::new(project_id), true, &pool).await {
            eprintln!("Error recomputing implicit involvements for interval {}: {:?}", interval.id, e);
        }
    }

    (StatusCode::OK, ()).into_response()
}
