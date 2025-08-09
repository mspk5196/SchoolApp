-- IMPORTANT: Check if period_activities table exists and has different structure
-- If it exists, you may need to ALTER TABLE instead of CREATE TABLE

-- First, let's check existing period_activities structure
-- Your database already has a period_activities table with this structure:
-- id, daily_schedule_id, activity_name, activity_type, batch_ids (json), topic_id, material_id, 
-- start_time, duration, max_participants, assigned_mentor_id, activity_instructions, 
-- is_assessment, assessment_weightage, is_completed, completion_notes, created_at

-- Option 1: Rename existing table and create new one
-- RENAME TABLE period_activities TO period_activities_old;

-- Option 2: Alter existing table (recommended)
-- Add new columns to existing period_activities table
ALTER TABLE period_activities 
ADD COLUMN IF NOT EXISTS activity_date DATE AFTER daily_schedule_id,
ADD COLUMN IF NOT EXISTS batch_number INT DEFAULT 1 AFTER activity_type,
ADD COLUMN IF NOT EXISTS assessment_type ENUM('Quiz', 'Test', 'Assignment', 'Practical') DEFAULT 'Quiz' AFTER is_assessment,
ADD COLUMN IF NOT EXISTS total_marks INT DEFAULT 100 AFTER assessment_type,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update activity_type enum to match new values
ALTER TABLE period_activities 
MODIFY COLUMN activity_type ENUM('Assessment','Academic_Material','One_Member_Activity','Group_Activity','Practical','Discussion','Academic','ECA') NOT NULL;

-- Add indexes for better performance
ALTER TABLE period_activities 
ADD INDEX idx_activity_date (activity_date),
ADD INDEX idx_batch_number (batch_number),
ADD INDEX idx_activity_type_new (activity_type);

-- Option 3: Create new enhanced_period_activities table (if you want to keep both)
CREATE TABLE IF NOT EXISTS enhanced_period_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    daily_schedule_id INT NOT NULL COMMENT 'Reference to existing daily_schedule table',
    activity_date DATE NOT NULL,
    activity_type ENUM('Academic', 'Assessment', 'ECA', 'One_Member_Activity', 'Group_Activity', 'Practical', 'Discussion') NOT NULL DEFAULT 'Academic',
    duration_minutes INT NOT NULL DEFAULT 30 COMMENT 'Duration in minutes',
    batch_number INT NOT NULL DEFAULT 1,
    assigned_mentor_id INT,
    topic_id INT,
    material_id INT,
    is_assessment BOOLEAN DEFAULT FALSE,
    assessment_type ENUM('Quiz', 'Test', 'Assignment', 'Practical') DEFAULT 'Quiz',
    total_marks INT DEFAULT 100,
    start_time TIME NOT NULL,
    activity_instructions TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Fixed foreign key references based on your actual database structure
    FOREIGN KEY (daily_schedule_id) REFERENCES daily_schedule(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_mentor_id) REFERENCES mentors(id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES topic_hierarchy(id) ON DELETE SET NULL,
    FOREIGN KEY (material_id) REFERENCES topic_materials(id) ON DELETE SET NULL,
    
    INDEX idx_daily_schedule_date (daily_schedule_id, activity_date),
    INDEX idx_mentor_date (assigned_mentor_id, activity_date),
    INDEX idx_batch_date (batch_number, activity_date),
    INDEX idx_topic (topic_id),
    INDEX idx_activity_type (activity_type)
);

-- Enhanced assessment_submissions table 
-- This integrates with your existing student_assessments structure
CREATE TABLE IF NOT EXISTS enhanced_assessment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    student_roll VARCHAR(45) NOT NULL,
    batch_number INT NOT NULL,
    marks_obtained DECIMAL(5,2),
    total_marks DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2),
    submission_time TIMESTAMP,
    question_paper_path VARCHAR(500),
    answer_sheet_path VARCHAR(500),
    mentor_feedback TEXT,
    is_submitted BOOLEAN DEFAULT FALSE,
    is_graded BOOLEAN DEFAULT FALSE,
    assessment_date DATE NOT NULL,
    status ENUM('Scheduled','In_Progress','Passed','Failed','Retake_Required') DEFAULT 'Scheduled',
    attempt_number INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (student_roll) REFERENCES students(roll) ON DELETE CASCADE,
    
    UNIQUE KEY unique_submission (period_activity_id, student_roll),
    INDEX idx_student_roll (student_roll),
    INDEX idx_batch (batch_number),
    INDEX idx_activity (period_activity_id),
    INDEX idx_assessment_date (assessment_date)
);

-- Enhanced class_attendance table 
-- This works alongside your existing academic_session_attendance
CREATE TABLE IF NOT EXISTS enhanced_class_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    student_roll VARCHAR(45) NOT NULL,
    batch_number INT NOT NULL,
    attendance_status ENUM('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Present',
    performance ENUM('Highly Attentive','Moderately Attentive','Not Attentive','Absent') DEFAULT 'Moderately Attentive',
    participation_score INT DEFAULT 0 COMMENT 'Score out of 10',
    mentor_notes TEXT,
    has_approved_leave BOOLEAN DEFAULT FALSE,
    leave_reason TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (student_roll) REFERENCES students(roll) ON DELETE CASCADE,
    
    UNIQUE KEY unique_attendance (period_activity_id, student_roll),
    INDEX idx_student_roll (student_roll),
    INDEX idx_batch (batch_number),
    INDEX idx_activity (period_activity_id),
    INDEX idx_attendance_status (attendance_status),
    INDEX idx_performance (performance)
);

-- Enhanced activity_materials mapping table
-- This references your existing topic_materials table
CREATE TABLE IF NOT EXISTS enhanced_activity_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    material_id INT NOT NULL COMMENT 'References topic_materials.id',
    is_required BOOLEAN DEFAULT TRUE,
    sequence_order INT DEFAULT 1,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES topic_materials(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_activity_material (period_activity_id, material_id),
    INDEX idx_activity (period_activity_id),
    INDEX idx_material (material_id)
);

-- Create activity_batches table for managing batch-specific activities
CREATE TABLE IF NOT EXISTS activity_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    batch_number INT NOT NULL,
    max_students INT DEFAULT 30,
    current_students INT DEFAULT 0,
    activity_status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    start_time TIME,
    end_time TIME,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_activity_batch (period_activity_id, batch_number),
    INDEX idx_activity (period_activity_id),
    INDEX idx_batch (batch_number),
    INDEX idx_status (activity_status)
);

-- Add some useful views for easier querying

-- View for complete period activity details
CREATE OR REPLACE VIEW period_activity_details AS
SELECT 
    pa.*,
    ds.date as schedule_date,
    ds.session_no as period_number,
    ds.start_time as period_start,
    ds.end_time as period_end,
    ds.subject_id,
    s.subject_name,
    ds.section_id,
    sec.section_name,
    ds.venue as venue_id,
    v.name as venue_name,
    sec.grade_id,
    g.grade_name,
    m.roll as mentor_roll,
    th.topic_name,
    th.topic_code,
    tm.activity_name as material_title,
    tm.file_name as material_file
FROM period_activities pa
LEFT JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
LEFT JOIN subjects s ON ds.subject_id = s.id
LEFT JOIN sections sec ON ds.section_id = sec.id
LEFT JOIN venues v ON ds.venue = v.id
LEFT JOIN grades g ON sec.grade_id = g.id
LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
LEFT JOIN topic_materials tm ON pa.material_id = tm.id;

-- View for daily academic schedule summary
CREATE OR REPLACE VIEW daily_academic_summary AS
SELECT 
    pa.activity_date,
    sec.grade_id,
    ds.section_id,
    COUNT(pa.id) as total_activities,
    COUNT(CASE WHEN pa.is_assessment = TRUE THEN 1 END) as assessment_count,
    COUNT(CASE WHEN pa.is_completed = TRUE THEN 1 END) as completed_count,
    MIN(pa.start_time) as first_activity,
    MAX(pa.start_time) as last_activity_start
FROM period_activities pa
JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
JOIN sections sec ON ds.section_id = sec.id
WHERE pa.activity_date IS NOT NULL
GROUP BY pa.activity_date, sec.grade_id, ds.section_id;

-- Insert some sample data (commented out for production)
/*
-- Sample period activities (uncomment for testing)
INSERT INTO period_activities (
    daily_schedule_id, activity_date, activity_name, activity_type, duration, batch_number,
    assigned_mentor_id, topic_id, is_assessment, start_time
) VALUES 
(1, '2025-08-11', 'Math Quiz', 'Assessment', 30, 1, 1, 1, TRUE, '09:00:00'),
(1, '2025-08-11', 'Science Class', 'Academic', 30, 2, 1, 2, FALSE, '09:30:00');
*/
