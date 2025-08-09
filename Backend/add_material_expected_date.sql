-- Add expected_date and has_assessment columns to topic_materials table
ALTER TABLE topic_materials 
ADD COLUMN expected_date DATE NULL COMMENT 'Expected completion date for materials with assessment',
ADD COLUMN has_assessment BOOLEAN DEFAULT FALSE COMMENT 'Whether this material requires assessment';

-- Create index for expected_date for efficient querying
CREATE INDEX idx_topic_materials_expected_date ON topic_materials(expected_date);
CREATE INDEX idx_topic_materials_has_assessment ON topic_materials(has_assessment);

-- Update existing assessment materials to have has_assessment = true
UPDATE topic_materials 
SET has_assessment = TRUE 
WHERE material_type = 'Assessment';

-- You may want to set expected dates for existing assessment materials as well
-- UPDATE topic_materials 
-- SET expected_date = DATE_ADD(created_at, INTERVAL 7 DAY) 
-- WHERE has_assessment = TRUE AND expected_date IS NULL;
