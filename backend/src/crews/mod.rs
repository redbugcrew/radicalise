use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    crews::events::CrewsEvent,
    realtime::RealtimeState,
    shared::{
        entities::{CrewWithLinks, Link, ProjectId},
        events::AppEvent,
    },
};

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(create_crew)).routes(routes!(update_crew))
}

#[derive(Deserialize, ToSchema, Clone, Debug)]
pub struct CreateCrewData {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub project_id: i64,
    pub links: Option<Vec<Link>>,
}

impl Into<CrewWithLinks> for CreateCrewData {
    fn into(self) -> CrewWithLinks {
        CrewWithLinks {
            id: self.id,
            name: self.name,
            description: self.description,
            project_id: self.project_id,
            links: self.links,
        }
    }
}

#[utoipa::path(
    post,
    path = "/",
    request_body(content = CreateCrewData, content_type = "application/json"),
    responses(
        (status = 201, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = ()),
    ),
    params(
        ("project_id" = i64, Path, description = "Project ID")
    )
)]
pub async fn create_crew(
    Path(project_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Json(input): Json<CreateCrewData>,
) -> impl IntoResponse {
    let project_id = ProjectId::new(project_id);

    println!("Create crew with project ID {}: {:?}", project_id.id, input);

    if input.project_id != project_id.id {
        return (StatusCode::BAD_REQUEST, "Project ID mismatch").into_response();
    }

    match repo::create_crew_with_links(project_id, input.into(), &pool).await {
        Ok(response) => {
            let event = AppEvent::CrewsEvent(CrewsEvent::CrewUpdated(response));
            realtime_state.broadcast_app_event(Some(auth_session), event.clone()).await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}

#[utoipa::path(
    put,
    path = "/{crew_id}",
    request_body(content = CrewWithLinks, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = ()),
    ),
    params(
        ("crew_id" = i64, Path, description = "Crew ID"),
        ("project_id" = i64, Path, description = "Project ID"),
    )
)]
pub async fn update_crew(
    Path((crew_id, project_id)): Path<(i64, i64)>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Json(input): Json<CrewWithLinks>,
) -> impl IntoResponse {
    let project_id = ProjectId::new(project_id);

    println!("Updating crew with ID {}: {:?}", crew_id, input);

    if input.id != crew_id {
        return (StatusCode::BAD_REQUEST, "Crew ID mismatch").into_response();
    }

    match repo::update_crew_with_links(project_id, input, &pool).await {
        Ok(response) => {
            let event = AppEvent::CrewsEvent(CrewsEvent::CrewUpdated(response));
            realtime_state.broadcast_app_event(Some(auth_session), event.clone()).await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
