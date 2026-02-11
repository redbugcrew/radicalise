-- Add migration script here
ALTER TABLE calendar_events ADD COLUMN location TEXT NOT NULL DEFAULT '';
ALTER TABLE calendar_events ADD COLUMN summary TEXT NOT NULL DEFAULT '';
ALTER TABLE calendar_events ADD COLUMN description TEXT NOT NULL DEFAULT '';