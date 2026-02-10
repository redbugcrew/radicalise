-- Add migration script here
ALTER TABLE users ADD COLUMN calendar_token TEXT NULL;