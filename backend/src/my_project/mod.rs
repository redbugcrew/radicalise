use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{
    auth::auth_backend::AuthSession,
    my_project::{
        events::ProjectEvent,
        repo::{InitialData, IntervalInvolvementData, find_interval_involvement_data},
    },
    people::repo::find_person_by_user_id,
    realtime::RealtimeState,
    shared::{
        default_project_id,
        entities::{IntervalId, Project, UserId},
        events::AppEvent,
    },
};

pub mod events;
pub mod involvements_repo;
pub mod repo;
pub mod strip_data;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_project_state))
        .routes(routes!(get_involvements))
        .routes(routes!(update_project))
}

#[utoipa::path(get, path = "/state", responses(
        (status = 200, description = "Project found successfully", body = InitialData),
        (status = NOT_FOUND, description = "Project was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),)]
async fn get_project_state(
    auth_session: AuthSession,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let user_id = match auth_session.user {
        Some(user) => UserId::new(user.id),
        None => {
            eprintln!("Unauthorized access to get_project_state");
            return (StatusCode::UNAUTHORIZED, ()).into_response();
        }
    };

    let project = match repo::find_project_with_links(default_project_id(), &pool).await {
        Ok(project) => project,
        Err(e) => {
            eprintln!("Error fetching project: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    // Fetch the person for this user_id and project
    let person = match find_person_by_user_id(user_id.clone(), project.typed_id(), &pool).await {
        Ok(Some(person)) => person,
        Ok(None) => {
            eprintln!("Person not found for user_id {:?}", user_id);
            return (StatusCode::NOT_FOUND, ()).into_response();
        }
        Err(e) => {
            eprintln!("Error fetching person for user_id {:?}: {:?}", user_id, e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    let initial_data = match repo::find_initial_data_for_project(project, &pool).await {
        Ok(data) => data,
        Err(e) => {
            eprintln!("Error fetching initial data: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    // Fetch the circles for this person
    let current_interval_id = initial_data.current_interval.typed_id();

    let my_circles = match involvements_repo::find_circles_for_person_in_interval(
        person.typed_id(),
        current_interval_id,
        &pool,
    )
    .await
    {
        Ok(circles) => circles,
        Err(e) => {
            eprintln!("Error fetching circles: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    let initial_data = strip_data::strip_private_data_from_initial_data(
        &initial_data,
        &my_circles,
        &person.typed_id(),
    );

    (StatusCode::OK, Json(initial_data)).into_response()
}

#[utoipa::path(get, path = "/interval/{interval_id}/involvements", responses(
        (status = 200, description = "Fetched Involvements successfully", body = IntervalInvolvementData),
        (status = NOT_FOUND, description = "Not found", body = ())
    ), params(
            ("interval_id" = i64, Path, description = "Interval ID")
        ),)]
async fn get_involvements(
    Path(interval_id): Path<i64>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let interval_id = IntervalId::new(interval_id);

    let result = match find_interval_involvement_data(
        interval_id.clone(),
        default_project_id(),
        &pool,
    )
    .await
    {
        Ok(data) => data,
        Err(e) => {
            eprintln!("Error fetching involvement data: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    return (StatusCode::OK, Json(result)).into_response();
}

#[utoipa::path(put, path = "/",
    request_body(content = Project, content_type = "application/json"),
    responses(
        (status = 200, body = Vec<AppEvent>),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ),
)]
pub async fn update_project(
    auth_session: AuthSession,
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    Json(input): Json<Project>,
) -> impl IntoResponse {
    println!("Updating project: {:?}", input);

    match repo::update_project_with_links(input, default_project_id(), &pool).await {
        Ok(response) => {
            let event = AppEvent::ProjectEvent(ProjectEvent::ProjectUpdated(response));
            realtime_state
                .broadcast_app_event(Some(auth_session), event.clone())
                .await;
            (StatusCode::OK, Json(vec![event])).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response(),
    }
}
