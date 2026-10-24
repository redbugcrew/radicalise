-- Add migration script here
ALTER TABLE projects
    DROP COLUMN feature_eoi;

ALTER TABLE projects
    DROP COLUMN eoi_description;

ALTER TABLE projects
    DROP COLUMN eoi_managing_crew_id;

DROP TABLE entry_pathways;