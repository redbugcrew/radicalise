pub fn is_constraint_violation(error: &sqlx::Error) -> bool {
    if let sqlx::Error::Database(db_error) = error {
        return db_error.code() == Some(std::borrow::Cow::Borrowed("2067"));
    }
    return false;
}
