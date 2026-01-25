-- Add migration script here

CREATE TABLE calendar_event_attendances (
    id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    calendar_event_id INTEGER NOT NULL,
    intention TEXT,
    PRIMARY KEY (id AUTOINCREMENT)
    CONSTRAINT fk_calendar_event FOREIGN KEY (calendar_event_id) REFERENCES calendar_events(id)
    CONSTRAINT fk_person FOREIGN KEY (person_id) REFERENCES people(id)
);

CREATE UNIQUE INDEX "calendar_event_attendances_unique" ON "calendar_event_attendances" (person_id, calendar_event_id);