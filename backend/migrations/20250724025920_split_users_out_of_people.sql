-- Add migration script here
CREATE TABLE IF NOT EXISTS users (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	email TEXT UNIQUE,
	hashed_password TEXT,
	password_reset_token TEXT,
	password_reset_token_issued_at INTEGER
);

INSERT INTO users (
  id, email, hashed_password, password_reset_token, password_reset_token_issued_at)
SELECT id, email, hashed_password, password_reset_token, password_reset_token_issued_at
FROM people
WHERE email IS NOT NULL AND email != '';

ALTER TABLE people ADD COLUMN user_id INTEGER;

UPDATE people
SET user_id = (SELECT id FROM users WHERE users.email = people.email)
WHERE email IS NOT NULL AND email != '';

ALTER TABLE people DROP COLUMN hashed_password;
ALTER TABLE people DROP COLUMN password_reset_token;
ALTER TABLE people DROP COLUMN password_reset_token_issued_at;
