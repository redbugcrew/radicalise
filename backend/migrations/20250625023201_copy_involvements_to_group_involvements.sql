-- Add migration script here
INSERT INTO group_involvements (person_id, group_id, interval_id, status)
SELECT people.id AS person_id,
        g.id AS group_id,
        i.id AS interval_id,
        i2.status
FROM intervals i
INNER JOIN people
INNER JOIN involvements i2 on people.id = i2.person_id
INNER JOIN groups g on g.id = i2.group_id
WHERE (i.id >= i2.start_interval_id AND (i.id <= i2.end_interval_id OR i2.end_interval_id IS NULL))
ORDER BY i.id, people.display_name, g.group_type, g.name, i2.start_interval_id
;
