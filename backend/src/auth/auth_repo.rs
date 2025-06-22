use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct AuthUser {
    pub id: i64,
    pub display_name: String,
    pub email: Option<String>,
    pub hashed_password: Option<String>,
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
            "SELECT id, display_name, email, hashed_password FROM people WHERE email = ?",
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
            "UPDATE people
            SET password_reset_token = ?, password_reset_token_issued_at = datetime('now')
            WHERE id = ?",
            token,
            user_id
        )
        .execute(self.pool)
        .await
        .map_err(log_and_return_db_error)?;

        Ok(())
    }

    pub async fn set_password_if_token_valid(
        &self,
        token: String,
        new_hashed_password: String,
        hours_token_valid: u32,
    ) -> Result<(), AuthRepoError> {
        if token.is_empty() {
            return Err(AuthRepoError::UserNotFound);
        }

        let interval = format!("+{} hours", hours_token_valid);

        let result = sqlx::query!(
            "UPDATE people
            SET hashed_password = ?, password_reset_token = NULL, password_reset_token_issued_at = NULL
            WHERE
              password_reset_token = ? AND datetime('now') < datetime(password_reset_token_issued_at, ?)",
            new_hashed_password,
            token,
            interval
        )
        .execute(self.pool)
        .await
        .map_err(log_and_return_db_error)?;

        if result.rows_affected() == 0 {
            Err(AuthRepoError::UserNotFound)
        } else {
            Ok(())
        }
    }
}

fn log_and_return_db_error(error: sqlx::Error) -> AuthRepoError {
    eprintln!("Database error: {}", error);
    AuthRepoError::DatabaseError
}
