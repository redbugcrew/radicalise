-- Add migration script here
CREATE UNIQUE INDEX "eoi_email_unique_per_collective" ON eoi (collective_id, email);
