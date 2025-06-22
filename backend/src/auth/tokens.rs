use jsonwebtoken::{EncodingKey, Header, encode};
use serde::{Deserialize, Serialize};

// This is a temporary secret for demonstration purposes.
// In a real application, you should use a secure secret stored in your configuration.
const TEMP_SECRET: &str = "my_secret_key";

const KEY_DURATION: chrono::Duration = chrono::Duration::days(30);

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub iat: usize,
    pub exp: usize,
}

pub fn build_login_token(user_id: i64) -> Result<String, ()> {
    let encoding_key: EncodingKey = EncodingKey::from_secret(TEMP_SECRET.as_ref());

    let now = chrono::Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + KEY_DURATION).timestamp() as usize;

    let claims: TokenClaims = TokenClaims {
        sub: user_id.to_string(),
        exp,
        iat,
    };

    let result = encode(&Header::default(), &claims, &encoding_key);

    match result {
        Ok(token) => Ok(token),
        Err(e) => {
            eprintln!("Error creating token: {}", e);
            Err(())
        }
    }
}
