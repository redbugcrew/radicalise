CREATE TABLE involvement_updates (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	involvement_id INTEGER NOT NULL, occurred_at TEXT NOT NULL, new_status TEXT NOT NULL, context TEXT,
	CONSTRAINT involvement_updates_involvements_FK FOREIGN KEY (involvement_id) REFERENCES involvements(id)
);
CREATE TABLE IF NOT EXISTS "links" (
    "id" INTEGER NOT NULL,
    "link_type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "owner_id" INTEGER NOT NULL,
    "owner_type" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE users (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	email TEXT UNIQUE,
	hashed_password TEXT,
	password_reset_token TEXT,
	password_reset_token_issued_at INTEGER
, calendar_token TEXT NULL, is_admin BOOLEAN NOT NULL DEFAULT FALSE, can_create_projects BOOLEAN NOT NULL DEFAULT FALSE);
CREATE TABLE IF NOT EXISTS "people" (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"display_name" TEXT NOT NULL DEFAULT '',
  about TEXT,
  avatar_id INTEGER,
  user_id INTEGER,
  project_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (project_id) REFERENCES "projects" (id)
);
CREATE TABLE IF NOT EXISTS "crews" (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  project_id INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES "projects" (id)
);
CREATE TABLE event_templates (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    project_id INTEGER NOT NULL, summary TEXT NOT NULL DEFAULT '', response_expectation TEXT NOT NULL DEFAULT 'Welcome',
    PRIMARY KEY (id AUTOINCREMENT),
    CONSTRAINT fk_collective FOREIGN KEY (project_id) REFERENCES "projects"(id)
);
CREATE UNIQUE INDEX "event_template_name_unique" ON "event_templates" ("name", "project_id");
CREATE TABLE calendar_events (
    id INTEGER NOT NULL,
    event_template_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME,
    project_id INTEGER NOT NULL, location TEXT NOT NULL DEFAULT '', summary TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (id AUTOINCREMENT),
    CONSTRAINT fk_collective FOREIGN KEY (project_id) REFERENCES "projects"(id)
    CONSTRAINT fk_event_template FOREIGN KEY (event_template_id) REFERENCES event_templates(id)
);
CREATE TABLE calendar_event_attendances (
    id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    calendar_event_id INTEGER NOT NULL,
    intention TEXT, actual BOOLEAN,
    PRIMARY KEY (id AUTOINCREMENT)
    CONSTRAINT fk_calendar_event FOREIGN KEY (calendar_event_id) REFERENCES calendar_events(id)
    CONSTRAINT fk_person FOREIGN KEY (person_id) REFERENCES people(id)
);
CREATE UNIQUE INDEX "calendar_event_attendances_unique" ON "calendar_event_attendances" (person_id, calendar_event_id);
CREATE TABLE circles (
    id INTEGER NOT NULL,
    project_id NUMBER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL, inside_circle_id INTEGER REFERENCES circles(id) ON DELETE SET NULL,

    FOREIGN KEY (project_id) REFERENCES projects(id),
    UNIQUE (project_id, slug),
    PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE UNIQUE INDEX "people_user_unique_per_project" ON people (project_id, user_id);
CREATE TABLE circle_invitations (
    id INTEGER,
    circle_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    circle_involvement_id INTEGER,
    invitee_email VARCHAR(255) NOT NULL,
    message TEXT,
    invitation_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id AUTOINCREMENT),
    FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
    FOREIGN KEY (circle_involvement_id) REFERENCES circle_involvements(id) ON DELETE SET NULL,
    CONSTRAINT "circle_invitations_unique" UNIQUE("circle_id","person_id")
);
CREATE TABLE peer_roles(
    id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    circle_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    distribution_type TEXT NOT NULL,
    constrained_by_id INTEGER, summary TEXT, max_intervals INTEGER,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (circle_id) REFERENCES circles(id),
    FOREIGN KEY (constrained_by_id) REFERENCES peer_roles(id),
    PRIMARY KEY (id AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "projects" (
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
CREATE TABLE IF NOT EXISTS "crew_involvements" (
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
CREATE TABLE IF NOT EXISTS "circle_involvements" (
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
CREATE TABLE IF NOT EXISTS "peer_enrollments"(
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
CREATE TABLE IF NOT EXISTS "intervals" (
  number INTEGER NOT NULL,
	start_date TEXT NOT NULL,
	end_date TEXT,
	project_id INTEGER NOT NULL,
  processed_implicit_involvements BOOLEAN DEFAULT FALSE,
  processed_peer_roles BOOLEAN DEFAULT FALSE,

  PRIMARY KEY("number","project_id"),
  CONSTRAINT "invervals_number_unique" UNIQUE("number","project_id")
);
CREATE TABLE crew_states (
    id INTEGER NOT NULL,
    crew_id INT NOT NULL,
    state INT NOT NULL DEFAULT 1,
    interval_number INT NOT NULL,
    project_id INT NOT NULL,

    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY (crew_id) REFERENCES crews(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (interval_number, project_id) REFERENCES intervals(number, project_id),
    CONSTRAINT unique_crew_interval UNIQUE (crew_id, interval_number, project_id)
);
