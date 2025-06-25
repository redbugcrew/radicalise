CREATE TABLE IF NOT EXISTS "collective_involvements" (
	"id"	INTEGER NOT NULL,
	"person_id"	INTEGER NOT NULL,
	"collective_id"	INTEGER NOT NULL,
	"interval_id"	INTEGER NOT NULL,
	"status"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "collective_involvements_unique" UNIQUE("person_id","collective_id","interval_id"),
	CONSTRAINT "collective_involvements_collectives_FK" FOREIGN KEY("collective_id") REFERENCES "collectives"("id"),
	CONSTRAINT "collective_involvements_intervals_FK" FOREIGN KEY("interval_id") REFERENCES "intervals"("id"),
	CONSTRAINT "collective_involvements_people_FK" FOREIGN KEY("person_id") REFERENCES "people"("id")
);
CREATE TABLE IF NOT EXISTS "collectives" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL DEFAULT '',
	"description"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "crew_involvements" (
	"id"	INTEGER NOT NULL,
	"person_id"	INTEGER NOT NULL,
	"crew_id"	INTEGER NOT NULL,
	"interval_id"	INTEGER NOT NULL,
	"status"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "crew_involvements_unique" UNIQUE("person_id","crew_id","interval_id"),
	CONSTRAINT "crew_involvements_crew_FK" FOREIGN KEY("crew_id") REFERENCES "crews"("id"),
	CONSTRAINT "crew_involvements_intervals_FK" FOREIGN KEY("interval_id") REFERENCES "intervals"("id"),
	CONSTRAINT "crew_involvements_people_FK" FOREIGN KEY("person_id") REFERENCES "people"("id")
);
CREATE TABLE IF NOT EXISTS "crews" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL DEFAULT '',
	"description"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "intervals" (
	"id"	INTEGER NOT NULL,
	"start_date"	TEXT NOT NULL,
	"end_date"	TEXT NOT NULL,
	"collective_id"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "intervals_collectives_FK" FOREIGN KEY("collective_id") REFERENCES "collectives"("id")
);
CREATE TABLE IF NOT EXISTS "involvement_updates" (
	"id"	INTEGER NOT NULL,
	"involvement_id"	INTEGER NOT NULL,
	"occurred_at"	TEXT NOT NULL,
	"new_status"	TEXT NOT NULL,
	"context"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "involvement_updates_involvements_FK" FOREIGN KEY("involvement_id") REFERENCES "involvements"("id")
);
CREATE TABLE IF NOT EXISTS "people" (
	"id"	INTEGER NOT NULL,
	"formal_name"	TEXT,
	"email"	TEXT UNIQUE,
	"hashed_password"	TEXT,
	"password_reset_token"	TEXT,
	"password_reset_token_issued_at"	INTEGER,
	"display_name"	TEXT NOT NULL DEFAULT '',
	PRIMARY KEY("id" AUTOINCREMENT)
);