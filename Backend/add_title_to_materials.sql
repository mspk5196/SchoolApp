-- Add title column to materials table and modify structure to use section_subject_activities
-- instead of grade_id and subject_id

-- Add title column to materials table
ALTER TABLE materials 
ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER level;

-- Add section_subject_activity_id column to materials table
ALTER TABLE materials 
ADD COLUMN section_subject_activity_id INT DEFAULT NULL AFTER subject_id;

-- Add foreign key constraint for section_subject_activity_id
ALTER TABLE materials 
ADD CONSTRAINT fk_materials_section_subject_activity 
FOREIGN KEY (section_subject_activity_id) REFERENCES section_subject_activities(id) 
ON DELETE CASCADE;

-- Update existing materials to use section_subject_activity_id
-- Note: This assumes you have matching records in section_subject_activities
-- You may need to adjust this query based on your actual data
UPDATE materials m
SET section_subject_activity_id = (
    SELECT ssa.id 
    FROM section_subject_activities ssa 
    JOIN sections s ON ssa.section_id = s.id 
    WHERE s.grade_id = m.grade_id 
    AND ssa.subject_id = m.subject_id 
    LIMIT 1
)
WHERE m.section_subject_activity_id IS NULL;

-- After confirming the migration worked, you can optionally remove old columns:
-- ALTER TABLE materials DROP COLUMN grade_id;
-- ALTER TABLE materials DROP COLUMN subject_id;

-- Verify the updated structure
DESCRIBE materials;
