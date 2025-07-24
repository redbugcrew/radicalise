-- Add migration script here
-- remove the original TRANSACTION
COMMIT TRANSACTION;

-- tweak config
PRAGMA foreign_keys=OFF;

-- start your own TRANSACTION
BEGIN TRANSACTION;

CREATE TABLE new_crews (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  collective_id INTEGER NOT NULL,
  FOREIGN KEY (collective_id) REFERENCES collectives (id)
);

INSERT INTO new_crews (
  id, name, description, collective_id)
SELECT id, name, description, 1 as collective_id
FROM crews;

DROP TABLE crews;

ALTER TABLE new_crews RENAME TO crews;

-- check foreign key constraint still upholding.
PRAGMA foreign_key_check;

-- commit your own TRANSACTION
COMMIT TRANSACTION;

-- rollback all config you setup before.
PRAGMA foreign_keys=ON;

-- start a new TRANSACTION to let migrator commit it.
BEGIN TRANSACTION;