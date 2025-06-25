-- Add migration script here
CREATE TABLE collective_involvements (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	person_id INTEGER NOT NULL,
	collective_id INTEGER NOT NULL,
	interval_id INTEGER NOT NULL,
	status TEXT NOT NULL,
	CONSTRAINT collective_involvements_collectives_FK FOREIGN KEY (collective_id) REFERENCES collectives(id),
	CONSTRAINT collective_involvements_people_FK FOREIGN KEY (person_id) REFERENCES people(id),
	CONSTRAINT collective_involvements_intervals_FK FOREIGN KEY (interval_id) REFERENCES intervals(id),
	CONSTRAINT collective_involvements_unique UNIQUE (person_id, collective_id, interval_id)
);

ALTER TABLE collectives
ADD name TEXT NOT NULL DEFAULT '';

ALTER TABLE collectives
ADD description TEXT;
