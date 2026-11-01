use crate::shared::entities::Project;
use sqlx::SqlitePool;

#[derive(Debug)]
pub enum CreateProjectError {
    SlugAlreadyTaken,
    SqlxError(sqlx::Error),
}

pub async fn create_project(project: Project, pool: &SqlitePool) -> Result<Project, CreateProjectError> {
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
        if let sqlx::Error::Database(db_err) = &e {
            if db_err.message().contains("UNIQUE constraint failed: projects.slug") {
                return CreateProjectError::SlugAlreadyTaken;
            }
            CreateProjectError::SqlxError(e)
        } else {
            CreateProjectError::SqlxError(e)
        }
    })?;

    Ok(Project {
        id: result.last_insert_rowid(),
        ..project
    })
}
