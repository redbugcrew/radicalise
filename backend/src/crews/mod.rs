use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::Deserialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    crews::events::CrewsEvent,
    my_project::events::ProjectEvent,
    realtime::RealtimeState,
    shared::{
        entities::{CrewId, CrewStatus, CrewWithLinks, IntervalNumber, Link, ProjectId},
        events::AppEvent,
    },
};

pub mod events;
pub mod repo;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(create_crew))
        .routes(routes!(update_crew))
        .routes(routes!(update_crew_status))
}

#[derive(Deserialize, ToSchema, Clone, Debug)]
pub struct CreateCrewData {
    pub name: String,
    pub description: Option<String>,
    pub start_interval_number: i64,
    pub project_id: i64,
    pub links: Option<Vec<Link>>,
}

impl Into<CrewWithLinks> for CreateCrewData {
    fn into(self) -> CrewWithLinks {
        CrewWithLinks {
            id: -1, // dummy value
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
    let interval_number = IntervalNumber::new(input.start_interval_number, project_id.clone());

    println!("Create crew with project ID {}: {:?}", project_id.id, input);

    if input.project_id != project_id.id {
        return (StatusCode::BAD_REQUEST, "Project ID mismatch").into_response();
    }

    match repo::create_available_crew_with_links(interval_number, input.into(), &pool).await {
        Ok(response) => {
            let event = AppEvent::CrewsEvent(CrewsEvent::CrewUpdated(response));
            realtime_state.broadcast_app_event(Some(auth_session), event.clone()).await;
            (StatusCode::CREATED, Json(vec![event])).into_response()
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

#[derive(Deserialize, ToSchema, Clone, Debug)]
pub struct UpdateCrewStatusRequest {
    new_status: CrewStatus,
    interval_number: i64,
}

#[utoipa::path(
    put,
    path = "/{crew_id}/status",
    request_body(content = UpdateCrewStatusRequest, content_type = "application/json"),
    responses(
        (status = 200, body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
        (status = BAD_REQUEST,  body = ()),
    ),
    params(
        ("crew_id" = i64, Path, description = "Crew ID"),
        ("project_id" = i64, Path, description = "Project ID"),
    )
)]
pub async fn update_crew_status(
    Path((project_id, crew_id)): Path<(i64, i64)>,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    auth_session: AuthSession,
    Json(input): Json<UpdateCrewStatusRequest>,
) -> impl IntoResponse {
    let project_id = ProjectId::new(project_id);
    let crew_id = CrewId::new(crew_id);
    let interval_number = IntervalNumber::new(input.interval_number, project_id.clone());

    println!(
        "Updating crew status with ID {} for project {}: {:?}",
        crew_id.id, project_id.id, input
    );

    match repo::set_crew_status_from_interval(crew_id, interval_number, input.new_status, &pool).await {
        Ok(states) => {
            let events = states
                .iter()
                .map(|state| AppEvent::ProjectEvent(ProjectEvent::CrewStateUpdated(state.clone())))
                .collect::<Vec<_>>();

            realtime_state.broadcast_app_events(Some(auth_session), events.clone()).await;
            (StatusCode::OK, Json(events)).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
