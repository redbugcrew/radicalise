-- Add migration script here

ALTER TABLE circle_involvements ADD COLUMN capacity_planning_visibility_circle_id INTEGER REFERENCES circles(id) ON DELETE SET NULL;

UPDATE circle_involvements
SET capacity_planning_visibility_circle_id = 1
WHERE private_capacity_planning = FALSE;

ALTER TABLE circle_involvements DROP COLUMN private_capacity_planning;