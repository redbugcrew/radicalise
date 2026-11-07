use crate::{
    circles::repo::insert_circle,
    intervals::repo::{change_project_interval, insert_zeroth_interval},
    my_project::involvements_repo::insert_circle_involvement,
    people::repo::create_person,
    repo_utilities::InsertRecordError,
    shared::entities::{Circle, CircleInvolvement, InvolvementStatus, ParticipationIntention, Project, UserId},
};
use serde::Serialize;
use sqlx::{Executor, SqlitePool};
use utoipa::ToSchema;

#[derive(Serialize, ToSchema, Debug)]
pub enum CreateProjectError {
    SlugAlreadyTaken,
    RecordAlreadyExists,
    DatabaseError,
}

impl From<sqlx::Error> for CreateProjectError {
    fn from(_: sqlx::Error) -> Self {
        CreateProjectError::DatabaseError
    }
}

impl From<InsertRecordError> for CreateProjectError {
    fn from(e: InsertRecordError) -> Self {
        match e {
            InsertRecordError::RecordAlreadyExists => CreateProjectError::RecordAlreadyExists,
            _ => CreateProjectError::DatabaseError,
        }
    }
}

pub async fn create_project_and_dependent_records(
    project: Project,
    user_id: UserId,
    person_name: String,
    pool: &SqlitePool,
) -> Result<Project, CreateProjectError> {
    let mut transaction = pool.begin().await?;

    let project = create_project(project, &mut *transaction).await?;

    let circle = Circle::new(project.typed_id());
    let circle = insert_circle(&circle, project.typed_id(), &mut *transaction).await?;

    let person = create_person(project.typed_id(), user_id, person_name, &mut *transaction).await?;

    let today = chrono::Utc::now().date_naive();
    let interval = insert_zeroth_interval(today, project.typed_id(), &mut *transaction).await?;

    change_project_interval(project.typed_id(), interval.typed_number(), &mut *transaction).await?;

    let involvement = CircleInvolvement {
        person_id: person.id,
        circle_id: circle.id,
        status: InvolvementStatus::Active,
        participation_intention: Some(ParticipationIntention::OptIn),
        ..CircleInvolvement::new(interval.typed_number())
    };
    insert_circle_involvement(involvement.into(), &mut *transaction).await?;

    transaction.commit().await?;

    Ok(project)
}

pub async fn create_project<'e, 'c: 'e, E>(project: Project, pool: E) -> Result<Project, CreateProjectError>
where
    E: Executor<'c, Database = sqlx::Sqlite>,
{
    let result = sqlx::query!(
        "INSERT INTO projects (name, description, slug)
        VALUES (?, ?, ?)",
        project.name,
        project.description,
        project.slug
    )
    .execute(pool)
    .await
    .map_err(|e| {
        if let sqlx::Error::Database(db_err) = &e
            && db_err.message().contains("UNIQUE constraint failed: projects.slug")
        {
            return CreateProjectError::SlugAlreadyTaken;
        }
        CreateProjectError::DatabaseError
    })?;

    Ok(Project {
        id: result.last_insert_rowid(),
        ..project
    })
}
