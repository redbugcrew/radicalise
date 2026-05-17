-- Add migration script here
ALTER TABLE circles ADD COLUMN inside_circle_id INTEGER REFERENCES circles(id) ON DELETE SET NULL;