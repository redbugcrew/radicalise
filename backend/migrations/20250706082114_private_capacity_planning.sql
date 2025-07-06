-- Add migration script here
ALTER TABLE collective_involvements ADD COLUMN private_capacity_planning BOOLEAN NOT NULL DEFAULT FALSE;