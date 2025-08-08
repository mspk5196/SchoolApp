-- Enhanced School App Database Schema - Complete Migration
-- Date: August 8, 2025
-- Description: Hierarchical topic system with automatic batch allocation

-- ============================================
-- 1. TOPIC HIERARCHY SYSTEM
-- ============================================

-- Enhanced topic hierarchy with unlimited nesting
CREATE TABLE IF NOT EXISTS `topic_hierarchy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL,
  `parent_id` int(11) NULL,
  `level` int(11) NOT NULL,
  `topic_name` varchar(255) NOT NULL,
  `topic_code` varchar(50) NOT NULL,
  `order_sequence` int(11) NOT NULL,
  `has_assessment` tinyint(1) DEFAULT 1,
  `has_homework` tinyint(1) DEFAULT 0,
  `is_bottom_level` tinyint(1) DEFAULT 0,
  `expected_completion_days` int(11) NOT NULL DEFAULT 7,
  `pass_percentage` decimal(5,2) DEFAULT 60.00,
  `max_nesting_levels` int(11) DEFAULT 5,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE CASCADE,
  INDEX `idx_subject_level` (`subject_id`, `level`),
  INDEX `idx_parent_order` (`parent_id`, `order_sequence`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enhanced materials with activity types
CREATE TABLE IF NOT EXISTS `topic_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic_id` int(11) NOT NULL,
  `material_type` enum('Academic','Classwork_Period','Assessment') NOT NULL,
  `activity_name` varchar(255) NOT NULL,
  `file_name` varchar(255),
  `file_url` text,
  `file_type` enum('PDF','Video','Interactive','Exercise','Text') NOT NULL,
  `estimated_duration` int(11) NOT NULL DEFAULT 30,
  `difficulty_level` enum('Easy','Medium','Hard') DEFAULT 'Medium',
  `instructions` text,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE CASCADE,
  INDEX `idx_topic_type` (`topic_id`, `material_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Homework assignments (only for bottom level topics)
CREATE TABLE IF NOT EXISTS `topic_homework` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic_id` int(11) NOT NULL,
  `homework_title` varchar(255) NOT NULL,
  `description` text,
  `file_url` text,
  `estimated_duration` int(11) DEFAULT 60,
  `max_attempts` int(11) DEFAULT 3,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE CASCADE,
  INDEX `idx_topic_active` (`topic_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. MENTOR GRADE SUBJECT ASSIGNMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS `mentor_grade_subject_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mentor_id` int(11) NOT NULL,
  `grade_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `assigned_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`mentor_id`) REFERENCES `mentors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_mentor_grade_subject` (`mentor_id`, `grade_id`, `subject_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. DYNAMIC BATCH SYSTEM
-- ============================================

-- Subject batch configuration
CREATE TABLE IF NOT EXISTS `subject_batch_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL,
  `grade_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `max_batches` int(11) NOT NULL DEFAULT 4,
  `auto_allocation` tinyint(1) DEFAULT 1,
  `batch_size_limit` int(11) DEFAULT 15,
  `performance_review_frequency` int(11) DEFAULT 7,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_subject_grade_section` (`subject_id`, `grade_id`, `section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enhanced batch system
CREATE TABLE IF NOT EXISTS `section_batches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `batch_name` varchar(50) NOT NULL,
  `batch_level` int(11) NOT NULL,
  `max_students` int(11) DEFAULT 15,
  `current_students_count` int(11) DEFAULT 0,
  `avg_performance_score` decimal(5,2) DEFAULT 0,
  `auto_created` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_section_subject_level` (`section_id`, `subject_id`, `batch_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student batch assignments
CREATE TABLE IF NOT EXISTS `student_batch_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `assigned_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` int(11) NOT NULL,
  `is_current` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`batch_id`) REFERENCES `section_batches`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_current` (`student_roll`, `is_current`),
  INDEX `idx_batch_current` (`batch_id`, `is_current`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student batch allocation history
CREATE TABLE IF NOT EXISTS `student_batch_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `from_batch_id` int(11),
  `to_batch_id` int(11) NOT NULL,
  `allocation_reason` enum('Initial','Performance_Upgrade','Performance_Downgrade','Penalty','Manual') NOT NULL,
  `allocation_date` date NOT NULL,
  `performance_score` decimal(5,2),
  `homework_completion_rate` decimal(5,2),
  `assessment_avg_score` decimal(5,2),
  `allocated_by` enum('System','Coordinator','Mentor') DEFAULT 'System',
  `notes` text,
  `effective_from` date NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_batch_id`) REFERENCES `section_batches`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`to_batch_id`) REFERENCES `section_batches`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_subject` (`student_roll`, `subject_id`),
  INDEX `idx_allocation_date` (`allocation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. STUDENT PROGRESS TRACKING
-- ============================================

-- Student progress tracking
CREATE TABLE IF NOT EXISTS `student_topic_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `status` enum('Not Started','In Progress','Completed','Failed') DEFAULT 'Not Started',
  `completion_percentage` decimal(5,2) DEFAULT 0.00,
  `attempts_count` int(11) DEFAULT 0,
  `last_assessment_score` decimal(5,2),
  `completed_at` timestamp NULL,
  `prerequisites_met` tinyint(1) DEFAULT 0,
  `is_parallel_allowed` tinyint(1) DEFAULT 1,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_topic` (`student_roll`, `topic_id`),
  FOREIGN KEY (`topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_subject_status` (`student_roll`, `subject_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Student completion history with timing tracking
CREATE TABLE IF NOT EXISTS `student_topic_completion_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `level_type` enum('Topic','Sub_Topic','Sub_Sub_Topic','Level','Subject') NOT NULL,
  `started_date` date NOT NULL,
  `expected_completion_date` date NOT NULL,
  `actual_completion_date` date,
  `days_taken` int(11),
  `days_late` int(11) DEFAULT 0,
  `completion_status` enum('On_Time','Late','Very_Late','Incomplete') DEFAULT 'Incomplete',
  `final_score` decimal(5,2),
  `attempts_taken` int(11) DEFAULT 1,
  `batch_at_start` varchar(10),
  `batch_at_completion` varchar(10),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_completion` (`student_roll`, `actual_completion_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. HOMEWORK & ASSESSMENT TRACKING
-- ============================================

-- Enhanced homework tracking with mentor marking
CREATE TABLE IF NOT EXISTS `student_homework_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `homework_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `assigned_date` date NOT NULL,
  `due_date` date NOT NULL,
  `submission_date` date,
  `marked_date` date,
  `marked_by_mentor_id` int(11),
  `status` enum('Assigned','Submitted','Late_Submitted','Missing','Marked_Complete','Marked_Incomplete','Excused') DEFAULT 'Assigned',
  `mentor_score` decimal(5,2),
  `mentor_feedback` text,
  `attempts_used` int(11) DEFAULT 0,
  `days_late` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`homework_id`) REFERENCES `topic_homework`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`marked_by_mentor_id`) REFERENCES `mentors`(`id`) ON DELETE SET NULL,
  INDEX `idx_student_subject_status` (`student_roll`, `subject_id`, `status`),
  INDEX `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Assessment tracking for all levels
CREATE TABLE IF NOT EXISTS `student_assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `assessment_type` enum('Topic_Assessment','Level_Assessment','Final_Assessment') NOT NULL,
  `score` decimal(5,2),
  `max_score` decimal(5,2) NOT NULL,
  `pass_score` decimal(5,2) NOT NULL,
  `status` enum('Scheduled','In_Progress','Passed','Failed','Retake_Required') DEFAULT 'Scheduled',
  `attempt_number` int(11) DEFAULT 1,
  `assessment_date` date NOT NULL,
  `completed_at` timestamp,
  `next_retake_date` date,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_topic_status` (`student_roll`, `topic_id`, `status`),
  INDEX `idx_assessment_date` (`assessment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cross-subject assessment scheduling
CREATE TABLE IF NOT EXISTS `student_assessment_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `assessment_type` enum('Topic_Assessment','Level_Assessment','Final_Assessment') NOT NULL,
  `priority_level` int(11) DEFAULT 1,
  `requested_date` date,
  `scheduled_date` date,
  `scheduled_time` time,
  `venue_id` int(11),
  `mentor_id` int(11),
  `status` enum('Requested','Scheduled','In_Progress','Completed','Cancelled') DEFAULT 'Requested',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`mentor_id`) REFERENCES `mentors`(`id`) ON DELETE SET NULL,
  INDEX `idx_student_subject` (`student_roll`, `subject_id`),
  INDEX `idx_scheduled_date` (`scheduled_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. PENALTY SYSTEM
-- ============================================

-- Enhanced penalty tracking
CREATE TABLE IF NOT EXISTS `student_penalty_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `grade_id` int(11) NOT NULL,
  `penalty_type` enum('Homework_Incomplete','Assessment_Failed','Both') NOT NULL,
  `homework_miss_count` int(11) DEFAULT 0,
  `failed_assessment_count` int(11) DEFAULT 0,
  `penalty_threshold` int(11) DEFAULT 3,
  `is_on_penalty` tinyint(1) DEFAULT 0,
  `penalty_start_date` date,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_student_subject_penalty` (`student_roll`, `subject_id`),
  INDEX `idx_penalty_status` (`is_on_penalty`, `subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Remedial classwork sessions (penalty sessions)
CREATE TABLE IF NOT EXISTS `remedial_classwork_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `original_eca_schedule_id` int(11) NOT NULL,
  `assigned_mentor_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `grade_id` int(11) NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `venue_id` int(11),
  `penalty_reason` enum('Homework_Incomplete','Assessment_Failed','Both') NOT NULL,
  `topics_to_cover` json,
  `mentor_notes` text,
  `status` enum('Scheduled','In_Progress','Completed','Missed','Rescheduled') DEFAULT 'Scheduled',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assigned_mentor_id`) REFERENCES `mentors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE SET NULL,
  INDEX `idx_student_date` (`student_roll`, `session_date`),
  INDEX `idx_mentor_date` (`assigned_mentor_id`, `session_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. ENHANCED SCHEDULING SYSTEM
-- ============================================

-- Enhanced daily schedule (drop existing and recreate with new structure)
DROP TABLE IF EXISTS `daily_schedule_new`;
CREATE TABLE `daily_schedule_new` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `grade_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `period_number` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `venue_id` int(11) NOT NULL,
  `created_by_coordinator_id` int(11) NOT NULL,
  `is_eca` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE CASCADE,
  INDEX `idx_date_section` (`date`, `section_id`),
  INDEX `idx_grade_subject` (`grade_id`, `subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Multiple activities within one subject period
CREATE TABLE IF NOT EXISTS `period_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `daily_schedule_id` int(11) NOT NULL,
  `activity_name` varchar(255) NOT NULL,
  `activity_type` enum('Assessment','Academic_Material','One_Member_Activity','Group_Activity','Practical','Discussion') NOT NULL,
  `batch_ids` json,
  `topic_id` int(11),
  `material_id` int(11),
  `start_time` time NOT NULL,
  `duration` int(11) NOT NULL,
  `max_participants` int(11),
  `assigned_mentor_id` int(11),
  `activity_instructions` text,
  `is_assessment` tinyint(1) DEFAULT 0,
  `assessment_weightage` decimal(5,2),
  `is_completed` tinyint(1) DEFAULT 0,
  `completion_notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`daily_schedule_id`) REFERENCES `daily_schedule_new`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`material_id`) REFERENCES `topic_materials`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_mentor_id`) REFERENCES `mentors`(`id`) ON DELETE SET NULL,
  INDEX `idx_schedule_time` (`daily_schedule_id`, `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activity participation tracking
CREATE TABLE IF NOT EXISTS `student_activity_participation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_id` int(11) NOT NULL,
  `student_roll` varchar(45) NOT NULL,
  `participation_status` enum('Scheduled','Present','Absent','Late','Excused') DEFAULT 'Scheduled',
  `performance_score` decimal(5,2),
  `mentor_feedback` text,
  `completion_time` int(11),
  `submitted_work` text,
  `marked_by_mentor_id` int(11),
  `marked_at` timestamp,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`activity_id`) REFERENCES `period_activities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`marked_by_mentor_id`) REFERENCES `mentors`(`id`) ON DELETE SET NULL,
  INDEX `idx_activity_student` (`activity_id`, `student_roll`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Multi-subject batch assignments for students
CREATE TABLE IF NOT EXISTS `student_multi_subject_batches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_roll` varchar(45) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `current_topic_id` int(11),
  `assigned_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `is_current` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_subject_batch` (`student_roll`, `subject_id`, `is_current`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`batch_id`) REFERENCES `section_batches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`current_topic_id`) REFERENCES `topic_hierarchy`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. STORED PROCEDURES (TiDB Compatible)
-- ============================================

-- Note: TiDB doesn't support user-defined functions, so we'll use views and procedures instead

-- View to check assessment eligibility (replaces can_take_assessment function)
CREATE OR REPLACE VIEW v_assessment_eligibility AS
SELECT 
    stp.student_roll,
    stp.topic_id,
    stp.subject_id,
    th.topic_name,
    CASE 
        WHEN COUNT(prereq.id) = SUM(CASE WHEN prereq_progress.status = 'Completed' THEN 1 ELSE 0 END)
        THEN 1 
        ELSE 0 
    END as can_take_assessment,
    COUNT(prereq.id) as total_prerequisites,
    SUM(CASE WHEN prereq_progress.status = 'Completed' THEN 1 ELSE 0 END) as completed_prerequisites
FROM student_topic_progress stp
JOIN topic_hierarchy th ON stp.topic_id = th.id
LEFT JOIN topic_hierarchy prereq ON prereq.subject_id = th.subject_id 
    AND prereq.order_sequence < th.order_sequence 
    AND prereq.level = th.level
LEFT JOIN student_topic_progress prereq_progress ON prereq.id = prereq_progress.topic_id 
    AND stp.student_roll = prereq_progress.student_roll
GROUP BY stp.student_roll, stp.topic_id, stp.subject_id, th.topic_name;

-- View for homework completion rates (replaces homework_completion_rate function)
CREATE OR REPLACE VIEW v_homework_completion_rates AS
SELECT 
    student_roll,
    subject_id,
    COUNT(*) as total_homework,
    SUM(CASE WHEN status IN ('Marked_Complete', 'Submitted') THEN 1 ELSE 0 END) as completed_homework,
    ROUND(
        (SUM(CASE WHEN status IN ('Marked_Complete', 'Submitted') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
        2
    ) as completion_rate
FROM student_homework_tracking
GROUP BY student_roll, subject_id;

-- View for assessment averages (replaces assessment_average function)
CREATE OR REPLACE VIEW v_assessment_averages AS
SELECT 
    sa.student_roll,
    th.subject_id,
    COUNT(*) as total_assessments,
    ROUND(AVG((sa.score / sa.max_score) * 100), 2) as average_score,
    SUM(CASE WHEN sa.status = 'Passed' THEN 1 ELSE 0 END) as passed_assessments
FROM student_assessments sa
JOIN topic_hierarchy th ON sa.topic_id = th.id
WHERE sa.status IN ('Passed', 'Failed')
GROUP BY sa.student_roll, th.subject_id;

DELIMITER //

-- Stored procedure for daily batch reallocation (TiDB Compatible)
CREATE PROCEDURE reallocate_student_batches()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE student_roll VARCHAR(45);
    DECLARE subject_id INT;
    DECLARE current_batch_level INT;
    DECLARE performance_score DECIMAL(5,2);
    DECLARE homework_rate DECIMAL(5,2);
    DECLARE assessment_avg DECIMAL(5,2);
    DECLARE new_batch_level INT;
    DECLARE new_batch_id INT;
    DECLARE current_batch_id INT;
    
    DECLARE student_cursor CURSOR FOR
        SELECT 
            sba.student_roll,
            sb.subject_id,
            sb.batch_level,
            sba.batch_id,
            COALESCE(AVG(sap.performance_score), 0) as avg_performance,
            COALESCE(hcr.completion_rate, 0) as homework_rate,
            COALESCE(aa.average_score, 0) as assessment_avg
        FROM student_batch_assignments sba
        JOIN section_batches sb ON sba.batch_id = sb.id
        LEFT JOIN student_activity_participation sap ON sba.student_roll = sap.student_roll
        LEFT JOIN v_homework_completion_rates hcr ON sba.student_roll = hcr.student_roll AND sb.subject_id = hcr.subject_id
        LEFT JOIN v_assessment_averages aa ON sba.student_roll = aa.student_roll AND sb.subject_id = aa.subject_id
        WHERE sba.is_current = 1
        GROUP BY sba.student_roll, sb.subject_id, sb.batch_level, sba.batch_id, hcr.completion_rate, aa.average_score;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN student_cursor;
    
    read_loop: LOOP
        FETCH student_cursor INTO student_roll, subject_id, current_batch_level, current_batch_id,
                                  performance_score, homework_rate, assessment_avg;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate overall performance score
        SET performance_score = (performance_score * 0.4) + (homework_rate * 0.3) + (assessment_avg * 0.3);
        
        -- Determine new batch level based on performance
        CASE 
            WHEN performance_score >= 85 THEN SET new_batch_level = 1;
            WHEN performance_score >= 70 THEN SET new_batch_level = 2;
            WHEN performance_score >= 55 THEN SET new_batch_level = 3;
            ELSE SET new_batch_level = 4;
        END CASE;
        
        -- If batch change needed
        IF new_batch_level != current_batch_level THEN
            -- Get new batch ID
            SELECT id INTO new_batch_id 
            FROM section_batches 
            WHERE subject_id = subject_id AND batch_level = new_batch_level 
            AND is_active = 1
            LIMIT 1;
            
            IF new_batch_id IS NOT NULL THEN
                -- Update current assignment
                UPDATE student_batch_assignments 
                SET is_current = 0 
                WHERE student_roll = student_roll AND batch_id = current_batch_id AND is_current = 1;
                
                -- Create new assignment
                INSERT INTO student_batch_assignments 
                (student_roll, batch_id, assigned_by, is_current)
                VALUES 
                (student_roll, new_batch_id, 0, 1);
                
                -- Record in history
                INSERT INTO student_batch_history 
                (student_roll, subject_id, from_batch_id, to_batch_id, allocation_reason, 
                 allocation_date, performance_score, homework_completion_rate, assessment_avg_score, 
                 allocated_by, effective_from)
                VALUES 
                (student_roll, subject_id, current_batch_id, new_batch_id,
                 CASE WHEN new_batch_level < current_batch_level THEN 'Performance_Upgrade' ELSE 'Performance_Downgrade' END,
                 CURDATE(), performance_score, homework_rate, assessment_avg, 'System', CURDATE());
            END IF;
        END IF;
        
    END LOOP;
    
    CLOSE student_cursor;
END //

-- Procedure to auto-assign remedial sessions
CREATE PROCEDURE assign_remedial_session(
    IN p_student_roll VARCHAR(45),
    IN p_subject_id INT,
    IN p_grade_id INT,
    IN p_penalty_reason ENUM('Homework_Incomplete','Assessment_Failed','Both')
)
BEGIN
    DECLARE mentor_id INT;
    DECLARE eca_schedule_id INT;
    DECLARE session_date DATE;
    DECLARE start_time TIME;
    DECLARE end_time TIME;
    DECLARE venue_id INT;
    
    -- Find next ECA period for student
    SELECT ds.id, ds.date, ds.start_time, ds.end_time, ds.venue
    INTO eca_schedule_id, session_date, start_time, end_time, venue_id
    FROM daily_schedule_new ds
    WHERE ds.is_eca = 1 
    AND ds.date >= CURDATE()
    AND ds.section_id = (SELECT section_id FROM students WHERE roll = p_student_roll LIMIT 1)
    ORDER BY ds.date, ds.start_time
    LIMIT 1;
    
    -- Find available mentor for the subject and grade
    SELECT m.id INTO mentor_id
    FROM mentors m 
    JOIN mentor_grade_subject_assignments mgsa ON m.id = mgsa.mentor_id 
    WHERE mgsa.grade_id = p_grade_id 
    AND mgsa.subject_id = p_subject_id 
    AND mgsa.is_active = 1 
    AND m.id NOT IN (
        SELECT DISTINCT assigned_mentor_id 
        FROM daily_schedule_new ds 
        WHERE ds.date = session_date 
        AND ds.start_time <= start_time 
        AND ds.end_time >= end_time
        AND assigned_mentor_id IS NOT NULL
    ) 
    ORDER BY mgsa.is_primary DESC
    LIMIT 1;
    
    -- Create remedial session
    IF mentor_id IS NOT NULL AND eca_schedule_id IS NOT NULL THEN
        INSERT INTO remedial_classwork_sessions 
        (student_roll, original_eca_schedule_id, assigned_mentor_id, subject_id, grade_id,
         session_date, start_time, end_time, venue_id, penalty_reason, status)
        VALUES 
        (p_student_roll, eca_schedule_id, mentor_id, p_subject_id, p_grade_id,
         session_date, start_time, end_time, venue_id, p_penalty_reason, 'Scheduled');
    END IF;
END //

DELIMITER ;

-- ============================================
-- 9. SAMPLE DATA INSERTIONS
-- ============================================

-- Insert sample topic hierarchy for Mathematics
INSERT INTO topic_hierarchy (subject_id, parent_id, level, topic_name, topic_code, order_sequence, has_assessment, has_homework, is_bottom_level, expected_completion_days) VALUES
(1, NULL, 1, 'Arithmetic Operations', 'MATH_L1_AO', 1, 1, 0, 0, 30),
(1, 1, 2, 'Addition', 'MATH_L1_AO_ADD', 1, 1, 0, 0, 10),
(1, 2, 3, 'One Digit Addition', 'MATH_L1_AO_ADD_1D', 1, 1, 1, 1, 3),
(1, 2, 3, 'Two Digit Addition', 'MATH_L1_AO_ADD_2D', 2, 1, 1, 1, 4),
(1, 2, 3, 'Three Digit Addition', 'MATH_L1_AO_ADD_3D', 3, 1, 1, 1, 5),
(1, 1, 2, 'Subtraction', 'MATH_L1_AO_SUB', 2, 1, 0, 0, 10),
(1, 6, 3, 'One Digit Subtraction', 'MATH_L1_AO_SUB_1D', 1, 1, 1, 1, 3),
(1, 6, 3, 'Two Digit Subtraction', 'MATH_L1_AO_SUB_2D', 2, 1, 1, 1, 4),
(1, NULL, 1, 'Differentiation', 'MATH_L2_DIFF', 2, 1, 0, 0, 45);

-- Insert sample materials for topics
INSERT INTO topic_materials (topic_id, material_type, activity_name, file_name, file_url, file_type, estimated_duration, instructions) VALUES
(3, 'Academic', 'Introduction to One Digit Addition', 'one_digit_addition.pdf', '/materials/math/one_digit_addition.pdf', 'PDF', 20, 'Learn basic one digit addition'),
(3, 'Classwork_Period', 'Practice One Digit Addition', 'one_digit_practice.pdf', '/materials/math/one_digit_practice.pdf', 'Exercise', 15, 'Complete the practice problems'),
(3, 'Assessment', 'One Digit Addition Test', 'one_digit_test.pdf', '/materials/math/one_digit_test.pdf', 'PDF', 30, 'Assessment for one digit addition');

-- Insert sample homework for bottom level topics
INSERT INTO topic_homework (topic_id, homework_title, description, estimated_duration) VALUES
(3, 'One Digit Addition Homework', 'Complete 20 one digit addition problems', 45),
(4, 'Two Digit Addition Homework', 'Complete 15 two digit addition problems', 60),
(7, 'One Digit Subtraction Homework', 'Complete 20 one digit subtraction problems', 45);

-- Create sample batches for a section
INSERT INTO subject_batch_config (subject_id, grade_id, section_id, max_batches, created_by) VALUES
(1, 1, 1, 4, 1);

INSERT INTO section_batches (section_id, subject_id, batch_name, batch_level, auto_created) VALUES
(1, 1, 'Batch A', 1, 1),
(1, 1, 'Batch B', 2, 1),
(1, 1, 'Batch C', 3, 1),
(1, 1, 'Batch D', 4, 1);

-- ============================================
-- 10. VIEWS FOR EASY DATA ACCESS
-- ============================================

-- Student progress summary view
CREATE OR REPLACE VIEW v_student_progress_summary AS
SELECT 
    s.roll,
    s.name,
    sub.subject_name,
    COUNT(DISTINCT stp.topic_id) as total_topics,
    SUM(CASE WHEN stp.status = 'Completed' THEN 1 ELSE 0 END) as completed_topics,
    AVG(stp.completion_percentage) as avg_completion_percentage,
    sb.batch_name as current_batch,
    sb.batch_level
FROM students s
JOIN student_batch_assignments sba ON s.roll = sba.student_roll AND sba.is_current = 1
JOIN section_batches sb ON sba.batch_id = sb.id
JOIN subjects sub ON sb.subject_id = sub.id
LEFT JOIN student_topic_progress stp ON s.roll = stp.student_roll AND sub.id = stp.subject_id
GROUP BY s.roll, s.name, sub.id, sub.subject_name, sb.batch_name, sb.batch_level;

-- Student penalty status view
CREATE OR REPLACE VIEW v_student_penalty_status AS
SELECT 
    s.roll,
    s.name,
    sub.subject_name,
    spt.homework_miss_count,
    spt.failed_assessment_count,
    spt.penalty_threshold,
    spt.is_on_penalty,
    spt.penalty_start_date,
    CASE 
        WHEN spt.homework_miss_count >= spt.penalty_threshold THEN 'Homework Penalty'
        WHEN spt.failed_assessment_count >= spt.penalty_threshold THEN 'Assessment Penalty'
        ELSE 'No Penalty'
    END as penalty_status
FROM students s
LEFT JOIN student_penalty_tracking spt ON s.roll = spt.student_roll
LEFT JOIN subjects sub ON spt.subject_id = sub.id;

-- Daily schedule with activities view
CREATE OR REPLACE VIEW v_daily_schedule_activities AS
SELECT 
    ds.date,
    g.grade_name,
    sec.section_name,
    sub.subject_name,
    ds.period_number,
    ds.start_time,
    ds.end_time,
    pa.activity_name,
    pa.activity_type,
    pa.duration,
    m.roll as mentor_roll,
    v.name as venue_name
FROM daily_schedule_new ds
JOIN grades g ON ds.grade_id = g.id
JOIN sections sec ON ds.section_id = sec.id
JOIN subjects sub ON ds.subject_id = sub.id
LEFT JOIN period_activities pa ON ds.id = pa.daily_schedule_id
LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
LEFT JOIN venues v ON ds.venue_id = v.id
ORDER BY ds.date, ds.period_number, pa.start_time;

-- ============================================
-- 11. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

DELIMITER //

-- Update batch student count when student is assigned
CREATE TRIGGER update_batch_count_on_assignment
AFTER INSERT ON student_batch_assignments
FOR EACH ROW
BEGIN
    UPDATE section_batches 
    SET current_students_count = (
        SELECT COUNT(*) 
        FROM student_batch_assignments 
        WHERE batch_id = NEW.batch_id AND is_current = 1
    )
    WHERE id = NEW.batch_id;
END //

-- Update batch student count when student assignment changes
CREATE TRIGGER update_batch_count_on_update
AFTER UPDATE ON student_batch_assignments
FOR EACH ROW
BEGIN
    -- Update old batch count
    IF OLD.batch_id != NEW.batch_id OR OLD.is_current != NEW.is_current THEN
        UPDATE section_batches 
        SET current_students_count = (
            SELECT COUNT(*) 
            FROM student_batch_assignments 
            WHERE batch_id = OLD.batch_id AND is_current = 1
        )
        WHERE id = OLD.batch_id;
        
        -- Update new batch count
        UPDATE section_batches 
        SET current_students_count = (
            SELECT COUNT(*) 
            FROM student_batch_assignments 
            WHERE batch_id = NEW.batch_id AND is_current = 1
        )
        WHERE id = NEW.batch_id;
    END IF;
END //

-- Auto-update penalty tracking when homework is marked incomplete
CREATE TRIGGER update_penalty_on_homework_fail
AFTER UPDATE ON student_homework_tracking
FOR EACH ROW
BEGIN
    IF NEW.status = 'Missing' OR NEW.status = 'Marked_Incomplete' THEN
        INSERT INTO student_penalty_tracking 
        (student_roll, subject_id, grade_id, penalty_type, homework_miss_count)
        VALUES (
            NEW.student_roll, 
            NEW.subject_id, 
            (SELECT grade_id FROM students s JOIN sections sec ON s.section_id = sec.id WHERE s.roll = NEW.student_roll LIMIT 1),
            'Homework_Incomplete',
            1
        )
        ON DUPLICATE KEY UPDATE 
        homework_miss_count = homework_miss_count + 1,
        is_on_penalty = CASE WHEN homework_miss_count + 1 >= penalty_threshold THEN 1 ELSE 0 END,
        penalty_start_date = CASE WHEN homework_miss_count + 1 >= penalty_threshold AND penalty_start_date IS NULL THEN CURDATE() ELSE penalty_start_date END;
    END IF;
END //

-- Auto-update penalty tracking when assessment is failed
CREATE TRIGGER update_penalty_on_assessment_fail
AFTER UPDATE ON student_assessments
FOR EACH ROW
BEGIN
    IF NEW.status = 'Failed' THEN
        INSERT INTO student_penalty_tracking 
        (student_roll, subject_id, grade_id, penalty_type, failed_assessment_count)
        VALUES (
            NEW.student_roll, 
            (SELECT subject_id FROM topic_hierarchy WHERE id = NEW.topic_id),
            (SELECT grade_id FROM students s JOIN sections sec ON s.section_id = sec.id WHERE s.roll = NEW.student_roll LIMIT 1),
            'Assessment_Failed',
            1
        )
        ON DUPLICATE KEY UPDATE 
        failed_assessment_count = failed_assessment_count + 1,
        is_on_penalty = CASE WHEN failed_assessment_count + 1 >= penalty_threshold THEN 1 ELSE 0 END,
        penalty_start_date = CASE WHEN failed_assessment_count + 1 >= penalty_threshold AND penalty_start_date IS NULL THEN CURDATE() ELSE penalty_start_date END;
    END IF;
END //

DELIMITER ;

-- ============================================
-- 12. INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for better performance
CREATE INDEX idx_student_roll ON student_topic_progress(student_roll);
CREATE INDEX idx_topic_subject ON topic_hierarchy(subject_id, parent_id);
CREATE INDEX idx_homework_student_subject ON student_homework_tracking(student_roll, subject_id);
CREATE INDEX idx_assessment_student_topic ON student_assessments(student_roll, topic_id);
CREATE INDEX idx_batch_section_subject ON section_batches(section_id, subject_id);
CREATE INDEX idx_penalty_student_subject ON student_penalty_tracking(student_roll, subject_id);

-- ============================================
-- MIGRATION NOTES
-- ============================================
-- 1. Backup existing daily_schedule table before running this migration
-- 2. Update application code to use daily_schedule_new table
-- 3. Migrate existing data if needed
-- 4. Run the batch reallocation procedure daily via cron job
-- 5. Monitor performance and adjust indexes as needed

-- End of Migration Script
