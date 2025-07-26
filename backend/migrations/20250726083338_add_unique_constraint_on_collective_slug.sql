-- remove the original TRANSACTION
COMMIT TRANSACTION;

-- tweak config
PRAGMA foreign_keys=OFF;

-- start your own TRANSACTION
BEGIN TRANSACTION;

ALTER TABLE "collectives" RENAME TO "collectives_old";

CREATE TABLE "collectives" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL DEFAULT '',
	"description"	TEXT,
  "noun_name" TEXT,
  "slug" TEXT,
  "feature_eoi" BOOLEAN NOT NULL DEFAULT FALSE,
  "eoi_description" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
  CONSTRAINT "collectives_slug_unique" UNIQUE("slug")
);

INSERT INTO "collectives" ("id", "name", "description", "noun_name", "slug", "feature_eoi", "eoi_description")
SELECT "id", "name", "description", "nount_name", "slug", "feature_eoi", "eoi_description"
FROM "collectives_old";

DROP TABLE "collectives_old";

-- check foreign key constraint still upholding.
PRAGMA foreign_key_check;

-- commit your own TRANSACTION
COMMIT TRANSACTION;

-- rollback all config you setup before.
PRAGMA foreign_keys=ON;

-- start a new TRANSACTION to let migrator commit it.
BEGIN TRANSACTION;