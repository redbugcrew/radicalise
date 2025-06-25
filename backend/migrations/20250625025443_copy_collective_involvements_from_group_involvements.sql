-- Add migration script here
INSERT INTO collective_involvements (person_id, collective_id, interval_id, status)
SELECT person_id, collectives.id, interval_id, status
FROM group_involvements
LEFT JOIN groups ON group_involvements.group_id = groups.id
LEFT JOIN collectives ON groups.id = collectives.group_id
WHERE
  groups.id IS NOT NULL AND
  groups.group_type = 'collective';