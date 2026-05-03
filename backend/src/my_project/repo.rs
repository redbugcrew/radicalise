use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::{
    calendar_events::repo::list_calendar_events_with_attendances,
    circles::repo::{find_all_circles, find_all_circles_ids},
    crews::repo::find_all_crews_with_links,
    entry_pathways::repo::find_all_entry_pathways_for_project,
    event_templates::repo::find_all_event_templates,
    intervals::repo::{find_current_interval, find_next_interval},
    my_project::involvements_repo::find_all_circle_involvements,
    people::repo::find_all_people,
    shared::{
        default_circle_id,
        entities::{
            CalendarEvent, Circle, CircleId, CircleInvolvement, CrewInvolvement, CrewWithLinks,
            EntryPathway, EventTemplate, Interval, IntervalId, Person, Project, ProjectId,
        },
        links_repo::{find_all_links_for_owner, update_links_for_owner},
    },
};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct CircleInvolvementData {
    pub circle_id: i64,
    pub circle_involvements: Vec<CircleInvolvement>,
    pub crew_involvements: Vec<CrewInvolvement>,
}
#[derive(Serialize, Deserialize, ToSchema)]
pub struct IntervalInvolvementData {
    pub interval_id: i64,
    pub involvements_for_circles: Vec<CircleInvolvementData>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct InvolvementData {
    pub current_interval: Option<IntervalInvolvementData>,
    pub next_interval: Option<IntervalInvolvementData>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct InitialData {
    pub project: Project,
    pub circles: Vec<Circle>,
    pub people: Vec<Person>,
    pub crews: Vec<CrewWithLinks>,
    pub intervals: Vec<Interval>,
    pub current_interval: Interval,
    pub involvements: InvolvementData,
    pub entry_pathways: Vec<EntryPathway>,
    pub event_templates: Vec<EventTemplate>,
    pub calendar_events: Vec<CalendarEvent>,
}

pub async fn find_project(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Project, sqlx::Error> {
    sqlx::query!(
        "SELECT id, name, noun_name, description, slug, feature_eoi, eoi_description, eoi_managing_crew_id
        FROM projects WHERE id = ?",
        project_id.id
    )
    .fetch_one(pool)
    .await
    .map(|row| Project {
        id: row.id,
        name: Some(row.name),
        noun_name: row.noun_name,
        description: row.description,
        links: vec![], // Links are not fetched here, assuming they are handled elsewhere
        slug: row.slug,
        feature_eoi: row.feature_eoi,
        eoi_description: row.eoi_description,
        eoi_managing_crew_id: row.eoi_managing_crew_id,
    })
}

pub async fn find_project_by_slug(
    project_slug: String,
    pool: &SqlitePool,
) -> Result<Project, sqlx::Error> {
    sqlx::query!(
        "SELECT id, name, noun_name, description, slug, feature_eoi, eoi_description, eoi_managing_crew_id
        FROM projects WHERE slug = ?",
        project_slug
    )
    .fetch_one(pool)
    .await
    .map(|row| Project {
        id: row.id,
        name: Some(row.name),
        noun_name: row.noun_name,
        description: row.description,
        links: vec![], // Links are not fetched here, assuming they are handled elsewhere
        slug: row.slug,
        feature_eoi: row.feature_eoi,
        eoi_description: row.eoi_description,
        eoi_managing_crew_id: row.eoi_managing_crew_id,
    })
}

pub async fn find_project_with_links(
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Project, sqlx::Error> {
    let project = find_project(project_id.clone(), pool).await?;
    let links = find_all_links_for_owner(project_id.id, "projects".to_string(), pool).await?;

    Ok(Project { links, ..project })
}

pub async fn find_all_crew_involvements(
    interval_id: IntervalId,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT crew_involvements.id, person_id, crew_id, interval_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE
          interval_id = ?",
        interval_id.id
    )
    .fetch_all(pool)
    .await
}

pub async fn find_interval_involvement_data(
    interval_id: IntervalId,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<IntervalInvolvementData, sqlx::Error> {
    let circles_ids = find_all_circles_ids(project_id.clone(), &pool).await?;

    let circle_involvements_result = find_interval_involvement_data_for_circles(
        circles_ids,
        interval_id.clone(),
        project_id,
        &pool,
    )
    .await?;

    let result = IntervalInvolvementData {
        interval_id: interval_id.id,
        involvements_for_circles: circle_involvements_result,
    };

    Ok(result)
}

pub async fn find_initial_data_for_project(
    project: Project,
    pool: &SqlitePool,
) -> Result<InitialData, sqlx::Error> {
    let circles = find_all_circles(project.typed_id(), pool).await?;

    let people = find_all_people(project.typed_id(), pool).await?;

    let crews = find_all_crews_with_links(project.typed_id(), pool).await?;

    let intervals = sqlx::query_as!(
        Interval,
        "SELECT id, start_date, end_date FROM intervals WHERE project_id = ?",
        project.id
    )
    .fetch_all(pool)
    .await?;

    let current_interval = find_current_interval(project.typed_id(), pool).await?;
    let current_interval_id = current_interval.typed_id().clone();
    let next_interval =
        find_next_interval(project.typed_id(), current_interval_id.clone(), pool).await?;

    let current_interval_data =
        find_interval_involvement_data(current_interval_id.clone(), project.typed_id(), pool)
            .await?;
    let next_interval_data = if let Some(interval) = next_interval {
        Some(find_interval_involvement_data(interval.typed_id(), project.typed_id(), pool).await?)
    } else {
        None
    };

    let entry_pathways = find_all_entry_pathways_for_project(project.typed_id(), pool).await?;
    let event_templates = find_all_event_templates(project.typed_id(), pool).await?;
    let calendar_events = list_calendar_events_with_attendances(project.typed_id(), pool).await?;

    Ok(InitialData {
        project,
        circles,
        people,
        crews,
        event_templates,
        intervals,
        current_interval,
        involvements: InvolvementData {
            current_interval: Some(current_interval_data),
            next_interval: next_interval_data,
        },
        entry_pathways,
        calendar_events,
    })
}

pub async fn update_project(
    input: Project,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Project, sqlx::Error> {
    sqlx::query!(
        "UPDATE projects
         SET
            name = ?, noun_name = ?, description = ?, slug = ?,
            feature_eoi = ?, eoi_description = ?, eoi_managing_crew_id = ?
         WHERE id = ?",
        input.name,
        input.noun_name,
        input.description,
        input.slug,
        input.feature_eoi,
        input.eoi_description,
        input.eoi_managing_crew_id,
        project_id.id
    )
    .execute(pool)
    .await?;

    Ok(input)
}

pub async fn update_project_with_links(
    input: Project,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Project, sqlx::Error> {
    let project = update_project(input, project_id, pool).await?;
    let links = update_links_for_owner(
        project.id,
        "projects".to_string(),
        Some(project.links),
        pool,
    )
    .await?;

    Ok(Project {
        links: links.unwrap_or_default(),
        ..project
    })
}

pub async fn find_interval_involvement_data_for_circle(
    circle_id: CircleId,
    interval_id: IntervalId,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<CircleInvolvementData, sqlx::Error> {
    let circle_involvements = find_all_circle_involvements(
        project_id.clone(),
        circle_id.clone(),
        interval_id.clone(),
        pool,
    )
    .await?;

    // For new, crew involvements occur only on the default circle. If this circle id is not
    // the default circle, this will be empty
    let crew_involvements = if circle_id == default_circle_id() {
        find_all_crew_involvements(interval_id.clone(), pool).await?
    } else {
        Vec::new()
    };

    Ok(CircleInvolvementData {
        circle_id: circle_id.id,
        circle_involvements,
        crew_involvements,
    })
}

pub async fn find_interval_involvement_data_for_circles(
    circle_ids: Vec<CircleId>,
    interval_id: IntervalId,
    project_id: ProjectId,
    pool: &SqlitePool,
) -> Result<Vec<CircleInvolvementData>, sqlx::Error> {
    let mut results = Vec::new();
    for circle_id in circle_ids {
        let data = find_interval_involvement_data_for_circle(
            circle_id.clone(),
            interval_id.clone(),
            project_id.clone(),
            pool,
        )
        .await?;
        results.push(data);
    }
    Ok(results)
}
