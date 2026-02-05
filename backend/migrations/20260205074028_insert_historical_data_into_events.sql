-- Add migration script here
INSERT INTO calendar_events
(id, event_template_id, name, start_at, end_at, collective_id)
VALUES(2, 1, 'Assembly 2', '2024-09-22 13:00:00', '2024-09-22 16:00:00', 1);