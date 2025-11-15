-- Add migration script here

CREATE TABLE calendar_events (
    id INTEGER NOT NULL,
    event_template_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME,
    collective_id INTEGER NOT NULL,
    PRIMARY KEY (id AUTOINCREMENT),
    CONSTRAINT fk_collective FOREIGN KEY (collective_id) REFERENCES collectives(id)
    CONSTRAINT fk_event_template FOREIGN KEY (event_template_id) REFERENCES event_templates(id)
);