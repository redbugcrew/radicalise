-- Add migration script here
DROP INDEX "collective_slug_unique";
ALTER TABLE projects ADD COLUMN slug_copy TEXT NOT NULL DEFAULT '';

UPDATE projects SET slug_copy = slug;

ALTER TABLE projects DROP COLUMN slug;
ALTER TABLE projects ADD COLUMN slug TEXT NOT NULL DEFAULT '';

UPDATE projects SET slug = slug_copy;
ALTER TABLE projects DROP COLUMN slug_copy;
CREATE UNIQUE INDEX "project_slug_unique" ON "projects" ("slug");