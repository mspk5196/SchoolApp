-- Database Migration Script for Enhanced Academic Schedule
-- This script aligns new features with your existing database structure

-- STEP 1: Check existing table structures
-- You already have these tables that we need to work with:
-- - period_activities (with daily_schedule_id, activity_name, etc.)
-- - academic_session_attendance
-- - student_assessments
-- - topic_materials
-- - students, mentors, subjects, etc.

-- STEP 2: Create compatibility views and functions

-- Create a mapping view to bridge period_activities with our new structure
CREATE OR REPLACE VIEW enhanced_period_activities_view AS
SELECT 
    pa.id,
    pa.daily_schedule_id as schedule_reference_id,
    ds.date as activity_date,
    CASE 
        WHEN pa.activity_type = 'Assessment' THEN 'Assessment'
        WHEN pa.activity_type = 'Academic_Material' THEN 'Academic'
        WHEN pa.activity_type = 'One_Member_Activity' THEN 'One_Member_Activity'
        WHEN pa.activity_type = 'Group_Activity' THEN 'Group_Activity'
        WHEN pa.activity_type = 'Practical' THEN 'Practical'
        WHEN pa.activity_type = 'Discussion' THEN 'Discussion'
        ELSE 'Academic'
    END as standardized_activity_type,
    pa.duration as duration_minutes,
    JSON_UNQUOTE(JSON_EXTRACT(pa.batch_ids, '$[0]')) as primary_batch_number,
    pa.assigned_mentor_id,
    pa.topic_id,
    pa.material_id,
    pa.is_assessment,
    CASE 
        WHEN pa.is_assessment = 1 THEN 'Assessment'
        ELSE NULL
    END as assessment_type,
    pa.assessment_weightage as total_marks,
    pa.start_time,
    pa.activity_instructions,
    pa.is_completed,
    pa.completion_notes,
    pa.created_at,
    ds.subject_id,
    ds.section_id,
    ds.grade_id,
    ds.venue_id
FROM period_activities pa
LEFT JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id;

-- STEP 3: Create enhanced assessment tracking
-- This table will complement your existing student_assessments table
CREATE TABLE IF NOT EXISTS period_assessment_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    assessment_date DATE NOT NULL,
    subject_id INT NOT NULL,
    topic_id INT,
    assessment_type ENUM('Quiz', 'Test', 'Assignment', 'Practical', 'Topic_Assessment', 'Level_Assessment') DEFAULT 'Quiz',
    total_marks INT DEFAULT 100,
    duration_minutes INT DEFAULT 30,
    batch_numbers JSON COMMENT 'Array of batch numbers participating',
    assigned_mentor_id INT,
    question_paper_uploaded BOOLEAN DEFAULT FALSE,
    question_paper_path VARCHAR(500),
    submission_deadline TIMESTAMP,
    grading_completed BOOLEAN DEFAULT FALSE,
    average_score DECIMAL(5,2),
    pass_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (topic_id) REFERENCES topic_hierarchy(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL,
    
    INDEX idx_assessment_date (assessment_date),
    INDEX idx_subject_topic (subject_id, topic_id),
    INDEX idx_mentor (assigned_mentor_id)
);

-- STEP 4: Create enhanced student performance tracking
-- This complements your existing academic_session_attendance
CREATE TABLE IF NOT EXISTS period_student_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    student_roll VARCHAR(45) NOT NULL,
    attendance_status ENUM('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Present',
    performance_level ENUM('Highly Attentive','Moderately Attentive','Not Attentive') DEFAULT 'Moderately Attentive',
    participation_score INT DEFAULT 0 COMMENT 'Score out of 10',
    activity_completion_percentage DECIMAL(5,2) DEFAULT 100.00,
    mentor_feedback TEXT,
    assessment_marks DECIMAL(5,2) NULL COMMENT 'If this is an assessment activity',
    assessment_status ENUM('Not_Applicable','Scheduled','Submitted','Graded') DEFAULT 'Not_Applicable',
    recorded_by_mentor_id INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (student_roll) REFERENCES students(roll) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_student_activity (period_activity_id, student_roll),
    INDEX idx_student_roll (student_roll),
    INDEX idx_activity (period_activity_id),
    INDEX idx_attendance_status (attendance_status),
    INDEX idx_performance (performance_level)
);

-- STEP 5: Create material assignment tracking
-- This works with your existing topic_materials
CREATE TABLE IF NOT EXISTS period_material_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    material_id INT NOT NULL,
    usage_sequence INT DEFAULT 1,
    estimated_duration INT DEFAULT 30 COMMENT 'Minutes',
    actual_duration INT COMMENT 'Actual time spent',
    completion_status ENUM('Not_Started','In_Progress','Completed','Skipped') DEFAULT 'Not_Started',
    student_feedback_avg DECIMAL(3,2) COMMENT 'Average student rating 1-5',
    mentor_notes TEXT,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES topic_materials(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_activity_material (period_activity_id, material_id),
    INDEX idx_activity (period_activity_id),
    INDEX idx_material (material_id)
);

-- STEP 6: Create batch management for activities
CREATE TABLE IF NOT EXISTS activity_batch_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    batch_number INT NOT NULL,
    max_students INT DEFAULT 30,
    assigned_students JSON COMMENT 'Array of student rolls',
    activity_status ENUM('Scheduled','In_Progress','Completed','Cancelled') DEFAULT 'Scheduled',
    start_time TIME,
    end_time TIME,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    mentor_assigned_id INT,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_assigned_id) REFERENCES mentors(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_activity_batch (period_activity_id, batch_number),
    INDEX idx_activity (period_activity_id),
    INDEX idx_batch (batch_number),
    INDEX idx_status (activity_status)
);

-- STEP 7: Create helper functions and procedures

DELIMITER $$

-- Function to get available batches for a student in a subject
CREATE FUNCTION GetStudentAvailableBatches(
    student_roll VARCHAR(45),
    subject_id INT,
    activity_date DATE
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'batch_number', smb.batch_id,
            'is_current', smb.is_current,
            'assigned_at', smb.assigned_at
        )
    ) INTO result
    FROM student_multi_subject_batches smb
    WHERE smb.student_roll = student_roll 
    AND smb.subject_id = subject_id
    AND smb.is_current = 1;
    
    RETURN COALESCE(result, JSON_ARRAY());
END$$

-- Procedure to create period activity with batch assignments
CREATE PROCEDURE CreatePeriodActivityWithBatches(
    IN p_daily_schedule_id INT,
    IN p_activity_name VARCHAR(255),
    IN p_activity_type VARCHAR(50),
    IN p_duration INT,
    IN p_start_time TIME,
    IN p_topic_id INT,
    IN p_material_id INT,
    IN p_is_assessment BOOLEAN,
    IN p_assigned_mentor_id INT,
    IN p_batch_numbers JSON,
    IN p_max_students_per_batch INT
)
BEGIN
    DECLARE activity_id INT;
    DECLARE batch_count INT;
    DECLARE i INT DEFAULT 0;
    DECLARE current_batch INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Create the period activity
    INSERT INTO period_activities (
        daily_schedule_id, activity_name, activity_type, duration,
        start_time, topic_id, material_id, is_assessment, assigned_mentor_id,
        batch_ids
    ) VALUES (
        p_daily_schedule_id, p_activity_name, p_activity_type, p_duration,
        p_start_time, p_topic_id, p_material_id, p_is_assessment, p_assigned_mentor_id,
        p_batch_numbers
    );
    
    SET activity_id = LAST_INSERT_ID();
    SET batch_count = JSON_LENGTH(p_batch_numbers);
    
    -- Create batch assignments
    WHILE i < batch_count DO
        SET current_batch = JSON_UNQUOTE(JSON_EXTRACT(p_batch_numbers, CONCAT('$[', i, ']')));
        
        INSERT INTO activity_batch_assignments (
            period_activity_id, batch_number, max_students, mentor_assigned_id
        ) VALUES (
            activity_id, current_batch, p_max_students_per_batch, p_assigned_mentor_id
        );
        
        SET i = i + 1;
    END WHILE;
    
    -- If material is assigned, create material usage record
    IF p_material_id IS NOT NULL THEN
        INSERT INTO period_material_usage (
            period_activity_id, material_id, usage_sequence
        ) VALUES (
            activity_id, p_material_id, 1
        );
    END IF;
    
    -- If it's an assessment, create assessment tracking record
    IF p_is_assessment = 1 THEN
        INSERT INTO period_assessment_tracking (
            period_activity_id, assessment_date, subject_id, topic_id,
            batch_numbers, assigned_mentor_id
        ) 
        SELECT 
            activity_id, ds.date, ds.subject_id, p_topic_id,
            p_batch_numbers, p_assigned_mentor_id
        FROM daily_schedule ds 
        WHERE ds.id = p_daily_schedule_id;
    END IF;
    
    COMMIT;
    
    SELECT activity_id as created_activity_id;
END$$

DELIMITER ;

-- STEP 8: Create useful views for the frontend

-- View for coordinator's daily schedule overview
CREATE OR REPLACE VIEW coordinator_daily_schedule_overview AS
SELECT 
    ds.date,
    ds.grade_id,
    g.grade_name,
    ds.section_id,
    sec.section_name,
    ds.period_number,
    ds.start_time,
    ds.end_time,
    ds.subject_id,
    s.subject_name,
    ds.venue_id,
    v.name as venue_name,
    COUNT(pa.id) as total_activities,
    COUNT(CASE WHEN pa.is_assessment = 1 THEN 1 END) as assessment_count,
    COUNT(CASE WHEN pa.is_completed = 1 THEN 1 END) as completed_activities,
    GROUP_CONCAT(DISTINCT pa.activity_type) as activity_types,
    MIN(pa.start_time) as first_activity_time,
    MAX(TIME_ADD(pa.start_time, INTERVAL pa.duration MINUTE)) as last_activity_time
FROM daily_schedule ds
LEFT JOIN period_activities pa ON ds.id = pa.daily_schedule_id
LEFT JOIN grades g ON ds.grade_id = g.id
LEFT JOIN sections sec ON ds.section_id = sec.id
LEFT JOIN subjects s ON ds.subject_id = s.id
LEFT JOIN venues v ON ds.venue_id = v.id
GROUP BY ds.id, ds.date, ds.grade_id, ds.section_id, ds.period_number, ds.start_time, ds.end_time, ds.subject_id, ds.venue_id
ORDER BY ds.date, ds.period_number;

-- View for mentor's activity assignments
CREATE OR REPLACE VIEW mentor_activity_assignments AS
SELECT 
    pa.id as activity_id,
    pa.activity_name,
    pa.activity_type,
    pa.start_time,
    pa.duration,
    pa.is_assessment,
    ds.date as activity_date,
    ds.subject_id,
    s.subject_name,
    ds.grade_id,
    g.grade_name,
    ds.section_id,
    sec.section_name,
    ds.venue_id,
    v.name as venue_name,
    pa.assigned_mentor_id,
    m.roll as mentor_roll,
    u.name as mentor_name,
    th.topic_name,
    tm.activity_name as material_title,
    pa.is_completed,
    aba.batch_number,
    aba.activity_status as batch_status
FROM period_activities pa
LEFT JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
LEFT JOIN subjects s ON ds.subject_id = s.id
LEFT JOIN grades g ON ds.grade_id = g.id
LEFT JOIN sections sec ON ds.section_id = sec.id
LEFT JOIN venues v ON ds.venue_id = v.id
LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
LEFT JOIN users u ON m.phone = u.phone
LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
LEFT JOIN topic_materials tm ON pa.material_id = tm.id
LEFT JOIN activity_batch_assignments aba ON pa.id = aba.period_activity_id
WHERE pa.assigned_mentor_id IS NOT NULL
ORDER BY ds.date, pa.start_time, aba.batch_number;

-- STEP 9: Sample data insertion (commented out)
/*
-- Example: Create a sample activity with batches
CALL CreatePeriodActivityWithBatches(
    1,                              -- daily_schedule_id
    'Mathematics Quiz - Algebra',   -- activity_name  
    'Assessment',                   -- activity_type
    30,                             -- duration
    '10:00:00',                     -- start_time
    5,                              -- topic_id
    NULL,                           -- material_id
    TRUE,                           -- is_assessment
    2,                              -- assigned_mentor_id
    '[1, 2]',                       -- batch_numbers
    15                              -- max_students_per_batch
);
*/

-- STEP 10: Migration completion message
SELECT 'Enhanced Academic Schedule migration completed successfully!' as message;
