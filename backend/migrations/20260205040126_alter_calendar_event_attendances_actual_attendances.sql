-- Add migration script here
ALTER TABLE calendar_event_attendances ADD COLUMN actual_attendances BOOLEAN;