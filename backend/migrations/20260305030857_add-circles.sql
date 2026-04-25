-- Add migration script here
CREATE TABLE circles (
    id INTEGER NOT NULL,
    project_id NUMBER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,

    FOREIGN KEY (project_id) REFERENCES projects(id),
    UNIQUE (project_id, slug),
    PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO circles (id, project_id, name, slug) VALUES (1, 1, 'Participants', 'participants');

CREATE TABLE circle_involvements (
  "id" INTEGER NOT NULL,
	"person_id"	INTEGER NOT NULL,
  "circle_id" INTEGER NOT NULL,
	"interval_id"	INTEGER NOT NULL,
	"status"	TEXT NOT NULL,
  "wellbeing" TEXT,
  "focus" TEXT,
  "capacity" TEXT,
  "participation_intention" TEXT,
  "opt_out_type" TEXT,
  "opt_out_planned_return_date" TEXT,
  "capacity_score" INTEGER,
  "private_capacity_planning" BOOLEAN NOT NULL DEFAULT FALSE,
  "intention_context" TEXT,
  "implicit_counter" INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (circle_id) REFERENCES circles(id),
  FOREIGN KEY (interval_id) REFERENCES intervals(id),
  CONSTRAINT "circle_involvements_unique" UNIQUE("circle_id","person_id","interval_id"),
  PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO circle_involvements (id, person_id, circle_id, interval_id, status, wellbeing, focus, capacity, participation_intention, opt_out_type, opt_out_planned_return_date, capacity_score, private_capacity_planning, intention_context, implicit_counter)
SELECT *
FROM project_involvements
WHERE project_id = 1
;