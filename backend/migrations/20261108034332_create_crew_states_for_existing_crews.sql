-- Add migration script here

-- For each project and interval number, create a crew state for existing crews

INSERT INTO crew_states (crew_id, state, interval_number, project_id)
SELECT c.id, 1, i.number, i.project_id
FROM crews c
JOIN intervals i ON i.project_id = c.project_id;