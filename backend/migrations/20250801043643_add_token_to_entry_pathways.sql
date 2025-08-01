-- Add migration script here
ALTER TABLE entry_pathways
ADD COLUMN auth_token TEXT;