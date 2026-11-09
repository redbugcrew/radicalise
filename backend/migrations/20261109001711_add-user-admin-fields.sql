-- Add migration script here
ALTER TABLE users
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
  ADD COLUMN can_create_projects BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE people
  DROP COLUMN formal_name;