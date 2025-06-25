-- Add migration script here
UPDATE crews
SET name = (SELECT name FROM groups WHERE groups.id = crews.group_id),
description = (SELECT description FROM groups WHERE groups.id = crews.group_id);