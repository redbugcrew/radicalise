-- Add migration script here
ALTER TABLE collective_involvements
ADD COLUMN intention_context TEXT;