-- Add migration script here

CREATE TABLE peer_roles(
    id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    circle_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    distribution_type TEXT NOT NULL,
    constrained_by_id INTEGER,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (circle_id) REFERENCES circles(id),
    FOREIGN KEY (constrained_by_id) REFERENCES peer_roles(id),
    PRIMARY KEY (id AUTOINCREMENT)
);