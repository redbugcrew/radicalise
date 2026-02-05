-- Add migration script here
ALTER TABLE event_attendances ADD COLUMN attendence_actual BOOLEAN DEFAULT FALSE;