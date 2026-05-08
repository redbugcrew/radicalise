-- Add migration script here
CREATE UNIQUE INDEX "people_user_unique_per_project" ON people (project_id, user_id);
