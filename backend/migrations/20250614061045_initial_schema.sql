-- groups definition

CREATE TABLE groups (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	name TEXT
, "type" TEXT, description TEXT);


-- collectives definition

CREATE TABLE collectives (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	group_id INTEGER NOT NULL,
	CONSTRAINT collectives_groups_FK FOREIGN KEY (group_id) REFERENCES groups(id)
);


-- crews definition

CREATE TABLE crews (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	group_id INTEGER,
	CONSTRAINT crews_groups_FK FOREIGN KEY (id) REFERENCES groups(id)
);


-- intervals definition

CREATE TABLE intervals (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	start_date TEXT NOT NULL,
	end_date TEXT NOT NULL,
	collective_id INTEGER NOT NULL,
	CONSTRAINT intervals_collectives_FK FOREIGN KEY (collective_id) REFERENCES collectives(id)
);


-- people definition

CREATE TABLE people (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	display_name TEXT,
	formal_name TEXT,
);


-- involvements definition

CREATE TABLE involvements (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	person_id INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	start_interval_id INTEGER NOT NULL,
	end_interval_id INTEGER, status TEXT NOT NULL,
	CONSTRAINT involvements_groups_FK FOREIGN KEY (group_id) REFERENCES groups(id),
	CONSTRAINT involvements_people_FK FOREIGN KEY (person_id) REFERENCES people(id),
	CONSTRAINT involvements_intervals_FK FOREIGN KEY (start_interval_id) REFERENCES intervals(id),
	CONSTRAINT involvements_intervals_FK_1 FOREIGN KEY (end_interval_id) REFERENCES intervals(id)
);


-- involvement_updates definition

CREATE TABLE involvement_updates (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	involvement_id INTEGER NOT NULL, occurred_at TEXT NOT NULL, new_status TEXT NOT NULL, context TEXT,
	CONSTRAINT involvement_updates_involvements_FK FOREIGN KEY (involvement_id) REFERENCES involvements(id)
);