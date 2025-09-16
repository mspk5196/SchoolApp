-- Add redo_count and redo_reason columns to student_homework_tracking table if they don't exist

-- Check if redo_count column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'student_homework_tracking' 
AND column_name = 'redo_count';

SET @sql = CASE 
    WHEN @col_exists = 0 THEN 
        'ALTER TABLE student_homework_tracking ADD COLUMN redo_count INT DEFAULT 0'
    ELSE 
        'SELECT "redo_count column already exists"'
END;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if redo_reason column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'student_homework_tracking' 
AND column_name = 'redo_reason';

SET @sql = CASE 
    WHEN @col_exists = 0 THEN 
        'ALTER TABLE student_homework_tracking ADD COLUMN redo_reason TEXT'
    ELSE 
        'SELECT "redo_reason column already exists"'
END;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;