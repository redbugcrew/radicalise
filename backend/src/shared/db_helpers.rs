pub fn is_constraint_violation(error: &sqlx::Error) -> bool {
    if let sqlx::Error::Database(db_error) = error {
        db_error.code() == Some(std::borrow::Cow::Borrowed("2067"))
    } else {
        false
    }
}
