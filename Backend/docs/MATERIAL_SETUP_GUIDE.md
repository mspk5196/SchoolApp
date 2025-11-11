# Material Management Setup Guide

## Quick Setup Steps

### 1. Run Database Migration

Execute the SQL migration to create the `student_batch_assignments` table:

```bash
# Connect to your MySQL database
mysql -u your_username -p your_database_name

# Run the migration file
source database/migrations/create_student_batch_assignments.sql
```

Or directly in MySQL:
```sql
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

CREATE INDEX `idx_performance` ON `student_batch_assignments` (`current_performance`);
CREATE INDEX `idx_last_activity` ON `student_batch_assignments` (`last_activity`);
```

### 2. Verify Dependencies

ExcelJS is already in your package.json. If you need to reinstall:

```bash
cd Backend
npm install
```

### 3. Routes Are Already Added

The routes have been added to `src/routes/coordinatorRoutes.js`:
- ✅ Batch management routes
- ✅ Topic hierarchy routes  
- ✅ Material management routes
- ✅ Excel upload routes

### 4. Test the Setup

#### Test Batch Initialization:
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/initializeBatches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "subjectId": 2,
    "numberOfBatches": 3,
    "maxStudentsPerBatch": 30
  }'
```

#### Test Topic Creation:
```bash
curl -X POST http://localhost:3000/api/coordinator/topic/createTopic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contextActivityId": 5,
    "topicName": "Introduction to Algebra",
    "topicCode": "ALG-01",
    "hasAssessment": true,
    "expectedCompletionDays": 7,
    "passPercentage": 60
  }'
```

#### Test Material Addition:
```bash
curl -X POST http://localhost:3000/api/coordinator/material/addTopicMaterial \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "materialType": "Video",
    "fileName": "Intro Video",
    "fileUrl": "https://youtube.com/watch?v=example",
    "estimatedDuration": 30,
    "difficultyLevel": "Easy"
  }'
```

### 5. Download Excel Templates

#### Batch Template:
```bash
curl -X GET http://localhost:3000/api/coordinator/batch/generate-batch-template \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o batch_template.xlsx
```

#### Materials Template:
```bash
curl -X GET http://localhost:3000/api/coordinator/material/generate-materials-template \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o materials_template.xlsx
```

---

## Frontend Integration

### Update API Service URLs

In your React Native app, update `ApiService.js` endpoints:

```javascript
// Batch Management
export const getBatches = (sectionId, subjectId) => 
  apiFetch('/coordinator/batch/getBatches', {
    method: 'POST',
    body: JSON.stringify({ sectionId, subjectId })
  });

export const initializeBatches = (sectionId, subjectId, numberOfBatches, maxStudentsPerBatch) =>
  apiFetch('/coordinator/batch/initializeBatches', {
    method: 'POST',
    body: JSON.stringify({ sectionId, subjectId, numberOfBatches, maxStudentsPerBatch })
  });

// Topic Hierarchy  
export const getTopicHierarchy = (sectionId, subjectId, contextActivityId) =>
  apiFetch('/coordinator/topic/getTopicHierarchy', {
    method: 'POST',
    body: JSON.stringify({ sectionId, subjectId, contextActivityId })
  });

export const createTopic = (topicData) =>
  apiFetch('/coordinator/topic/createTopic', {
    method: 'POST',
    body: JSON.stringify(topicData)
  });

// Materials
export const addTopicMaterial = (materialData) =>
  apiFetch('/coordinator/material/addTopicMaterial', {
    method: 'POST',
    body: JSON.stringify(materialData)
  });

// Excel Upload
export const uploadBatches = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiFetch('/coordinator/batch/upload-batches', {
    method: 'POST',
    body: formData
  });
};
```

---

## Complete Feature List

### ✅ Batch Management
- [x] Get all batches with statistics
- [x] Initialize batches with auto-distribution
- [x] Reallocate students based on performance
- [x] Update batch size with overflow detection
- [x] Move individual students
- [x] Move multiple students (bulk)
- [x] Get batch details with student list
- [x] Get batch analytics
- [x] Excel bulk upload for batches

### ✅ Topic Hierarchy
- [x] Get hierarchical topic tree
- [x] Create topics (any depth)
- [x] Update topics
- [x] Delete topics (with material cleanup)
- [x] Get activities for subject
- [x] Get sub-activities

### ✅ Material Management
- [x] Get materials for topic
- [x] Add material (URL only, no file upload)
- [x] Update material
- [x] Delete material (soft delete)
- [x] Set expected completion dates per batch
- [x] Excel bulk upload for materials

### ✅ Excel Templates
- [x] Batch template generator
- [x] Materials template generator
- [x] Validation on upload
- [x] Error reporting

---

## Key Changes from Original Request

### ✅ Materials: File URL Only (No Upload)
- Materials table uses `file_url` field
- No file upload endpoints (as requested)
- Supports external URLs (YouTube, Google Drive, etc.)

### ✅ Excel Upload for Both Batches and Materials
- Separate templates for batches and materials
- Bulk operations with transaction safety
- Error reporting per row

### ✅ Complete Batch Management
- All features from frontend implemented
- Performance-based reallocation
- Overflow resolution with student selection
- Batch analytics dashboard data

---

## Database Schema Verification

Verify these tables exist:

```sql
-- Check required tables
SHOW TABLES LIKE 'section_batches';
SHOW TABLES LIKE 'student_batch_assignments';
SHOW TABLES LIKE 'topic_hierarchy';
SHOW TABLES LIKE 'topic_materials';
SHOW TABLES LIKE 'topic_completion_dates';
SHOW TABLES LIKE 'context_activities';

-- Check student_batch_assignments structure
DESCRIBE student_batch_assignments;
```

---

## Troubleshooting

### Issue: "Table doesn't exist" error
**Solution:** Run the migration SQL file

### Issue: "ExcelJS not found"
**Solution:** Run `npm install` in Backend directory

### Issue: "Cannot move student - batch full"
**Solution:** Use `updateBatchSize` to increase capacity first

### Issue: "Cannot delete topic - has children"
**Solution:** Delete child topics first, or remove parent relationship

---

## Next Steps

1. ✅ Run database migration
2. ✅ Restart backend server
3. ✅ Test batch initialization
4. ✅ Test topic creation
5. ✅ Test material addition
6. ✅ Download and test Excel templates
7. ✅ Integrate with frontend
8. ✅ Test end-to-end workflow

---

## API Documentation

Full API documentation: `docs/MATERIAL_MANAGEMENT_API.md`

---

## Support

Backend is now complete for:
- ✅ Batch Management (all features)
- ✅ Topic Hierarchy (unlimited depth)
- ✅ Material Management (URL-based)
- ✅ Excel Bulk Upload (batches + materials)

All endpoints match the frontend requirements!
