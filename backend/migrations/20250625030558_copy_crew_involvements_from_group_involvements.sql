-- Add migration script here
INSERT INTO crew_involvements (person_id, crew_id, interval_id, status)
SELECT person_id, crews.id, interval_id, status
FROM group_involvements
LEFT JOIN groups ON group_involvements.group_id = groups.id
LEFT JOIN crews ON groups.id = crews.group_id
WHERE
  groups.id IS NOT NULL AND
  groups.group_type = 'crew';