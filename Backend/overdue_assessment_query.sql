-- Query to identify students who have overdue assessments
-- This can be used by a cron job to automatically move students to lower batches

-- Step 1: Find students with overdue assessment materials
WITH overdue_assessments AS (
    SELECT DISTINCT
        sba.student_roll,
        sba.batch_id,
        sb.section_id,
        sb.subject_id,
        tm.id as material_id,
        tm.activity_name,
        tm.expected_date,
        sb.batch_level,
        DATEDIFF(CURRENT_DATE, tm.expected_date) as days_overdue
    FROM topic_materials tm
    JOIN section_batches sb ON tm.topic_id IN (
        SELECT th.id 
        FROM topic_hierarchy th 
        WHERE th.subject_id = sb.subject_id
    )
    JOIN student_batch_assignments sba ON sb.id = sba.batch_id 
        AND sba.is_current = 1
    LEFT JOIN student_activity_participation sap ON sba.student_roll = sap.student_roll 
        AND sap.topic_material_id = tm.id
        AND sap.completion_status = 'completed'
    WHERE tm.has_assessment = TRUE 
        AND tm.expected_date < CURRENT_DATE
        AND sap.id IS NULL  -- Student hasn't completed the assessment
),

-- Step 2: Find available lower batch for each student
available_lower_batches AS (
    SELECT 
        oa.*,
        lower_batch.id as target_batch_id,
        lower_batch.batch_name as target_batch_name,
        lower_batch.batch_level as target_batch_level,
        COUNT(current_students.id) as current_students_in_target
    FROM overdue_assessments oa
    JOIN section_batches lower_batch ON oa.section_id = lower_batch.section_id 
        AND oa.subject_id = lower_batch.subject_id
        AND lower_batch.batch_level < oa.batch_level
        AND lower_batch.is_active = 1
    LEFT JOIN student_batch_assignments current_students ON lower_batch.id = current_students.batch_id 
        AND current_students.is_current = 1
    GROUP BY oa.student_roll, oa.batch_id, lower_batch.id
    HAVING current_students_in_target < lower_batch.max_students
    ORDER BY oa.student_roll, lower_batch.batch_level DESC
)

-- Step 3: Select the best target batch (highest level that's still lower than current)
SELECT DISTINCT
    student_roll,
    batch_id as current_batch_id,
    target_batch_id,
    target_batch_name,
    target_batch_level,
    days_overdue,
    GROUP_CONCAT(activity_name SEPARATOR ', ') as overdue_materials
FROM available_lower_batches alb
WHERE alb.target_batch_id = (
    SELECT target_batch_id 
    FROM available_lower_batches alb2 
    WHERE alb2.student_roll = alb.student_roll 
    ORDER BY alb2.target_batch_level DESC 
    LIMIT 1
)
GROUP BY student_roll, batch_id, target_batch_id, target_batch_name, target_batch_level, days_overdue;
