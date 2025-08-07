# Exam Schedule Conflict Management Implementation

## Overview
This implementation adds comprehensive conflict detection and resolution for exam schedules when they conflict with existing class schedules (daily_schedule). The system includes both manual conflict resolution and automated recurring conflict deletion.

## Features Implemented

### 1. Conflict Detection
- **Pre-creation Check**: Before creating an exam schedule, the system checks for conflicts with existing daily schedules
- **Section-based Conflict Detection**: Checks all sections within the grade for time conflicts
- **Time Overlap Detection**: Identifies overlapping time ranges between exam and class schedules

### 2. Manual Conflict Resolution
- **Conflict Modal**: Shows detailed information about conflicting schedules
- **User Choice**: Allows users to either cancel exam creation or delete conflicting schedules
- **Detailed Conflict Display**: Shows section name, subject, timing, and activity type for each conflict

### 3. Automated Recurring Conflict Deletion
- **Cron Job Implementation**: Runs every 5 minutes to check for recurring exam conflicts
- **Recurrence Support**: Handles Daily, Every Mon/Tue/Wed/Thu/Fri/Sat/Sun patterns
- **Cascade Deletion**: Removes related academic_sessions and assessment_sessions when deleting daily schedules

## Backend Changes

### 1. Enhanced Controller (`coordinatorController.js`)
```javascript
// New conflict checking logic in createExamSchedule
exports.createExamSchedule = async (req, res) => {
  // Checks for conflicts before creation
  // Returns conflict data if found
  // Supports force creation with forceCreate flag
}

// New endpoint for manual conflict deletion
exports.deleteConflictingSchedules = async (req, res) => {
  // Manually delete conflicting schedules
}

// Helper functions added:
async function checkScheduleConflicts(grade_id, exam_date, start_time, end_time, recurrence)
function scheduleExamConflictDeletions(examId, grade_id, exam_date, start_time, end_time, recurrence)
async function deleteConflictingSchedules(grade_id, date, start_time, end_time)
```

### 2. New Route (`coordinator.js`)
```javascript
router.post('/coordinator/deleteConflictingSchedules', coordinatorController.deleteConflictingSchedules);
```

### 3. Cron Job Implementation (`examConflictCron.js`)
```javascript
// New cron job file for automated conflict deletion
async function runExamConflictDeletion()
async function deleteConflictingSchedules(grade_id, date, start_time, end_time)
```

### 4. Cron Manager Integration (`cronManager.js`)
```javascript
// Added exam conflict deletion cron job
createSafeCronJob('*/5 * * * *', async () => {
  await runExamConflictDeletion();
}, getCronOptions(), 'Exam Conflict Deletion Cron Job');
```

### 5. Enhanced Cron Validation
- Updated `validateCronExpression` function to support interval expressions like `*/5`
- Added proper validation for complex cron patterns

## Frontend Changes

### 1. Enhanced Context (`ExamContext.js`)
```javascript
// Modified addSession to handle conflicts
const addSession = async (newSession) => {
  // Returns conflict data if conflicts found
  // Supports conflict resolution flow
}

// New conflict resolution function
const handleConflictResolution = async (sessionData, deleteConflicts = false)
```

### 2. New Component (`ConflictResolutionModal.jsx`)
- **Responsive Modal**: Shows conflict details with proper styling
- **Conflict List**: Displays all conflicting schedules with details
- **Action Buttons**: Cancel or Delete & Create options
- **Warning Display**: Clear indication of the consequences

### 3. Enhanced Main Component (`CoordinatorExamSchedule.jsx`)
```javascript
// Added conflict resolution state and handlers
const [conflictModalVisible, setConflictModalVisible] = useState(false);
const [conflictData, setConflictData] = useState({
  conflicts: [],
  sessionData: null
});

// Modified handleAddSession to handle conflicts
// Added conflict resolution handlers
const handleConflictDelete = async ()
const handleConflictCancel = ()
```

## Database Tables Involved

### Primary Tables
- **Exam_Schedule**: Stores exam schedules with recurrence patterns
- **daily_schedule**: Contains daily class schedules that may conflict
- **sections**: Links schedules to specific sections within grades
- **assessment_sessions**: Related sessions that must be deleted with conflicting schedules
- **academic_sessions**: Academic sessions linked to daily schedules

### Conflict Detection Query
```sql
SELECT ds.*, s.section_name, sub.subject_name, at.activity_type
FROM daily_schedule ds
JOIN sections s ON ds.section_id = s.id
JOIN subjects sub ON ds.subject_id = sub.id
LEFT JOIN activity_types at ON ds.activity = at.id
WHERE ds.section_id IN (section_ids_for_grade)
AND ds.date = exam_date
AND (time_overlap_conditions)
```

## User Flow

### 1. Creating Exam Schedule
1. User fills exam schedule form
2. System checks for conflicts on submission
3. If conflicts found:
   - Shows conflict resolution modal
   - Lists all conflicting schedules
   - User chooses to cancel or delete conflicts
4. If no conflicts or user chooses to delete:
   - Creates exam schedule
   - Deletes conflicting schedules (if chosen)

### 2. Recurring Conflict Management
1. Cron job runs every 5 minutes
2. Checks for recurring exams that should run today
3. For each matching exam:
   - Finds conflicting daily schedules
   - Deletes conflicts and related sessions
   - Logs the action

## Error Handling

### Frontend
- Network error handling in API calls
- User-friendly error messages
- Loading states during operations
- Confirmation dialogs for destructive actions

### Backend
- Database transaction safety
- Proper error logging
- Graceful fallback for cron failures
- Validation of input parameters

## Security Considerations
- Grade-based access control (only affects sections within the specified grade)
- Input validation for all parameters
- SQL injection prevention through parameterized queries
- Proper error handling without exposing sensitive data

## Performance Optimizations
- Efficient query patterns with proper indexing
- Batch operations for multiple deletions
- Minimal database calls in cron jobs
- Proper cleanup of related records

## Testing Considerations
- Test conflict detection with various time overlaps
- Verify recurring pattern matching
- Test cascade deletion of related records
- Validate cron job execution timing
- Test UI responsiveness and error states

## Deployment Notes
- Cron jobs are automatically initialized on server start
- Environment-specific cron scheduling (development vs production)
- Proper logging for monitoring and debugging
- Database migration may be needed for any new columns or indexes

This implementation provides a comprehensive solution for managing exam schedule conflicts while maintaining data integrity and providing a smooth user experience.
