-- Add migration script here
ALTER TABLE crew_involvements DROP COLUMN status;
ALTER TABLE crew_involvements ADD COLUMN convenor BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE crew_involvements ADD COLUMN volunteered_convenor BOOLEAN NOT NULL DEFAULT FALSE;