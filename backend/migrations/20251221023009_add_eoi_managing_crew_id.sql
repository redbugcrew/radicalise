-- Add migration script here
ALTER TABLE collectives
ADD COLUMN eoi_managing_crew_id INTEGER NULL REFERENCES crews(id);