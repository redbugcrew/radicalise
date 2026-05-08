use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::{auth_backend::AuthSession, auth_repo::AuthRepo},
    people::events::PeopleEvent,
    realtime::RealtimeState,
    shared::{default_project_id, entities::Person, events::AppEvent},
};

pub mod events;
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

#[derive(Deserialize, ToSchema, Debug)]
pub struct InvitePersonRequest {
    name: String,
    email: String,
    circle_id: i64,
    message: Option<String>,
}

#[utoipa::path(post, path = "/invite",
    request_body(content = InvitePersonRequest, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = ()),
    ),
)]
pub async fn invite_person(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Json(input): Json<InvitePersonRequest>,
) -> impl IntoResponse {
    println!("Inviting person: {:?}", input);

    // Create user if they don't already exist
    let auth_repo = AuthRepo::new(&pool);
    let auth_user = match auth_repo.upsert_user(input.email.clone()).await {
        Ok(user) => user,
        Err(err) => {
            eprintln!("Error creating user: {}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    println!("Auth user: {:?}", auth_user);

    return (StatusCode::OK, Json(Vec::<AppEvent>::new())).into_response();
}
