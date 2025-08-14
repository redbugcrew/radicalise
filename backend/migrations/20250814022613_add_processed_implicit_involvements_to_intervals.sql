-- Add migration script here
ALTER TABLE intervals
ADD COLUMN processed_implicit_involvements BOOLEAN DEFAULT FALSE;

UPDATE intervals SET processed_implicit_involvements = TRUE
WHERE intervals.start_date < CURRENT_TIMESTAMP;