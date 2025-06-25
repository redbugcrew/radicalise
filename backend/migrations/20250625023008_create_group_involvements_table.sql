-- Add migration script here
CREATE TABLE group_involvements (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	person_id INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	interval_id INTEGER NOT NULL,
	status TEXT NOT NULL,
	CONSTRAINT group_involvements_groups_FK FOREIGN KEY (group_id) REFERENCES groups(id),
	CONSTRAINT group_involvements_people_FK FOREIGN KEY (person_id) REFERENCES people(id),
	CONSTRAINT group_involvements_intervals_FK FOREIGN KEY (interval_id) REFERENCES intervals(id)
  CONSTRAINT group_involvements_unique UNIQUE (person_id, group_id, interval_id)
);
