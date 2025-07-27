-- Add migration script here
ALTER TABLE collectives ADD COLUMN slug TEXT;
ALTER TABLE collectives ADD COLUMN feature_eoi BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE collectives ADD COLUMN eoi_description TEXT;