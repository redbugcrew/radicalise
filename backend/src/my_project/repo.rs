use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::{
    calendar_events::repo::list_calendar_events_with_attendances,
    circles::repo::{find_all_circles, find_all_circles_ids},
    crews::repo::{find_all_crews_with_links, find_crew_states_for_interval},
    event_templates::repo::find_all_event_templates,
    intervals::repo::{find_all_intervals, find_current_interval},
    my_project::involvements_repo::{find_all_circle_involvements, find_all_circle_involvements_for_person},
    peer_roles::{enrollments_repo::find_peer_enrollments_for_interval, peer_roles_repo::find_all_peer_roles},
    people::repo::find_all_people,
    shared::{
        entities::{
            CalendarEvent, Circle, CircleId, CircleInvolvement, CrewInvolvement, CrewState, CrewWithLinks, EventTemplate, Interval,
            IntervalNumber, PeerEnrollment, PeerRole, Person, PersonId, Project, ProjectId, UserId,
        },
        links_repo::{find_all_links_for_owner, update_links_for_owner},
    },
};

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct CircleInvolvementData {
    pub circle_id: i64,
    pub interval_number: i64,
    pub project_id: i64,
    pub circle_involvements: Vec<CircleInvolvement>,
}
#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct IntervalInvolvementData {
    pub interval_number: i64,
    pub project_id: i64,
    pub crew_involvements: Vec<CrewInvolvement>,
    pub involvements_for_circles: Vec<CircleInvolvementData>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct IntervalData {
    pub interval: Interval,
    pub crew_involvements: Vec<CrewInvolvement>,
    pub circle_involvements: Vec<CircleInvolvementData>,
    pub peer_enrollments: Vec<PeerEnrollment>,
    pub crew_states: Vec<CrewState>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct InitialData {
    pub project: Project,
    pub circles: Vec<Circle>,
    pub people: Vec<Person>,
    pub crews: Vec<CrewWithLinks>,
    pub intervals: Vec<Interval>,
    pub current_interval_data: Option<IntervalData>,
    pub event_templates: Vec<EventTemplate>,
    pub calendar_events: Vec<CalendarEvent>,
    pub peer_roles: Vec<PeerRole>,
}

pub async fn find_project(project_id: ProjectId, pool: &SqlitePool) -> Result<Project, sqlx::Error> {
    sqlx::query!(
        "SELECT id, name, description, slug, feature_events, feature_peer_roles
        FROM projects WHERE id = ?",
        project_id.id
    )
    .fetch_one(pool)
    .await
    .map(|row| Project {
        id: row.id,
        name: row.name,
        description: row.description,
        links: vec![], // Links are not fetched here, assuming they are handled elsewhere
        slug: row.slug,
        feature_events: row.feature_events,
        feature_peer_roles: row.feature_peer_roles,
    })
}

pub async fn find_project_by_slug(project_slug: String, pool: &SqlitePool) -> Result<Project, sqlx::Error> {
    sqlx::query!(
        "SELECT id, name, description, slug, feature_events, feature_peer_roles
        FROM projects WHERE slug = ?",
        project_slug
    )
    .fetch_one(pool)
    .await
    .map(|row| Project {
        id: row.id,
        name: row.name,
        description: row.description,
        links: vec![], // Links are not fetched here, assuming they are handled elsewhere
        slug: row.slug,
        feature_events: row.feature_events,
        feature_peer_roles: row.feature_peer_roles,
    })
}

pub async fn find_project_with_links(project_id: ProjectId, pool: &SqlitePool) -> Result<Project, sqlx::Error> {
    let project = find_project(project_id.clone(), pool).await?;
    let links = find_all_links_for_owner(project_id.id, "projects".to_string(), pool).await?;

    Ok(Project { links, ..project })
}

pub async fn find_projects_for_user(user_id: UserId, pool: &SqlitePool) -> Result<Vec<Project>, sqlx::Error> {
    sqlx::query!(
        "SELECT p.id as id, name, description, slug, feature_events, feature_peer_roles
        FROM projects p
        JOIN people pe ON pe.project_id = p.id
        WHERE pe.user_id = ?",
        user_id.id
    )
    .fetch_all(pool)
    .await
    .map(|rows| {
        rows.into_iter()
            .map(|row| Project {
                id: row.id,
                name: row.name,
                description: row.description,
                links: vec![], // Links are not fetched here, assuming they are handled elsewhere
                slug: row.slug,
                feature_events: row.feature_events,
                feature_peer_roles: row.feature_peer_roles,
            })
            .collect::<Vec<Project>>()
    })
}

pub async fn find_all_crew_involvements(interval_number: IntervalNumber, pool: &SqlitePool) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT crew_involvements.id, person_id, crew_id, interval_number, project_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE
          interval_number = ? AND project_id = ?",
        interval_number.number,
        interval_number.project_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_interval_involvement_data(
    interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<IntervalInvolvementData, sqlx::Error> {
    let circle_ids = find_all_circles_ids(interval_number.project_id.clone(), pool).await.map_err(|e| {
        tracing::info!("find_all_circles_ids: {:?}", e);
        e
    })?;

    let circle_involvements_result = find_interval_involvement_data_for_circles(circle_ids, interval_number.clone(), pool)
        .await
        .map_err(|e| {
            tracing::info!("find_interval_involvement_data_for_circles: {:?}", e);
            e
        })?;

    let result = IntervalInvolvementData {
        interval_number: interval_number.number,
        project_id: interval_number.project_id.id,
        involvements_for_circles: circle_involvements_result,
        crew_involvements: find_all_crew_involvements(interval_number, pool).await?,
    };

    Ok(result)
}

pub async fn find_initial_data_for_project(project: Project, pool: &SqlitePool) -> Result<InitialData, sqlx::Error> {
    let circles = find_all_circles(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("find_all_circles: {:?}", e);
        e
    })?;

    let people = find_all_people(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("find_all_people: {:?}", e);
        e
    })?;

    let crews = find_all_crews_with_links(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("find_all_crews_with_links: {:?}", e);
        e
    })?;

    let intervals = find_all_intervals(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("find_all_intervals: {:?}", e);
        e
    })?;

    let event_templates = find_all_event_templates(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("find_all_event_templates: {:?}", e);
        e
    })?;
    let calendar_events = list_calendar_events_with_attendances(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("list_calendar_events_with_attendances: {:?}", e);
        e
    })?;

    let current_interval = find_current_interval(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("find_current_interval: {:?}", e);
        e
    })?;

    let current_interval_data = if let Some(interval) = &current_interval {
        find_interval_data(interval, pool)
            .await
            .map_err(|e| {
                tracing::info!("find_interval_data: {:?}", e);
                e
            })?
            .into()
    } else {
        None
    };

    let peer_roles = find_all_peer_roles(project.typed_id(), pool).await.map_err(|e| {
        tracing::info!("find_all_peer_roles: {:?}", e);
        e
    })?;

    Ok(InitialData {
        project,
        circles,
        people,
        crews,
        event_templates,
        intervals,
        current_interval_data,
        calendar_events,
        peer_roles,
    })
}

pub async fn find_interval_data(interval: &Interval, pool: &SqlitePool) -> Result<IntervalData, sqlx::Error> {
    let involvements = find_interval_involvement_data(interval.typed_number(), pool).await.map_err(|e| {
        tracing::info!("find_interval_involvement_data: {:?}", e);
        e
    })?;

    let enrollments = find_peer_enrollments_for_interval(&interval.typed_number(), pool)
        .await
        .map_err(|e| {
            tracing::info!("find_peer_enrollments_for_interval: {:?}", e);
            e
        })?;

    let crew_states = find_crew_states_for_interval(interval.typed_number(), pool).await.map_err(|e| {
        tracing::info!("find_crew_states_for_interval: {:?}", e);
        e
    })?;

    Ok(IntervalData {
        interval: interval.clone(),
        crew_involvements: involvements.crew_involvements,
        circle_involvements: involvements.involvements_for_circles,
        peer_enrollments: enrollments,
        crew_states,
    })
}

pub async fn update_project(input: Project, project_id: ProjectId, pool: &SqlitePool) -> Result<Project, sqlx::Error> {
    sqlx::query!(
        "UPDATE projects
         SET
            name = ?, description = ?, slug = ?, feature_events = ?, feature_peer_roles = ?
         WHERE id = ?",
        input.name,
        input.description,
        input.slug,
        input.feature_events,
        input.feature_peer_roles,
        project_id.id,
    )
    .execute(pool)
    .await?;

    Ok(input)
}

pub async fn update_project_with_links(input: Project, project_id: ProjectId, pool: &SqlitePool) -> Result<Project, sqlx::Error> {
    let project = update_project(input, project_id, pool).await?;
    let links = update_links_for_owner(project.id, "projects".to_string(), Some(project.links), pool).await?;

    Ok(Project {
        links: links.unwrap_or_default(),
        ..project
    })
}

pub async fn find_interval_involvement_data_for_circle(
    circle_id: CircleId,
    interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<CircleInvolvementData, sqlx::Error> {
    let circle_involvements = find_all_circle_involvements(circle_id.clone(), interval_number.clone(), None, pool).await?;

    Ok(CircleInvolvementData {
        circle_id: circle_id.id,
        interval_number: interval_number.number,
        project_id: interval_number.project_id.id,
        circle_involvements,
    })
}

async fn find_interval_involvement_data_for_circle_and_person(
    person_id: PersonId,
    circle_id: CircleId,
    interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<CircleInvolvementData, sqlx::Error> {
    let circle_involvements =
        find_all_circle_involvements_for_person(person_id.clone(), circle_id.clone(), interval_number.clone(), pool).await?;

    Ok(CircleInvolvementData {
        circle_id: circle_id.id,
        interval_number: interval_number.number,
        project_id: interval_number.project_id.id,
        circle_involvements,
    })
}

pub async fn find_interval_involvement_data_for_circles(
    circle_ids: Vec<CircleId>,
    interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<Vec<CircleInvolvementData>, sqlx::Error> {
    let mut results = Vec::new();
    for circle_id in circle_ids {
        let data = find_interval_involvement_data_for_circle(circle_id.clone(), interval_number.clone(), pool).await?;
        results.push(data);
    }
    Ok(results)
}

pub async fn find_interval_involvement_data_for_circles_and_person(
    person_id: PersonId,
    circle_ids: Vec<CircleId>,
    interval_number: IntervalNumber,
    pool: &SqlitePool,
) -> Result<Vec<CircleInvolvementData>, sqlx::Error> {
    let mut results = Vec::new();
    for circle_id in circle_ids {
        let data =
            find_interval_involvement_data_for_circle_and_person(person_id.clone(), circle_id.clone(), interval_number.clone(), pool)
                .await?;
        results.push(data);
    }
    Ok(results)
}
