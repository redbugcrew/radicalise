-- Add migration script here
ALTER TABLE "groups" RENAME COLUMN "name" TO "name_nullable";
ALTER TABLE "groups" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
UPDATE "groups" SET "name" = "name_nullable";
ALTER TABLE "groups" DROP COLUMN "name_nullable";

ALTER TABLE "groups" ADD COLUMN "group_type" TEXT NOT NULL DEFAULT '';
UPDATE "groups" SET "group_type" = "type";
ALTER TABLE "groups" DROP COLUMN "type";