-- Add migration script here
ALTER TABLE people
ADD COLUMN about TEXT;

ALTER TABLE people
ADD COLUMN avatar_id INTEGER;

