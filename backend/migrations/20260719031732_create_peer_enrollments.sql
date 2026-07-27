-- Add migration script here

CREATE TABLE peer_enrollments(
    id INTEGER NOT NULL,
    peer_role_id INTEGER NOT NULL,
    interval_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    peer_id INTEGER NOT NULL,
    FOREIGN KEY (peer_role_id) REFERENCES peer_roles(id),
    FOREIGN KEY (interval_id) REFERENCES intervals(id),
    FOREIGN KEY (person_id) REFERENCES people(id),
    FOREIGN KEY (peer_id) REFERENCES people(id),
    PRIMARY KEY (id AUTOINCREMENT)
);