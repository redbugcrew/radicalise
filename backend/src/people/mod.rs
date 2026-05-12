use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::{auth_backend::AuthSession, auth_repo::AuthRepo},
    circles::repo::find_circle_by_id,
    intervals::repo::find_current_interval,
    my_project::involvements_repo::insert_circle_involvement,
    people::{
        events::PeopleEvent,
        invitatations_service::{InvitePersonError, InvitePersonRequest},
        repo::insert_person,
    },
    realtime::RealtimeState,
    repo_utilities::InsertRecordError,
    shared::{
        default_project_id,
        entities::{CircleId, CircleInvolvement, InvolvementStatus, Person, UserId},
        events::AppEvent,
    },
};

pub mod events;
mod invitatations_service;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(update_person))
        .routes(routes!(invite_person))
}

#[utoipa::path(put, path = "/{person_id}",
    request_body(content = Person, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = ()),
    ),
)]
pub async fn update_person(
    Path(person_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Json(input): Json<Person>,
) -> impl IntoResponse {
    println!("Updating person with ID {}: {:?}", person_id, input);

    if input.id != person_id {
        return (StatusCode::BAD_REQUEST, "Person ID mismatch").into_response();
    }

    match repo::update_person(input, default_project_id(), &pool).await {
        Ok(response) => {
            let event = AppEvent::PeopleEvent(PeopleEvent::PersonUpdated(response));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}

#[utoipa::path(post, path = "/invite",
    request_body(content = InvitePersonRequest, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = String),
    ),
)]
pub async fn invite_person(
    Extension(pool): Extension<SqlitePool>,
    // Extension(realtime_state): Extension<RealtimeState>,
    // auth_session: AuthSession,
    Json(input): Json<InvitePersonRequest>,
) -> impl IntoResponse {
    println!("Inviting person: {:?}", input);

    let result = invitatations_service::invite_person(&pool, &input, default_project_id()).await;

    match result {
        Ok(_) => (StatusCode::OK, Json(Vec::<AppEvent>::new())).into_response(),
        Err(InvitePersonError::ContextInvalid) => {
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
        }
        Err(InvitePersonError::InputInvalid) => {
            (StatusCode::BAD_REQUEST, "Invalid input").into_response()
        }
        Err(InvitePersonError::DatabaseError) => {
            (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response()
        }
    }
}
