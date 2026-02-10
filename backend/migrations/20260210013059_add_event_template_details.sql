-- Add migration script here
ALTER TABLE event_templates ADD COLUMN summary TEXT NOT NULL DEFAULT '';
ALTER TABLE event_templates ADD COLUMN response_expectation TEXT NOT NULL DEFAULT 'Welcome';
