-- Fix venues table structure by removing the old subject_id column
-- Since we're now using venue_subjects junction table for many-to-many relationship

-- First, remove the foreign key constraint
ALTER TABLE venues DROP FOREIGN KEY venues_ibfk_2;

-- Then remove the subject_id column
ALTER TABLE venues DROP COLUMN subject_id;

-- Verify the table structure
DESCRIBE venues;

-- Check if venue_subjects table exists and has correct structure
DESCRIBE venue_subjects;

-- Sample query to test the relationship
SELECT v.*, 
       g.grade_name,
       GROUP_CONCAT(s.subject_name) as subjects
FROM venues v
LEFT JOIN grades g ON v.grade_id = g.id
LEFT JOIN venue_subjects vs ON v.id = vs.venue_id
LEFT JOIN subjects s ON vs.subject_id = s.id
WHERE v.id = 30001
GROUP BY v.id;
