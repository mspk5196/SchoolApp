-- Create venue_subjects table for many-to-many relationship between venues and subjects
CREATE TABLE IF NOT EXISTS venue_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venue_id INT NOT NULL,
  subject_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_venue_subject (venue_id, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
