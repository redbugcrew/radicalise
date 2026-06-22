-- Add migration script here

CREATE TABLE peer_roles(
    id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    circle_id INTEGER NOT NULL,
    name TEXT,
    distribution_type TEXT,
    constrained BOOLEAN NOT NULL DEFAULT FALSE,
    constrained_by_id INTEGER,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (circle_id) REFERENCES circles(id),
    FOREIGN KEY (constrained_by_id) REFERENCES peer_roles(id)
    PRIMARY KEY (id AUTOINCREMENT)
);