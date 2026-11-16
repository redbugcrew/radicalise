-- Add migration script here
ALTER TABLE circles
  ADD COLUMN initial_involvement_status TEXT NOT NULL DEFAULT 'Active';
