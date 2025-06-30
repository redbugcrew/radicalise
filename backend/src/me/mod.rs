use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    me::repo::MyInitialData,
    shared::{
        COLLECTIVE_ID,
        entities::{
            CollectiveInvolvementWithDetails, InvolvementStatus, OptOutType, ParticipationIntention,
        },
    },
};

mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_my_state))
        .routes(routes!(my_participation))
        .routes(routes!(update_my_participation))
}

#[utoipa::path(get, path = "/", responses(
        (status = 200, description = "Collective found successfully", body = MyInitialData),
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),)]
async fn get_my_state(
    Extension(pool): Extension<SqlitePool>,
    auth_session: AuthSession,
) -> impl IntoResponse {
    match auth_session.user {
        Some(user) => {
            let result = repo::find_initial_data_for_me(COLLECTIVE_ID, user.id, &pool).await;

            match result {
                Ok(initial_data) => (StatusCode::OK, Json(initial_data)).into_response(),
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }
        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}

#[utoipa::path(
    get,
    path = "/participation/interval/{interval_id}",
    params(
        ("interval_id" = i64, Path, description = "Interval ID")
    ),
    responses(
        (status = 200, description = "Fetched my participation successfully", body = Option<CollectiveInvolvementWithDetails>),
        (status = NOT_FOUND, description = "Not found", body = ())
    ),
)]
async fn my_participation(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    auth_session: AuthSession,
) -> impl IntoResponse {
    match auth_session.user {
        Some(user) => {
            let result =
                repo::find_detailed_involvement(COLLECTIVE_ID, user.id, interval_id, &pool).await;

            match result {
                Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
                Ok(None) => (StatusCode::NOT_FOUND, ()).into_response(),
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }
        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyParticipationInput {
    pub collective_id: i64,
    pub wellbeing: Option<String>,
    pub focus: Option<String>,
    pub capacity: Option<String>,
    pub participation_intention: Option<ParticipationIntention>,
    pub opt_out_type: Option<OptOutType>,
    pub opt_out_planned_return_date: Option<String>,
}

#[utoipa::path(
    post,
    path = "/interval/{interval_id}/my_participation",
    params(
        ("interval_id" = i64, Path, description = "Interval ID")
    ),
    request_body(
        content = MyParticipationInput, description = "Detailed involvement",
        content_type = "application/json"
    ),
    responses(
        (status = 200, description = "Updated my participation successfully", body = Option<CollectiveInvolvementWithDetails>),
        (status = NOT_FOUND, description = "Not found", body = ())
    ),
)]
async fn update_my_participation(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    auth_session: AuthSession,
    axum::extract::Json(input): axum::extract::Json<MyParticipationInput>,
) -> impl IntoResponse {
    match auth_session.user {
        Some(user) => {
            let status: InvolvementStatus = input.participation_intention.clone().map_or(
                InvolvementStatus::Participating,
                |intention| match intention {
                    ParticipationIntention::OptIn => InvolvementStatus::Participating,
                    ParticipationIntention::OptOut => InvolvementStatus::OnHiatus,
                },
            );

            let result = repo::upsert_detailed_involvement(
                CollectiveInvolvementWithDetails {
                    id: -1, // ID will be auto-generated
                    person_id: user.id,
                    collective_id: input.collective_id,
                    interval_id,
                    status,
                    wellbeing: input.wellbeing,
                    focus: input.focus,
                    capacity: input.capacity,
                    participation_intention: input.participation_intention,
                    opt_out_type: input.opt_out_type,
                    opt_out_planned_return_date: input.opt_out_planned_return_date,
                },
                &pool,
            )
            .await;

            if result.is_err() {
                eprintln!("Error updating involvement: {:?}", result.err());
                return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
            }

            // Fetch the updated involvement to return
            let output_result =
                repo::find_detailed_involvement(COLLECTIVE_ID, user.id, interval_id, &pool).await;
            match output_result {
                Ok(Some(updated_involvement)) => {
                    return (StatusCode::OK, Json(updated_involvement)).into_response();
                }
                Ok(None) => return (StatusCode::NOT_FOUND, ()).into_response(),
                Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
            }
        }

        None => return (StatusCode::UNAUTHORIZED, ()).into_response(),
    }
}
