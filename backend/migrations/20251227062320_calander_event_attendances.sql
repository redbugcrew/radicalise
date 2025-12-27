-- Add migration script here

CREATE TABLE calendar_event_attendances (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    calendar_event_id INTEGER NOT NULL,
    intention TEXT,
    PRIMARY KEY (id AUTOINCREMENT)
    CONSTRAINT fk_calendar_event FOREIGN KEY (calendar_event_id) REFERENCES calendar_events(id)
);

CREATE UNIQUE INDEX "calendar_event_attendances_unique" ON "calendar_event_attendances" (user_id, calendar_event_id);