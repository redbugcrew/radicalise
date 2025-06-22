use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct AuthUser {
    pub id: i64,
    pub display_name: String,
    pub email: Option<String>,
}

pub enum AuthRepoError {
    UserNotFound,
    DatabaseError,
}

pub struct AuthRepo<'a> {
    pool: &'a sqlx::SqlitePool,
}

impl<'a> AuthRepo<'a> {
    pub fn new(pool: &'a sqlx::SqlitePool) -> Self {
        AuthRepo { pool }
    }

    pub async fn user_for_email(&self, email: String) -> Result<AuthUser, AuthRepoError> {
        sqlx::query_as!(
            AuthUser,
            "SELECT id, display_name, email FROM people WHERE email = ?",
            email
        )
        .fetch_one(self.pool)
        .await
        .map_err(|error| match error {
            sqlx::Error::RowNotFound => AuthRepoError::UserNotFound,
            _ => log_and_return_db_error(error),
        })
    }

    pub async fn set_password_reset_token(
        &self,
        user_id: &i64,
        token: String,
    ) -> Result<(), AuthRepoError> {
        sqlx::query!(
            "UPDATE people SET password_reset_token = ?, password_reset_token_issued_at = datetime('now') WHERE id = ?",
            token,
            user_id
        )
        .execute(self.pool)
        .await
        .map_err(log_and_return_db_error)?;

        Ok(())
    }
}

fn log_and_return_db_error(error: sqlx::Error) -> AuthRepoError {
    eprintln!("Database error: {}", error);
    AuthRepoError::DatabaseError
}
