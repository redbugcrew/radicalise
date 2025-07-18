

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

--- 
SELECT i.id as interval_id, people.display_name, g.group_type, g.name, i2.status, i2.start_interval_id, i2.end_interval_id, i2.id as involvement_id, i2.group_id FROM intervals i  
INNER JOIN people
INNER JOIN involvements i2 on people.id = i2.person_id
INNER JOIN groups g on g.id = i2.group_id
WHERE (i.id >= i2.start_interval_id AND (i.id <= i2.end_interval_id OR i2.end_interval_id IS NULL))
ORDER BY i.id, people.display_name, g.group_type, g.name, i2.start_interval_id

--- 
CREATE TABLE group_involvements (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	person_id INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	interval_id INTEGER NOT NULL,
	status TEXT NOT NULL,
	CONSTRAINT group_involvements_groups_FK FOREIGN KEY (group_id) REFERENCES groups(id),
	CONSTRAINT group_involvements_people_FK FOREIGN KEY (person_id) REFERENCES people(id),
	CONSTRAINT group_involvements_intervals_FK FOREIGN KEY (interval_id) REFERENCES intervals(id)
  CONSTRAINT group_involvements_unique UNIQUE (person_id, group_id, interval_id)
);

