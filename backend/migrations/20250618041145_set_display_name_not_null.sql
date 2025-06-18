-- Add migration script here
ALTER TABLE "people" RENAME COLUMN "display_name" TO "display_name_nullable";
ALTER TABLE "people" ADD COLUMN "display_name" TEXT NOT NULL DEFAULT '';
UPDATE "people" SET "display_name" = "display_name_nullable";
ALTER TABLE "people" DROP COLUMN "display_name_nullable";