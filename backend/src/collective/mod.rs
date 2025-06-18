use std::str::FromStr;

use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
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

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type)]
enum InvolvementStatus {
    Participating,
    OnHiatus,
}

impl FromStr for InvolvementStatus {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Participating" => Ok(InvolvementStatus::Participating),
            "OnHiatus" => Ok(InvolvementStatus::OnHiatus),
            _ => Err(()),
        }
    }
}

impl TryFrom<String> for InvolvementStatus {
    type Error = ();

    fn try_from(value: String) -> Result<Self, Self::Error> {
        InvolvementStatus::from_str(&value)
    }
}

#[derive(Serialize, Deserialize, ToSchema)]
struct Involvement {
    pub id: i64,
    pub person_id: i64,
    pub group_id: i64,
    pub start_interval_id: i64,
    pub end_interval_id: Option<i64>,
    pub status: InvolvementStatus,
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
    OpenApiRouter::new()
        .routes(routes!(get_state))
        .routes(routes!(get_involvements))
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

#[utoipa::path(get, path = "/interval/{interval_id}/involvements", responses(
        (status = 200, description = "Involvements successfully", body = Vec<Involvement>),
        (status = NOT_FOUND, description = "Not found", body = ())
    ), params(
            ("interval_id" = i64, Path, description = "Interval ID")
        ),)]
async fn get_involvements(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let involvements_result = sqlx::query_as!(
        Involvement,
        "SELECT id, person_id, group_id, start_interval_id, end_interval_id, status as \"status: InvolvementStatus\" FROM involvements
        WHERE
          (start_interval_id <= ? AND (end_interval_id IS NULL OR end_interval_id >= ?)) AND
          group_id = ?",
        interval_id,
        interval_id,
        COLLECTIVE_GROUP_ID
    )
    .fetch_all(&pool)
    .await;

    match involvements_result {
        Ok(involvements) => (StatusCode::OK, Json(involvements)).into_response(),
        Err(e) => {
            println!("Error fetching involvements: {:?}", e);
            return (StatusCode::NOT_FOUND, ()).into_response();
        }
    }
}
