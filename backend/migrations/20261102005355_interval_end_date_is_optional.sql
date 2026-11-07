-- Add migration script here
ALTER TABLE intervals
  ADD COLUMN end_date_copy TEXT NULL;

UPDATE intervals
  SET end_date_copy = end_date;

ALTER TABLE intervals
  DROP COLUMN end_date;

ALTER TABLE intervals
  RENAME COLUMN end_date_copy TO end_date;