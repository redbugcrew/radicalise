use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use resend_rs::Resend;
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    my_project::events::ProjectEvent,
    people::{
        events::PeopleEvent,
        invitatations_service::{InvitePersonError, InvitePersonRequest},
    },
    realtime::RealtimeState,
    shared::{
        default_project_id,
        entities::{Person, UserId},
        events::AppEvent,
    },
};

mod circle_invitations_repo;
mod emails;
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

#[derive(Serialize, ToSchema)]
struct InvitePersonResponse {
    events: Vec<AppEvent>,
    person: Person,
}

#[utoipa::path(post, path = "/invite",
    request_body(content = InvitePersonRequest, content_type = "application/json"),
    responses(
        (status = 200, body = InvitePersonResponse),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = String),
    ),
)]
pub async fn invite_person(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Extension(resend): Extension<Resend>,
    Json(input): Json<InvitePersonRequest>,
) -> impl IntoResponse {
    println!("Inviting person: {:?}", input);

    let current_user_id = match auth_session.user.clone() {
        Some(user) => UserId::new(user.id),
        None => return (StatusCode::UNAUTHORIZED, "Unauthorized").into_response(),
    };

    let result = invitatations_service::invite_person(
        &pool,
        &resend,
        &input,
        current_user_id,
        default_project_id(),
    )
    .await;

    let result = match result {
        Ok(result) => result,
        Err(InvitePersonError::ContextInvalid) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error").into_response();
        }
        Err(InvitePersonError::InputInvalid) => {
            return (StatusCode::BAD_REQUEST, "Invalid input").into_response();
        }
        Err(InvitePersonError::DatabaseError) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error").into_response();
        }
        Err(InvitePersonError::EmailError) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to send invitation email",
            )
                .into_response();
        }
    };

    let person_updated_event = PeopleEvent::PersonUpdated(result.person.clone());
    let involvement_updated_event =
        ProjectEvent::CircleInvolvementUpdated(result.circle_involvement.clone());
    let app_events = vec![
        AppEvent::PeopleEvent(person_updated_event),
        AppEvent::ProjectEvent(involvement_updated_event),
    ];
    let response = InvitePersonResponse {
        events: app_events.clone(),
        person: result.person,
    };
    realtime_state
        .broadcast_app_events(Some(auth_session), app_events.clone())
        .await;

    (StatusCode::OK, Json(response)).into_response()
}
