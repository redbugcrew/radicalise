

-- current participation query
SELECT people.display_name, groups."type", groups.name, involvements.status FROM people
LEFT JOIN involvements on involvements.person_id = people.id 
LEFT JOIN groups on groups.id = involvements.group_id
LEFT JOIN intervals on intervals.id = involvements.start_interval_id
LEFT JOIN crews on crews.group_id = involvements.group_id 
WHERE (involvements.end_interval_id IS NULL OR involvements.end_interval_id >= 10) 
GROUP BY groups.id, people.id
ORDER By groups.id, involvements.start_interval_id

-- current hiatus query
SELECT people.display_name, groups."type", groups.name, involvements.status, involvements.end_interval_id FROM people
LEFT JOIN involvements on involvements.person_id = people.id 
LEFT JOIN groups on groups.id = involvements.group_id
LEFT JOIN intervals on intervals.id = involvements.start_interval_id
LEFT JOIN crews on crews.group_id = involvements.group_id 
WHERE (involvements.status = "on hiatus") 
GROUP BY groups.id, people.id
ORDER By groups.id, involvements.start_interval_id