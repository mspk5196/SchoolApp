-- Create batch change log table for audit purposes
CREATE TABLE IF NOT EXISTS batch_change_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    coordinator_id INT NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_batch_id (batch_id),
    INDEX idx_coordinator_id (coordinator_id),
    INDEX idx_change_type (change_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
