-- Add migration script here
ALTER TABLE projects
  ADD COLUMN feature_events BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE projects
  ADD COLUMN feature_peer_roles BOOLEAN NOT NULL DEFAULT FALSE;
