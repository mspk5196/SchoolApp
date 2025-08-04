-- Test script to manually add subjects to existing venue (ID: 30001)
-- Execute this AFTER fixing the venues table structure

-- First, let's see what subjects are available
SELECT id, subject_name FROM subjects LIMIT 10;

-- Let's assume you want to add subjects with IDs 1, 2, 3 to venue 30001
-- Replace these IDs with the actual subject IDs you want to associate
INSERT INTO venue_subjects (venue_id, subject_id) VALUES 
(30001, 1),
(30001, 2),
(30001, 3);

-- Verify the insertion worked
SELECT 
    v.id,
    v.name,
    v.block,
    v.floor,
    v.capacity,
    v.grade_id,
    v.venue_status,
    g.grade_name,
    GROUP_CONCAT(s.subject_name) as subjects
FROM venues v
LEFT JOIN grades g ON v.grade_id = g.id
LEFT JOIN venue_subjects vs ON v.id = vs.venue_id
LEFT JOIN subjects s ON vs.subject_id = s.id
WHERE v.id = 30001
GROUP BY v.id;

-- Check all venue-subject relationships
SELECT 
    vs.venue_id,
    v.name as venue_name,
    vs.subject_id,
    s.subject_name
FROM venue_subjects vs
JOIN venues v ON vs.venue_id = v.id
JOIN subjects s ON vs.subject_id = s.id
ORDER BY vs.venue_id, vs.subject_id;
