-- remove the original TRANSACTION
COMMIT TRANSACTION;

-- tweak config
PRAGMA foreign_keys=OFF;

-- start your own TRANSACTION
BEGIN TRANSACTION;

CREATE TABLE new_people (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	formal_name TEXT,
  email TEXT UNIQUE,
  "display_name" TEXT NOT NULL DEFAULT '',
  about TEXT,
  avatar_id INTEGER,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

INSERT INTO new_people (
  id, formal_name, email, display_name, about, avatar_id, user_id)
SELECT id, formal_name, email, display_name, about, avatar_id, user_id
FROM people;

DROP TABLE people;

ALTER TABLE new_people RENAME TO people;

-- check foreign key constraint still upholding.
PRAGMA foreign_key_check;

-- commit your own TRANSACTION
COMMIT TRANSACTION;

-- rollback all config you setup before.
PRAGMA foreign_keys=ON;

-- start a new TRANSACTION to let migrator commit it.
BEGIN TRANSACTION;