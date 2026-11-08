-- Add migration script here

CREATE TABLE crew_states (
    id INTEGER NOT NULL,
    crew_id INT NOT NULL,
    state INT NOT NULL DEFAULT 1,
    interval_number INT NOT NULL,
    project_id INT NOT NULL,

    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY (crew_id) REFERENCES crews(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (interval_number, project_id) REFERENCES intervals(number, project_id),
    CONSTRAINT unique_crew_interval UNIQUE (crew_id, interval_number, project_id)
);