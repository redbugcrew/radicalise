-- Add migration script here
ALTER TABLE intervals
ADD COLUMN processed_peer_roles BOOLEAN DEFAULT FALSE;

UPDATE intervals SET processed_peer_roles = TRUE
WHERE intervals.end_date < CURRENT_TIMESTAMP;
