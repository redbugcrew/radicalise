-- Add migration script here
CREATE TABLE IF NOT EXISTS "links" (
    "id" INTEGER NOT NULL,
    "link_type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "owner_type" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);