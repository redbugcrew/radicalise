-- Add migration script here

COMMIT TRANSACTION;

-- tweak config
PRAGMA foreign_keys=OFF;

-- start your own TRANSACTION
BEGIN TRANSACTION;

-- Change projects table to replace current_interval_id with current_interval_number

CREATE TABLE "projects_copy" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL DEFAULT '',
	"description"	TEXT,
  current_interval_number INTEGER,
  slug TEXT NOT NULL DEFAULT '',
  feature_events BOOLEAN NOT NULL DEFAULT FALSE,
  feature_peer_roles BOOLEAN NOT NULL DEFAULT FALSE,

  FOREIGN KEY (id, current_interval_number) REFERENCES intervals(project_id, number),
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO projects_copy (id, name, description, current_interval_number, slug, feature_events, feature_peer_roles)
SELECT p.id, p.name, p.description, i.number as current_interval_number, p.slug, p.feature_events, p.feature_peer_roles
FROM projects p
INNER JOIN intervals i ON p.current_interval_id = i.id;

DROP TABLE projects;
ALTER TABLE projects_copy RENAME TO projects;

-- Change crew_involvements table to replace interval_id with interval_number

CREATE TABLE "crew_involvements_copy" (
	"id"	INTEGER NOT NULL,
	"person_id"	INTEGER NOT NULL,
	"crew_id"	INTEGER NOT NULL,
	"interval_number"	INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id"),
  convenor BOOLEAN NOT NULL DEFAULT FALSE,
  volunteered_convenor BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "crew_involvements_unique" UNIQUE("person_id","crew_id","interval_number","project_id"),
	CONSTRAINT "crew_involvements_crew_fk" FOREIGN KEY("crew_id") REFERENCES "crews"("id"),
	CONSTRAINT "crew_involvements_intervals_FK" FOREIGN KEY("interval_number","project_id") REFERENCES "intervals"("number","project_id"),
	CONSTRAINT "crew_involvements_people_FK" FOREIGN KEY("person_id") REFERENCES "people"("id")
);

INSERT INTO crew_involvements_copy (id, person_id, crew_id, interval_number, project_id, convenor, volunteered_convenor)
SELECT i.id, i.person_id, i.crew_id, intervals.number as interval_number, intervals.project_id, i.convenor, i.volunteered_convenor
FROM crew_involvements AS i
INNER JOIN intervals ON i.interval_id = intervals.id;

DROP TABLE crew_involvements;
ALTER TABLE crew_involvements_copy RENAME TO crew_involvements;

-- Change circle_involvements table to replace interval_id with interval_number

CREATE TABLE "circle_involvements_copy" (
  "id" INTEGER NOT NULL,
	"person_id"	INTEGER NOT NULL,
  "circle_id" INTEGER NOT NULL,
	"interval_number"	INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id"),
	"status"	TEXT NOT NULL,
  "wellbeing" TEXT,
  "focus" TEXT,
  "capacity" TEXT,
  "participation_intention" TEXT,
  "opt_out_type" TEXT,
  "opt_out_planned_return_date" TEXT,
  "capacity_score" INTEGER,
  "intention_context" TEXT,
  "implicit_counter" INTEGER NOT NULL DEFAULT 0, capacity_planning_visibility_circle_id INTEGER REFERENCES circles(id) ON DELETE SET NULL,

  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
  FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE CASCADE,
  FOREIGN KEY ( interval_number, project_id) REFERENCES intervals(number, project_id) ON DELETE CASCADE,
  CONSTRAINT "circle_involvements_unique" UNIQUE("circle_id","person_id","interval_number","project_id"),
  PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO circle_involvements_copy (id, person_id, circle_id, interval_number, project_id, status, wellbeing, focus, capacity, participation_intention, opt_out_type, opt_out_planned_return_date, capacity_score, intention_context, implicit_counter, capacity_planning_visibility_circle_id)
SELECT c.id, c.person_id, c.circle_id, i.number as interval_number, i.project_id, c.status, c.wellbeing, c.focus, c.capacity, c.participation_intention, c.opt_out_type, c.opt_out_planned_return_date, c.capacity_score, c.intention_context, c.implicit_counter, c.capacity_planning_visibility_circle_id
FROM circle_involvements AS c
INNER JOIN intervals AS i ON c.interval_id = i.id;

DROP TABLE circle_involvements;
ALTER TABLE circle_involvements_copy RENAME TO circle_involvements;

-- Change peer_enrollments table to replace interval_id with interval_number and project_id

CREATE TABLE peer_enrollments_copy(
    id INTEGER NOT NULL,
    peer_role_id INTEGER NOT NULL,
    interval_number INTEGER NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    person_id INTEGER NOT NULL,
    peer_id INTEGER NOT NULL,
    FOREIGN KEY (peer_role_id) REFERENCES peer_roles(id),
    FOREIGN KEY (interval_number, project_id) REFERENCES intervals(number, project_id),
    FOREIGN KEY (person_id) REFERENCES people(id),
    FOREIGN KEY (peer_id) REFERENCES people(id),
    PRIMARY KEY (id AUTOINCREMENT)
);

INSERT INTO peer_enrollments_copy (id, peer_role_id, interval_number, project_id, person_id, peer_id)
SELECT e.id, e.peer_role_id, i.number as interval_number, i.project_id, e.person_id, e.peer_id
FROM peer_enrollments AS e
INNER JOIN intervals AS i ON e.interval_id = i.id;

DROP TABLE peer_enrollments;
ALTER TABLE peer_enrollments_copy RENAME TO peer_enrollments;

-- Change peer_enrollments table to remove id

CREATE TABLE intervals_copy (
  number INTEGER NOT NULL,
	start_date TEXT NOT NULL,
	end_date TEXT,
	project_id INTEGER NOT NULL,
  processed_implicit_involvements BOOLEAN DEFAULT FALSE,
  processed_peer_roles BOOLEAN DEFAULT FALSE,

  PRIMARY KEY("number","project_id"),
  CONSTRAINT "invervals_number_unique" UNIQUE("number","project_id")
);

INSERT INTO intervals_copy (number, start_date, end_date, project_id, processed_implicit_involvements, processed_peer_roles)
SELECT number, start_date, end_date, project_id, processed_implicit_involvements, processed_peer_roles
FROM intervals;

DROP TABLE intervals;

ALTER TABLE intervals_copy RENAME TO intervals;


-- check foreign key constraint still upholding.
PRAGMA foreign_key_check;

-- commit your own TRANSACTION
COMMIT TRANSACTION;

-- rollback all config you setup before.
PRAGMA foreign_keys=ON;

-- start a new TRANSACTION to let migrator commit it.
BEGIN TRANSACTION;