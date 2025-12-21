-- Add migration script here
ALTER TABLE collective_involvements
ADD COLUMN implicit_counter INTEGER NOT NULL DEFAULT 0;