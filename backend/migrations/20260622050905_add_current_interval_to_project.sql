-- Add migration script here
ALTER TABLE projects ADD COLUMN current_interval_id INTEGER REFERENCES intervals(id);
UPDATE projects SET current_interval_id = (SELECT id FROM intervals WHERE intervals.project_id = projects.id ORDER BY id DESC LIMIT 1);