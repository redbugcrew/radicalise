-- Add migration script here

CREATE TABLE circle_invitations (
    id INTEGER,
    circle_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    invitee_email VARCHAR(255) NOT NULL,
    message TEXT,
    invitation_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id AUTOINCREMENT),
    FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    CONSTRAINT "circle_invitations_unique" UNIQUE("circle_id","person_id")
);