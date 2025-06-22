use argon2::{
    Argon2, PasswordHash,
    password_hash::{PasswordHasher, PasswordVerifier, SaltString},
};
use rand::rngs::OsRng;

pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);

    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| {
            eprintln!("Error while hashing password: {}", e);
            e
        })
        .map(|hash| hash.to_string())
}

pub fn verify_password(hashed: &str, password: &str) -> bool {
    let argon2 = Argon2::default();
    let password_bytes = password.as_bytes();
    let password_hash = PasswordHash::new(hashed).map_err(|e| {
        eprintln!("Error while parsing password hash: {}", e);
        e
    });

    match password_hash {
        Ok(parsed_hash) => argon2.verify_password(password_bytes, &parsed_hash).is_ok(),
        Err(_) => false,
    }
}
