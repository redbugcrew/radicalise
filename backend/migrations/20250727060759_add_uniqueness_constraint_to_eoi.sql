-- Add migration script here
CREATE UNIQUE INDEX "eoi_id_unique" ON expressions_of_interest (id, email);
