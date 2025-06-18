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
struct CollectiveState {
    pub collective: Collective,
    pub people: Vec<Person>,
}

const COLLECTIVE_ID: i64 = 1; // Assuming a single collective with ID 1

pub(super) fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(get_state))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = CollectiveState),
        (status = NOT_FOUND, description = "Collective was not found", body = ())
    ),)]
async fn get_state(Extension(pool): Extension<SqlitePool>) -> impl IntoResponse {
    let collective_result = sqlx::query_as!(
        Collective,
        "SELECT id, name FROM groups WHERE id = ?",
        COLLECTIVE_ID
    )
    .fetch_one(&pool)
    .await;

    match collective_result {
        Ok(collective) => {
            let people_result = sqlx::query_as!(Person, "SELECT id, display_name FROM people")
                .fetch_all(&pool)
                .await;

            match people_result {
                Ok(people) => {
                    let collective_state = CollectiveState { collective, people };
                    return (StatusCode::OK, Json(collective_state)).into_response();
                }
                Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
            }
        }
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}
