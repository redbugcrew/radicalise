-- Add migration script here
COMMIT TRANSACTION;

-- tweak config
PRAGMA foreign_keys=OFF;

-- start your own TRANSACTION
BEGIN TRANSACTION;


CREATE TABLE intervals_copy (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  number INTEGER NOT NULL,
	start_date TEXT NOT NULL,
	end_date TEXT NOT NULL,
	project_id INTEGER NOT NULL,
  processed_implicit_involvements BOOLEAN DEFAULT FALSE,
  processed_peer_roles BOOLEAN DEFAULT FALSE,

  CONSTRAINT "invervals_number_unique" UNIQUE("number","project_id")
);

INSERT INTO intervals_copy (id, number, start_date, end_date, project_id, processed_implicit_involvements, processed_peer_roles)
SELECT id, id, start_date, end_date, project_id, processed_implicit_involvements, processed_peer_roles
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