#[derive(Debug, thiserror::Error)]
pub enum InsertRecordError {
    #[error("Record already exists")]
    RecordAlreadyExists,
    #[error("Database error")]
    DatabaseError,
}

impl From<sqlx::Error> for InsertRecordError {
    fn from(sqlx_error: sqlx::Error) -> Self {
        eprintln!("Database error: {}", sqlx_error);

        if matches!(sqlx_error, sqlx::Error::Database(db_err) if db_err.message().contains("UNIQUE constraint failed"))
        {
            InsertRecordError::RecordAlreadyExists
        } else {
            InsertRecordError::DatabaseError
        }
    }
}
