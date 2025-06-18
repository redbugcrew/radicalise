-- Add migration script here
UPDATE involvements SET status = 'Participating' WHERE status = 'participating';
UPDATE involvements SET status = 'OnHiatus' WHERE status = 'on hiatus';