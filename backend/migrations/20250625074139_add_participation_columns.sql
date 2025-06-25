-- Add migration script here
ALTER TABLE collective_involvements ADD COLUMN wellbeing TEXT;
ALTER TABLE collective_involvements ADD COLUMN focus TEXT;
ALTER TABLE collective_involvements ADD COLUMN capacity TEXT;
ALTER TABLE collective_involvements ADD COLUMN participation_intention TEXT;
ALTER TABLE collective_involvements ADD COLUMN opt_out_type TEXT;
ALTER TABLE collective_involvements ADD COLUMN opt_out_planned_return_date TEXT;