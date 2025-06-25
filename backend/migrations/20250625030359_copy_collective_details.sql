-- Add migration script here
UPDATE collectives
SET name = (SELECT name FROM groups WHERE groups.id = collectives.group_id),
description = (SELECT description FROM groups WHERE groups.id = collectives.group_id);