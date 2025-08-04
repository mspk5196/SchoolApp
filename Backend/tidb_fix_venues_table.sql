-- TiDB Cloud Script to Fix Venues Table Structure
-- Execute this in your TiDB Cloud console

-- Step 1: Check current table structure
DESCRIBE venues;

-- Step 2: Remove the foreign key constraint on subject_id
-- First, let's find the constraint name
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    TABLE_NAME = 'venues' 
    AND COLUMN_NAME = 'subject_id' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Step 3: Drop the foreign key constraint (replace 'venues_ibfk_2' with actual constraint name if different)
ALTER TABLE venues DROP FOREIGN KEY venues_ibfk_2;

-- Step 4: Drop the subject_id column since we're using venue_subjects junction table
ALTER TABLE venues DROP COLUMN subject_id;

-- Step 5: Verify the updated table structure
DESCRIBE venues;

-- Step 6: Check venue_subjects table structure
DESCRIBE venue_subjects;

-- Step 7: Test the relationship with a sample query
SELECT v.*, 
       g.grade_name,
       GROUP_CONCAT(s.subject_name) as subjects
FROM venues v
LEFT JOIN grades g ON v.grade_id = g.id
LEFT JOIN venue_subjects vs ON v.id = vs.venue_id
LEFT JOIN subjects s ON vs.subject_id = s.id
WHERE v.id = 30001
GROUP BY v.id;

-- Step 8: Check if there are any existing records in venue_subjects
SELECT COUNT(*) as total_venue_subjects FROM venue_subjects;
SELECT * FROM venue_subjects LIMIT 5;
