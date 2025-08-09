-- Enhanced Period Activities Schema - Fixed for existing database structure
-- This script works with the existing database tables shown in the CSV export

-- Option 1: Just add missing columns to existing period_activities table
ALTER TABLE period_activities 
ADD COLUMN IF NOT EXISTS activity_date DATE AFTER daily_schedule_id,
ADD COLUMN IF NOT EXISTS batch_number INT DEFAULT 1 AFTER activity_type,
ADD COLUMN IF NOT EXISTS assessment_type ENUM('Quiz', 'Test', 'Assignment', 'Practical') DEFAULT 'Quiz' AFTER is_assessment,
ADD COLUMN IF NOT EXISTS total_marks INT DEFAULT 100 AFTER assessment_type,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add indexes for better performance
ALTER TABLE period_activities 
ADD INDEX IF NOT EXISTS idx_activity_date (activity_date),
ADD INDEX IF NOT EXISTS idx_batch_number (batch_number),
ADD INDEX IF NOT EXISTS idx_activity_type_new (activity_type);

-- Create assessment submissions table for period activities
CREATE TABLE IF NOT EXISTS period_activity_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    student_roll VARCHAR(45) NOT NULL, -- matching students.roll varchar(45)
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
    
    -- Fixed foreign keys matching actual table structure
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (student_roll) REFERENCES students(roll) ON DELETE CASCADE,
    
    UNIQUE KEY unique_submission (period_activity_id, student_roll),
    INDEX idx_student_roll (student_roll),
    INDEX idx_batch (batch_number),
    INDEX idx_activity (period_activity_id),
    INDEX idx_assessment_date (assessment_date)
);

-- Create attendance table for period activities  
CREATE TABLE IF NOT EXISTS period_activity_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    student_roll VARCHAR(45) NOT NULL, -- matching students.roll varchar(45)
    batch_number INT NOT NULL,
    attendance_status ENUM('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Present',
    performance ENUM('Highly Attentive','Moderately Attentive','Not Attentive','Absent') DEFAULT 'Moderately Attentive',
    participation_score INT DEFAULT 0 COMMENT 'Score out of 10',
    mentor_notes TEXT,
    has_approved_leave BOOLEAN DEFAULT FALSE,
    leave_reason TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Fixed foreign keys matching actual table structure
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (student_roll) REFERENCES students(roll) ON DELETE CASCADE,
    
    UNIQUE KEY unique_attendance (period_activity_id, student_roll),
    INDEX idx_student_roll (student_roll),
    INDEX idx_batch (batch_number),
    INDEX idx_activity (period_activity_id),
    INDEX idx_attendance_status (attendance_status),
    INDEX idx_performance (performance)
);

-- Create activity materials mapping table
CREATE TABLE IF NOT EXISTS period_activity_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_activity_id INT NOT NULL,
    material_id INT NOT NULL COMMENT 'References topic_materials.id',
    is_required BOOLEAN DEFAULT TRUE,
    sequence_order INT DEFAULT 1,
    
    -- Fixed foreign keys matching actual table structure
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES topic_materials(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_activity_material (period_activity_id, material_id),
    INDEX idx_activity (period_activity_id),
    INDEX idx_material (material_id)
);

-- Create activity batches table for managing batch-specific activities
CREATE TABLE IF NOT EXISTS period_activity_batches (
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
    
    -- Fixed foreign keys matching actual table structure
    FOREIGN KEY (period_activity_id) REFERENCES period_activities(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_activity_batch (period_activity_id, batch_number),
    INDEX idx_activity (period_activity_id),
    INDEX idx_batch (batch_number),
    INDEX idx_status (activity_status)
);

-- Create view for complete period activity details with correct table joins
CREATE OR REPLACE VIEW v_period_activity_details AS
SELECT 
    pa.id as activity_id,
    pa.daily_schedule_id,
    pa.activity_date,
    pa.activity_name,
    pa.activity_type,
    pa.batch_number,
    pa.start_time as activity_start_time,
    pa.duration,
    pa.assigned_mentor_id,
    pa.is_assessment,
    pa.assessment_type,
    pa.total_marks,
    pa.is_completed,
    
    -- Daily schedule details
    ds.date as schedule_date,
    ds.session_no as period_number,
    ds.start_time as period_start,
    ds.end_time as period_end,
    ds.subject_id,
    ds.venue,
    
    -- Subject, section, venue details
    s.subject_name,
    sec.section_name,
    sec.grade_id,
    g.grade_name,
    v.name as venue_name,
    
    -- Mentor details  
    m.roll as mentor_roll,
    m.phone as mentor_phone,
    
    -- Topic and material details
    th.topic_name,
    th.topic_code,
    tm.activity_name as material_activity,
    tm.file_name as material_file

FROM period_activities pa
LEFT JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
LEFT JOIN subjects s ON ds.subject_id = s.id
LEFT JOIN sections sec ON ds.section_id = sec.id
LEFT JOIN grades g ON sec.grade_id = g.id
LEFT JOIN venues v ON ds.venue = v.id
LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
LEFT JOIN topic_materials tm ON pa.material_id = tm.id;

-- Create view for daily academic summary
CREATE OR REPLACE VIEW v_daily_academic_summary AS
SELECT 
    pa.activity_date,
    sec.grade_id,
    g.grade_name,
    ds.section_id,
    sec.section_name,
    COUNT(pa.id) as total_activities,
    COUNT(CASE WHEN pa.is_assessment = TRUE THEN 1 END) as assessment_count,
    COUNT(CASE WHEN pa.is_completed = TRUE THEN 1 END) as completed_count,
    MIN(pa.start_time) as first_activity,
    MAX(TIME_ADD(pa.start_time, INTERVAL pa.duration MINUTE)) as last_activity
FROM period_activities pa
JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
JOIN sections sec ON ds.section_id = sec.id
JOIN grades g ON sec.grade_id = g.id
WHERE pa.activity_date IS NOT NULL
GROUP BY pa.activity_date, sec.grade_id, ds.section_id;

-- Sample insert for testing (commented out)
/*
-- Test data for period activities
INSERT INTO period_activities (
    daily_schedule_id, activity_date, activity_name, activity_type, 
    batch_number, start_time, duration, assigned_mentor_id, 
    is_assessment, assessment_type, total_marks
) VALUES 
(1, '2025-08-11', 'Math Quiz - Algebra', 'Assessment', 1, '09:00:00', 30, 1, TRUE, 'Quiz', 50),
(1, '2025-08-11', 'Science Practical', 'Practical', 2, '10:00:00', 60, 2, FALSE, NULL, NULL);
*/
