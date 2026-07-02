-- Add migration script here
ALTER TABLE projects ADD COLUMN current_interval_id INTEGER REFERENCES intervals(id);
UPDATE projects SET current_interval_id = (SELECT id FROM intervals WHERE intervals.project_id = projects.id AND intervals.end_date >= CURRENT_DATE ORDER BY id ASC LIMIT 1);