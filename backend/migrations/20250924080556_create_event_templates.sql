-- Add migration script here

CREATE TABLE event_templates (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    collective_id INTEGER NOT NULL,
    PRIMARY KEY (id AUTOINCREMENT),
    CONSTRAINT fk_collective FOREIGN KEY (collective_id) REFERENCES collectives(id)
);

CREATE UNIQUE INDEX "event_template_name_unique" ON "event_templates" ("name", "collective_id");