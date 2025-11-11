# Material Management API Documentation

This document describes the complete backend API for the Material Management system, including Batch Management, Topic Hierarchy, and Material Upload features.

## Table of Contents
1. [Batch Management](#batch-management)
2. [Topic Hierarchy](#topic-hierarchy)
3. [Material Management](#material-management)
4. [Excel Bulk Upload](#excel-bulk-upload)
5. [Database Schema](#database-schema)

---

## Batch Management

### 1. Get Batches
**Endpoint:** `POST /api/coordinator/batch/getBatches`

**Description:** Get all batches for a subject-section combination with statistics.

**Request Body:**
```json
{
  "sectionId": 1,
  "subjectId": 2
}
```

**Response:**
```json
{
  "success": true,
  "batches": [
    {
      "id": 1,
      "batch_name": "Batch 1",
      "batch_level": 1,
      "max_students": 30,
      "current_students_count": 25,
      "avg_performance_score": 75.50,
      "is_active": 1,
      "active_topics": 5,
      "capacity_utilization": 83,
      "performance_grade": "B"
    }
  ],
  "subjectSectionId": 10
}
```

---

### 2. Get Batch Analytics
**Endpoint:** `POST /api/coordinator/batch/getBatchAnalytics`

**Description:** Get comprehensive analytics for all batches in a subject-section.

**Request Body:**
```json
{
  "sectionId": 1,
  "subjectId": 2
}
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "total_batches": 3,
    "total_students": 75,
    "overall_avg_performance": 72.5,
    "full_batches": 1,
    "available_batches": 2,
    "max_batch_level": 2
  }
}
```

---

### 3. Initialize Batches
**Endpoint:** `POST /api/coordinator/batch/initializeBatches`

**Description:** Create initial batches for a subject-section and automatically distribute students.

**Request Body:**
```json
{
  "sectionId": 1,
  "subjectId": 2,
  "numberOfBatches": 3,
  "maxStudentsPerBatch": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully initialized 3 batches",
  "batchesCreated": 3,
  "studentsAssigned": 75
}
```

**Business Logic:**
- Creates specified number of batches
- Automatically distributes students evenly across batches
- Updates student counts for each batch
- Fails if batches already exist

---

### 4. Reallocate Batches
**Endpoint:** `POST /api/coordinator/batch/reallocateBatches`

**Description:** Redistribute students across batches based on performance.

**Request Body:**
```json
{
  "sectionId": 1,
  "subjectId": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch reallocation completed successfully",
  "studentsReallocated": 75,
  "batchesUpdated": 3
}
```

**Algorithm:**
- Sorts students by performance and topics completed
- Distributes high performers to first batches
- Updates batch statistics (average performance, student counts)

---

### 5. Update Batch Size
**Endpoint:** `POST /api/coordinator/batch/updateBatchSize`

**Description:** Change the maximum capacity of a batch.

**Request Body:**
```json
{
  "batchId": 1,
  "newMaxSize": 35
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Batch size updated successfully"
}
```

**Response (Overflow):**
```json
{
  "success": false,
  "message": "Cannot reduce size below current student count (30)",
  "requiresReallocation": true,
  "currentCount": 30,
  "overflow": 5
}
```

---

### 6. Get Batch Details
**Endpoint:** `POST /api/coordinator/batch/getBatchDetails`

**Description:** Get detailed information about a specific batch including all students.

**Request Body:**
```json
{
  "batchId": 1
}
```

**Response:**
```json
{
  "success": true,
  "batchInfo": {
    "id": 1,
    "batch_name": "Batch 1",
    "batch_level": 1,
    "max_students": 30,
    "current_students_count": 25,
    "avg_performance_score": 75.50,
    "active_topics": 5
  },
  "students": [
    {
      "id": 101,
      "student_roll": "ROLL001",
      "student_name": "John Doe",
      "current_performance": 80.5,
      "last_activity": "2025-11-10T10:30:00.000Z",
      "topics_completed": 10,
      "pending_homework": 2,
      "penalty_count": 0
    }
  ]
}
```

---

### 7. Move Student Between Batches
**Endpoint:** `POST /api/coordinator/batch/moveStudentBatch`

**Description:** Move a single student from one batch to another.

**Request Body:**
```json
{
  "studentRoll": "ROLL001",
  "fromBatchId": 1,
  "toBatchId": 2,
  "subjectId": 2,
  "reason": "Manual_Transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student moved successfully"
}
```

---

### 8. Get Batch Students
**Endpoint:** `POST /api/coordinator/batch/getBatchStudents`

**Description:** Get all students in a batch (used for overflow resolution).

**Request Body:**
```json
{
  "batchId": 1
}
```

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "id": 101,
      "roll": "ROLL001",
      "name": "John Doe",
      "current_performance": 80.5,
      "topics_completed": 10
    }
  ]
}
```

---

### 9. Move Multiple Students
**Endpoint:** `POST /api/coordinator/batch/moveMultipleStudents`

**Description:** Move multiple students from one batch to another (bulk operation).

**Request Body:**
```json
{
  "studentRolls": ["ROLL001", "ROLL002", "ROLL003"],
  "fromBatchId": 1,
  "toBatchId": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully moved 3 students",
  "movedCount": 3
}
```

---

## Topic Hierarchy

### 1. Get Topic Hierarchy
**Endpoint:** `POST /api/coordinator/topic/getTopicHierarchy`

**Description:** Get complete hierarchical topic structure for a context activity.

**Request Body:**
```json
{
  "sectionId": 1,
  "subjectId": 2,
  "contextActivityId": 5
}
```

**Response:**
```json
{
  "success": true,
  "topics": [
    {
      "id": 1,
      "parent_id": null,
      "context_activity_id": 5,
      "level": 1,
      "topic_name": "Introduction",
      "topic_code": "INTRO-01",
      "order_sequence": 1,
      "has_assessment": 1,
      "has_homework": 1,
      "is_bottom_level": 0,
      "expected_completion_days": 7,
      "pass_percentage": 60.00,
      "children": [
        {
          "id": 2,
          "parent_id": 1,
          "level": 2,
          "topic_name": "Basic Concepts",
          "children": []
        }
      ]
    }
  ],
  "flatTopics": []
}
```

---

### 2. Create Topic
**Endpoint:** `POST /api/coordinator/topic/createTopic`

**Description:** Create a new topic in the hierarchy.

**Request Body:**
```json
{
  "contextActivityId": 5,
  "parentId": null,
  "topicName": "Introduction to Algebra",
  "topicCode": "ALG-INTRO-01",
  "level": 1,
  "orderSequence": 1,
  "hasAssessment": true,
  "hasHomework": true,
  "isBottomLevel": false,
  "expectedCompletionDays": 7,
  "passPercentage": 60
}
```

**Response:**
```json
{
  "success": true,
  "message": "Topic created successfully",
  "topicId": 123
}
```

---

### 3. Update Topic
**Endpoint:** `POST /api/coordinator/topic/updateTopic`

**Description:** Update topic information.

**Request Body:**
```json
{
  "topicId": 123,
  "topicName": "Advanced Introduction to Algebra",
  "orderSequence": 2,
  "hasAssessment": true,
  "expectedCompletionDays": 10,
  "passPercentage": 65
}
```

**Response:**
```json
{
  "success": true,
  "message": "Topic updated successfully"
}
```

---

### 4. Delete Topic
**Endpoint:** `POST /api/coordinator/topic/deleteTopic`

**Description:** Delete a topic and all associated materials.

**Request Body:**
```json
{
  "topicId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Topic deleted successfully"
}
```

**Constraints:**
- Cannot delete topics with child topics
- Automatically deletes associated materials and completion dates

---

### 5. Get Activities for Subject
**Endpoint:** `POST /api/coordinator/topic/getActivitiesForSubject`

**Description:** Get all activities for a subject in a section.

**Request Body:**
```json
{
  "sectionId": 1,
  "subjectId": 2
}
```

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "context_activity_id": 5,
      "activity_id": 10,
      "activity_name": "Lecture"
    }
  ]
}
```

---

### 6. Get Sub-Activities
**Endpoint:** `POST /api/coordinator/topic/getSubActivitiesForActivity`

**Description:** Get sub-activities for a parent activity.

**Request Body:**
```json
{
  "sectionId": 1,
  "subjectId": 2,
  "contextActivityId": 5
}
```

**Response:**
```json
{
  "success": true,
  "subActivities": [
    {
      "context_activity_id": 6,
      "activity_id": 11,
      "activity_name": "Lab Work"
    }
  ]
}
```

---

## Material Management

### 1. Get Topic Materials
**Endpoint:** `POST /api/coordinator/material/getTopicMaterials`

**Description:** Get all materials for a topic.

**Request Body:**
```json
{
  "topicId": 123
}
```

**Response:**
```json
{
  "success": true,
  "materials": [
    {
      "id": 1,
      "topic_id": 123,
      "material_type": "Video",
      "file_name": "Introduction Video",
      "file_url": "https://example.com/video.mp4",
      "estimated_duration": 30,
      "difficulty_level": "Medium",
      "instructions": "Watch carefully",
      "is_active": 1,
      "has_assessment": 1
    }
  ]
}
```

---

### 2. Add Topic Material
**Endpoint:** `POST /api/coordinator/material/addTopicMaterial`

**Description:** Add a new material (file URL only, no file upload).

**Request Body:**
```json
{
  "topicId": 123,
  "materialType": "Video",
  "fileName": "Algebra Basics",
  "fileUrl": "https://youtube.com/watch?v=example",
  "estimatedDuration": 45,
  "difficultyLevel": "Easy",
  "instructions": "Take notes while watching",
  "hasAssessment": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material added successfully",
  "materialId": 456
}
```

**Supported Material Types:**
- PDF
- Video
- Image
- Text

**Difficulty Levels:**
- Easy
- Medium
- Hard

---

### 3. Update Topic Material
**Endpoint:** `POST /api/coordinator/material/updateTopicMaterial`

**Description:** Update material information.

**Request Body:**
```json
{
  "materialId": 456,
  "fileName": "Updated Video Title",
  "fileUrl": "https://youtube.com/watch?v=newurl",
  "estimatedDuration": 60,
  "difficultyLevel": "Medium",
  "hasAssessment": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material updated successfully"
}
```

---

### 4. Delete Topic Material
**Endpoint:** `POST /api/coordinator/material/deleteTopicMaterial`

**Description:** Soft delete a material (sets is_active = 0).

**Request Body:**
```json
{
  "materialId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

### 5. Set Expected Completion Date
**Endpoint:** `POST /api/coordinator/material/setExpectedCompletionDate`

**Description:** Set expected completion date for a topic-batch combination.

**Request Body:**
```json
{
  "topicId": 123,
  "batchId": 1,
  "expectedDate": "2025-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expected completion date set successfully"
}
```

---

## Excel Bulk Upload

### 1. Download Batch Template
**Endpoint:** `GET /api/coordinator/batch/generate-batch-template`

**Description:** Download Excel template for batch bulk upload.

**Response:** Excel file download

**Template Columns:**
- Section ID
- Subject ID
- Batch Name
- Batch Level
- Max Students
- Student Rolls (comma-separated)

---

### 2. Upload Batches from Excel
**Endpoint:** `POST /api/coordinator/batch/upload-batches`

**Description:** Bulk create batches from Excel file.

**Request:**
- Content-Type: multipart/form-data
- Field: `file` (Excel file)

**Response:**
```json
{
  "success": true,
  "message": "Batches uploaded successfully",
  "batchesCreated": 5,
  "studentsAssigned": 120,
  "errors": []
}
```

**Excel Format:**
```
| Section ID | Subject ID | Batch Name | Batch Level | Max Students | Student Rolls |
|------------|------------|------------|-------------|--------------|---------------|
| 1          | 2          | Batch 1    | 1           | 30           | ROLL001,ROLL002,ROLL003 |
```

---

### 3. Download Materials Template
**Endpoint:** `GET /api/coordinator/material/generate-materials-template`

**Description:** Download Excel template for materials bulk upload.

**Response:** Excel file download

**Template Columns:**
- Topic ID
- Material Type (PDF/Video/Image/Text)
- File Name
- File URL
- Estimated Duration (minutes)
- Difficulty Level (Easy/Medium/Hard)
- Instructions
- Has Assessment (Yes/No)

---

### 4. Upload Materials from Excel
**Endpoint:** `POST /api/coordinator/material/upload-materials`

**Description:** Bulk add materials from Excel file.

**Request:**
- Content-Type: multipart/form-data
- Field: `file` (Excel file)

**Response:**
```json
{
  "success": true,
  "message": "Materials uploaded successfully",
  "materialsCreated": 50,
  "errors": []
}
```

---

## Database Schema

### Required Tables

#### 1. student_batch_assignments
```sql
CREATE TABLE `student_batch_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `batch_id` int NOT NULL,
  `current_performance` decimal(5,2) DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_batch` (`student_id`, `batch_id`)
);
```

### Existing Tables Used

- **section_batches**: Stores batch information
- **topic_hierarchy**: Stores topic tree structure
- **topic_materials**: Stores material URLs and metadata
- **topic_completion_dates**: Stores expected completion dates per batch
- **context_activities**: Links subjects, sections, and activities
- **students**: Student information
- **student_topic_completion**: Tracks completed topics
- **student_homework_calendar**: Tracks homework assignments

---

## Authentication

All endpoints require authentication via JWT token in header:
```
Authorization: Bearer <token>
```

The user ID is extracted from the token via `req.user.id`.

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 400: Bad request (missing parameters)
- 401: Unauthorized (invalid token)
- 404: Resource not found
- 500: Server error

---

## Installation Requirements

Add to `package.json`:
```json
{
  "dependencies": {
    "exceljs": "^4.3.0"
  }
}
```

Run:
```bash
npm install exceljs
```

---

## Frontend Integration Examples

### 1. Fetch Batches
```javascript
const response = await apiFetch('/coordinator/batch/getBatches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    sectionId: selectedSection, 
    subjectId: selectedSubject 
  })
});

if (response.success) {
  setBatchData(response.batches);
}
```

### 2. Upload Excel File
```javascript
const formData = new FormData();
formData.append('file', fileObject);

const response = await apiFetch('/coordinator/batch/upload-batches', {
  method: 'POST',
  body: formData // Don't set Content-Type header
});
```

### 3. Move Student
```javascript
const response = await apiFetch('/coordinator/batch/moveStudentBatch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentRoll: 'ROLL001',
    fromBatchId: 1,
    toBatchId: 2,
    subjectId: selectedSubject,
    reason: 'Manual_Transfer'
  })
});
```

---

## Notes

1. **File URLs Only**: Materials system uses URLs only, no file uploads to backend
2. **Soft Deletes**: Materials are soft-deleted (is_active = 0)
3. **Hard Deletes**: Topics and batches are hard-deleted
4. **Performance Tracking**: Automatically calculates batch averages
5. **Transaction Safety**: Bulk operations use transactions for data integrity
6. **Excel Validation**: Validates all required fields before inserting
7. **Capacity Management**: Prevents batch overflow with validation

---

## Support

For issues or questions, contact the backend development team.
