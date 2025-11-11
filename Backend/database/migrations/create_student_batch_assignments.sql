-- Create student_batch_assignments table
-- This table tracks which students are assigned to which batches

CREATE TABLE IF NOT EXISTS `student_batch_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `batch_id` int NOT NULL,
  `current_performance` decimal(5,2) DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_batch` (`student_id`, `batch_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_batch_id` (`batch_id`),
  CONSTRAINT `fk_sba_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sba_batch` FOREIGN KEY (`batch_id`) REFERENCES `section_batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for performance queries
CREATE INDEX `idx_performance` ON `student_batch_assignments` (`current_performance`);

-- Add index for activity tracking
CREATE INDEX `idx_last_activity` ON `student_batch_assignments` (`last_activity`);
