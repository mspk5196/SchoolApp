-- Add end_time column to period_activities table
ALTER TABLE period_activities 
ADD COLUMN end_time TIME AFTER start_time;

-- Update existing records to set end_time based on start_time + duration
UPDATE period_activities 
SET end_time = ADDTIME(start_time, SEC_TO_TIME(duration_minutes * 60))
WHERE end_time IS NULL AND start_time IS NOT NULL AND duration_minutes IS NOT NULL;
