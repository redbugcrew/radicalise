-- Add migration script here
ALTER TABLE collectives RENAME TO projects;

-- rename foreign keys in entry_pathways, calendar_events, event_templates, collective_involvements, people, intervals, crews
ALTER TABLE entry_pathways RENAME COLUMN collective_id TO project_id;
ALTER TABLE calendar_events RENAME COLUMN collective_id TO project_id;
ALTER TABLE event_templates RENAME COLUMN collective_id TO project_id;
ALTER TABLE collective_involvements RENAME COLUMN collective_id TO project_id;
ALTER TABLE people RENAME COLUMN collective_id TO project_id;
ALTER TABLE intervals RENAME COLUMN collective_id TO project_id;
ALTER TABLE crews RENAME COLUMN collective_id TO project_id;
