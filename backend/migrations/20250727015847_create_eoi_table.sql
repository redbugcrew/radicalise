-- Add migration script here
CREATE TABLE IF NOT EXISTS "eoi" (
    "id" INTEGER NOT NULL,
    "collective_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interest" TEXT,
    "context" TEXT,
    "referral" TEXT,
    "conflict_experience" TEXT,
    "participant_connections" TEXT,
    "created_at" STRING DEFAULT CURRENT_TIMESTAMP,
    "updated_at" STRING DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("id" AUTOINCREMENT)
    CONSTRAINT "eoi_collectives_FK" FOREIGN KEY("collective_id") REFERENCES "collectives"("id")
);