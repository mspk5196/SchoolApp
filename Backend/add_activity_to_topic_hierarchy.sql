-- Add section_subject_activity_id to topic_hierarchy table
-- This will allow topic hierarchies to be activity-specific

ALTER TABLE topic_hierarchy 
ADD COLUMN section_subject_activity_id INT DEFAULT NULL;

-- Add foreign key constraint
ALTER TABLE topic_hierarchy 
ADD CONSTRAINT fk_topic_hierarchy_section_subject_activity 
FOREIGN KEY (section_subject_activity_id) REFERENCES section_subject_activities(id);

-- Create index for better performance
CREATE INDEX idx_topic_hierarchy_section_subject_activity ON topic_hierarchy(section_subject_activity_id);

-- Migration script to update existing records
-- This will link existing topic hierarchies to 'Academic' activity type for each section
UPDATE topic_hierarchy th
SET section_subject_activity_id = (
    SELECT ssa.id 
    FROM section_subject_activities ssa 
    JOIN activity_types at ON ssa.activity_type = at.id 
    WHERE ssa.subject_id = th.subject_id 
    AND at.activity_type = 'Academic'
    LIMIT 1
)
WHERE th.section_subject_activity_id IS NULL;

-- Add NOT NULL constraint after migration (optional)
-- ALTER TABLE topic_hierarchy MODIFY COLUMN section_subject_activity_id INT NOT NULL;
