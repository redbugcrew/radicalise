use async_trait::async_trait;
use axum_login::{AuthUser, AuthnBackend, UserId};
use password_auth::verify_password;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};
use tokio::task;
use utoipa::ToSchema;

#[derive(Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i64,
    pub email: String,
    hashed_password: String,
}

// Here we've implemented `Debug` manually to avoid accidentally logging the
// password hash.
impl std::fmt::Debug for User {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("User")
            .field("id", &self.id)
            .field("email", &self.email)
            .field("hashed_password", &"[redacted]")
            .finish()
    }
}

impl AuthUser for User {
    type Id = i64;

    fn id(&self) -> Self::Id {
        self.id
    }

    fn session_auth_hash(&self) -> &[u8] {
        self.hashed_password.as_bytes() // We use the password hash as the auth
        // hash--what this means
        // is when the user changes their password the
        // auth session becomes invalid.
    }
}

// This allows us to extract the authentication fields from forms. We use this
// to authenticate requests with the backend.
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct Credentials {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone)]
pub struct AppAuthBackend {
    db: SqlitePool,
}

impl AppAuthBackend {
    pub fn new(db: SqlitePool) -> Self {
        Self { db }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),

    #[error(transparent)]
    TaskJoin(#[from] task::JoinError),
}

#[async_trait]
impl AuthnBackend for AppAuthBackend {
    type User = User;
    type Credentials = Credentials;
    type Error = Error;

    async fn authenticate(
        &self,
        creds: Self::Credentials,
    ) -> Result<Option<Self::User>, Self::Error> {
        println!("Authenticating user with email: {}", creds.email);

        let user: Option<Self::User> =
            sqlx::query_as("SELECT id, email, hashed_password FROM people WHERE email = ? ")
                .bind(creds.email.clone())
                .fetch_optional(&self.db)
                .await?;

        println!("Credentials provided: {:?}", creds.password.clone());

        // If no user was found, we return `None`.
        if user.is_none() {
            println!("No user found for email: {}", creds.email.clone());
            return Ok(None);
        }
        let user = user.unwrap();

        println!("User found: {:?}", user.email.clone());

        // Verifying the password is blocking and potentially slow, so we'll do so via
        // `spawn_blocking`.
        let hashed_password = user.hashed_password.clone();
        let password = creds.password.clone();

        let result: bool = task::spawn_blocking(move || {
            let verify_result = verify_password(password, &hashed_password);

            match verify_result {
                Ok(_) => {
                    println!("Password verification succeeded");
                    true
                }
                Err(e) => {
                    println!("Password verification failed: {}", e);
                    false
                }
            }
        })
        .await?;

        if result { Ok(Some(user)) } else { Ok(None) }
    }

    async fn get_user(&self, user_id: &UserId<Self>) -> Result<Option<Self::User>, Self::Error> {
        let user = sqlx::query_as(
            "SELECT id, email, hashed_password as password FROM people WHERE id = ?",
        )
        .bind(user_id)
        .fetch_optional(&self.db)
        .await?;

        Ok(user)
    }
}

// We use a type alias for convenience.
//
// Note that we've supplied our concrete backend here.
pub type AuthSession = axum_login::AuthSession<AppAuthBackend>;
