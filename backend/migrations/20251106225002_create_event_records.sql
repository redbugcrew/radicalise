-- Add migration script here

CREATE TABLE event_records (
    id INTEGER NOT NULL,
    event_record_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME,
    location TEXT,
    description TEXT,
    link_type TEXT,
    collective_id INTEGER NOT NULL,
    PRIMARY KEY (id AUTOINCREMENT),
    CONSTRAINT fk_collective FOREIGN KEY (collective_id) REFERENCES collectives(id)
);

CREATE UNIQUE INDEX "event_record_name_unique" ON "event_records" ("name", "collective_id");