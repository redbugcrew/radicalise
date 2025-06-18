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

#[derive(Serialize, Deserialize, ToSchema)]
struct Person {
    pub id: i64,
    pub display_name: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
struct Interval {
    pub id: i64,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
struct InitialData {
    pub collective: Collective,
    pub people: Vec<Person>,
    pub intervals: Vec<Interval>,
}

const COLLECTIVE_GROUP_ID: i64 = 1;
const COLLECTIVE_ID: i64 = 1;

pub(super) fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(get_state))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = InitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ())
    ),)]
async fn get_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let collective_result = sqlx::query_as!(
        Collective,
        "SELECT id, name FROM groups WHERE id = ?",
        COLLECTIVE_GROUP_ID
    )
    .fetch_one(&pool)
    .await;

    match collective_result {
        Ok(collective) => {
            let people_result = sqlx::query_as!(Person, "SELECT id, display_name FROM people")
                .fetch_all(&pool)
                .await;

            let interval_result = sqlx::query_as!(
                Interval,
                "SELECT id, start_date, end_date FROM intervals WHERE collective_id = ?",
                COLLECTIVE_ID
            )
            .fetch_all(&pool)
            .await;

            if interval_result.is_err() || people_result.is_err() {
                return (StatusCode::NOT_FOUND, ()).into_response();
            }
            let people = people_result.unwrap();
            let intervals = interval_result.unwrap();

            let initial_data = InitialData {
                collective,
                people,
                intervals,
            };
            return (StatusCode::OK, Json(initial_data)).into_response();
        }
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}
