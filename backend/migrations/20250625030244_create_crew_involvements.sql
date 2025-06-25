-- Add migration script here
CREATE TABLE crew_involvements (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	person_id INTEGER NOT NULL,
	crew_id INTEGER NOT NULL,
	interval_id INTEGER NOT NULL,
	status TEXT NOT NULL,
	CONSTRAINT crew_involvements_crew_FK FOREIGN KEY (crew_id) REFERENCES groups(id),
	CONSTRAINT crew_involvements_people_FK FOREIGN KEY (person_id) REFERENCES people(id),
	CONSTRAINT crew_involvements_intervals_FK FOREIGN KEY (interval_id) REFERENCES intervals(id),
	CONSTRAINT crew_involvements_unique UNIQUE (person_id, crew_id, interval_id)
);

ALTER TABLE crews
ADD name TEXT NOT NULL DEFAULT '';

ALTER TABLE crews
ADD description TEXT;
