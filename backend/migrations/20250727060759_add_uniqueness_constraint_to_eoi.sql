-- Add migration script here
CREATE UNIQUE INDEX "eoi_id_unique" ON eoi (id, email);
