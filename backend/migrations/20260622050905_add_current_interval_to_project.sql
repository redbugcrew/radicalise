-- Add migration script here
ALTER TABLE projects ADD COLUMN current_interval_id INTEGER REFERENCES intervals(id);