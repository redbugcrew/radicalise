use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use resend_rs::Resend;
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    invitations::{
        circle_invitations_repo::find_circle_invitation_by_token,
        invitatations_service::{InvitePersonError, InvitePersonRequest},
    },
    my_project::events::ProjectEvent,
    people::events::PeopleEvent,
    realtime::RealtimeState,
    shared::{
        default_project_id,
        entities::{CircleInvitation, Person, UserId},
        events::AppEvent,
    },
};

mod circle_invitations_repo;
mod emails;
mod invitatations_service;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(invite_person))
}

#[derive(Serialize, ToSchema)]
struct InvitePersonResponse {
    events: Vec<AppEvent>,
    person: Person,
}

#[utoipa::path(post, path = "/invitation/new",
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

#[utoipa::path(get, path = "/invitation/{token}",
    responses(
        (status = 200, body = CircleInvitation),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = String),
    ),
    params(
        ("token" = String, Path, description = "Invitation token")
    )
)]
pub async fn get_invitation(
    Path(token): Path<String>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let invitation_result = find_circle_invitation_by_token(token, &pool).await;

    match invitation_result {
        Ok(invitation) => (StatusCode::OK, Json(invitation)).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}
