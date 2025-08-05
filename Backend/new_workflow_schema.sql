-- New Workflow Database Schema Updates
-- Phase 1: Core table structure changes

-- 1. Update activity_types table with new activity types and configuration
DROP TABLE IF EXISTS `activity_types`;
CREATE TABLE `activity_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_type` varchar(50) NOT NULL,
  `marking_type` enum('attentiveness','marks','flexible') DEFAULT 'attentiveness',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_type` (`activity_type`)
);

-- Insert the 4 new activity types
INSERT INTO `activity_types` (`activity_type`, `marking_type`) VALUES
('Academic', 'attentiveness'),
('Assessment', 'marks'),
('Member Activity', 'flexible'),
('ECA', 'flexible');

-- 2. Create period_material_assignments table for coordinator material assignment
CREATE TABLE `period_material_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `daily_schedule_id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `topic_title` varchar(255) DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `daily_schedule_id` (`daily_schedule_id`),
  KEY `material_id` (`material_id`),
  KEY `assigned_by` (`assigned_by`)
);

-- 3. Create session_material_status table for tracking material completion
CREATE TABLE `session_material_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `material_assignment_id` int(11) NOT NULL,
  `status` enum('assigned','in_progress','completed','continue') DEFAULT 'assigned',
  `completed_by` int(11) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `material_assignment_id` (`material_assignment_id`),
  UNIQUE KEY `session_material` (`session_id`, `material_assignment_id`)
);

-- 4. Create assessment_uploaded_materials table for mentor uploaded assessment materials
CREATE TABLE `assessment_uploaded_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assessment_session_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` text NOT NULL,
  `file_type` varchar(50) DEFAULT 'PDF',
  `title` varchar(255) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `assessment_session_id` (`assessment_session_id`),
  KEY `uploaded_by` (`uploaded_by`)
);

-- 5. Create activity_type_configurations for flexible marking system
CREATE TABLE `activity_type_configurations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `activity_type_id` int(11) NOT NULL,
  `current_marking_type` enum('attentiveness','marks') DEFAULT 'attentiveness',
  `updated_by` int(11) NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `section_id` (`section_id`),
  KEY `subject_id` (`subject_id`),
  KEY `activity_type_id` (`activity_type_id`),
  UNIQUE KEY `section_subject_activity` (`section_id`, `subject_id`, `activity_type_id`)
);

-- 6. Add new columns to existing tables

-- Add material assignment reference to daily_schedule
ALTER TABLE `daily_schedule` 
ADD COLUMN `assigned_material_id` int(11) DEFAULT NULL AFTER `activity`,
ADD COLUMN `material_topic` varchar(255) DEFAULT NULL AFTER `assigned_material_id`,
ADD KEY `assigned_material_id` (`assigned_material_id`);

-- Add material completion status to academic_sessions
ALTER TABLE `academic_sessions` 
ADD COLUMN `material_status` enum('not_started','in_progress','completed','continue') DEFAULT 'not_started' AFTER `status`,
ADD COLUMN `material_notes` text AFTER `material_status`;

-- Add uploaded materials reference to assessment_sessions
ALTER TABLE `assessment_sessions` 
ADD COLUMN `has_uploaded_materials` tinyint(1) DEFAULT 0 AFTER `status`,
ADD COLUMN `uploaded_materials_count` int(11) DEFAULT 0 AFTER `has_uploaded_materials`;

-- 7. Update materials table to support topic-based assignment
ALTER TABLE `materials` 
ADD COLUMN `topic_title` varchar(255) DEFAULT NULL AFTER `title`,
ADD COLUMN `is_topic_based` tinyint(1) DEFAULT 0 AFTER `topic_title`,
ADD COLUMN `can_be_continued` tinyint(1) DEFAULT 1 AFTER `is_topic_based`,
ADD INDEX `topic_title` (`topic_title`),
ADD INDEX `is_topic_based` (`is_topic_based`);

-- 8. Create material_continuation_tracking for topic completion
CREATE TABLE `material_continuation_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `material_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `current_session_id` int(11) DEFAULT NULL,
  `completion_status` enum('ongoing','completed','paused') DEFAULT 'ongoing',
  `started_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `total_sessions_used` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `material_id` (`material_id`),
  KEY `section_id` (`section_id`),
  KEY `subject_id` (`subject_id`),
  KEY `current_session_id` (`current_session_id`)
);

-- 9. Add indexes for better performance
ALTER TABLE `section_subject_activities` 
ADD INDEX `section_subject` (`section_id`, `subject_id`),
ADD INDEX `activity_type` (`activity_type`);

-- 10. Create view for easy material assignment queries
CREATE VIEW `v_material_assignments` AS
SELECT 
  pma.id as assignment_id,
  pma.daily_schedule_id,
  pma.material_id,
  pma.topic_title,
  pma.assigned_at,
  ds.date,
  ds.session_no,
  ds.start_time,
  ds.end_time,
  ds.section_id,
  ds.subject_id,
  s.subject_name,
  sec.section_name,
  sec.grade_id,
  g.grade_name,
  m.file_name,
  m.file_url,
  m.title as material_title,
  at.activity_type,
  at.marking_type
FROM period_material_assignments pma
JOIN daily_schedule ds ON pma.daily_schedule_id = ds.id
LEFT JOIN materials m ON pma.material_id = m.id
JOIN subjects s ON ds.subject_id = s.id
JOIN sections sec ON ds.section_id = sec.id
JOIN grades g ON sec.grade_id = g.id
JOIN activity_types at ON ds.activity = at.id
WHERE pma.is_active = 1;
