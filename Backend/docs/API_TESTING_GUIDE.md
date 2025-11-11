# Quick API Testing Guide

Use these commands to quickly test all Material Management endpoints.

## Prerequisites

1. Get your JWT token by logging in
2. Replace `YOUR_TOKEN` with your actual token
3. Replace `localhost:3000` with your backend URL if different
4. Update IDs (sectionId, subjectId, etc.) based on your database

---

## 1. Batch Management Tests

### Test 1: Initialize Batches
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/initializeBatches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "subjectId": 1,
    "numberOfBatches": 3,
    "maxStudentsPerBatch": 30
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully initialized 3 batches",
  "batchesCreated": 3,
  "studentsAssigned": 75
}
```

---

### Test 2: Get All Batches
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/getBatches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "subjectId": 1
  }'
```

---

### Test 3: Get Batch Analytics
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/getBatchAnalytics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "subjectId": 1
  }'
```

---

### Test 4: Get Batch Details
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/getBatchDetails \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": 1
  }'
```

---

### Test 5: Update Batch Size
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/updateBatchSize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": 1,
    "newMaxSize": 35
  }'
```

---

### Test 6: Move Student Between Batches
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/moveStudentBatch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentRoll": "ROLL001",
    "fromBatchId": 1,
    "toBatchId": 2,
    "subjectId": 1,
    "reason": "Performance_Based"
  }'
```

---

### Test 7: Get Batch Students (for overflow)
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/getBatchStudents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": 1
  }'
```

---

### Test 8: Move Multiple Students
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/moveMultipleStudents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentRolls": ["ROLL001", "ROLL002", "ROLL003"],
    "fromBatchId": 1,
    "toBatchId": 2
  }'
```

---

### Test 9: Reallocate Batches
```bash
curl -X POST http://localhost:3000/api/coordinator/batch/reallocateBatches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "subjectId": 1
  }'
```

---

## 2. Topic Hierarchy Tests

### Test 1: Get Activities for Subject
```bash
curl -X POST http://localhost:3000/api/coordinator/topic/getActivitiesForSubject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "subjectId": 1
  }'
```

---

### Test 2: Get Topic Hierarchy
```bash
curl -X POST http://localhost:3000/api/coordinator/topic/getTopicHierarchy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "subjectId": 1,
    "contextActivityId": 1
  }'
```

---

### Test 3: Create Root Topic
```bash
curl -X POST http://localhost:3000/api/coordinator/topic/createTopic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contextActivityId": 1,
    "parentId": null,
    "topicName": "Introduction to Mathematics",
    "topicCode": "MATH-INTRO-01",
    "level": 1,
    "orderSequence": 1,
    "hasAssessment": true,
    "hasHomework": true,
    "isBottomLevel": false,
    "expectedCompletionDays": 7,
    "passPercentage": 60
  }'
```

---

### Test 4: Create Child Topic
```bash
curl -X POST http://localhost:3000/api/coordinator/topic/createTopic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contextActivityId": 1,
    "parentId": 1,
    "topicName": "Basic Algebra Concepts",
    "topicCode": "MATH-ALGEBRA-01",
    "orderSequence": 1,
    "hasAssessment": true,
    "hasHomework": false,
    "isBottomLevel": true,
    "expectedCompletionDays": 5,
    "passPercentage": 65
  }'
```

---

### Test 5: Update Topic
```bash
curl -X POST http://localhost:3000/api/coordinator/topic/updateTopic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "topicName": "Updated Introduction to Mathematics",
    "orderSequence": 2,
    "expectedCompletionDays": 10,
    "passPercentage": 70
  }'
```

---

### Test 6: Delete Topic
```bash
curl -X POST http://localhost:3000/api/coordinator/topic/deleteTopic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 2
  }'
```

---

## 3. Material Management Tests

### Test 1: Add Video Material
```bash
curl -X POST http://localhost:3000/api/coordinator/material/addTopicMaterial \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "materialType": "Video",
    "fileName": "Introduction Video",
    "fileUrl": "https://www.youtube.com/watch?v=example",
    "estimatedDuration": 30,
    "difficultyLevel": "Easy",
    "instructions": "Watch the video and take notes on key concepts",
    "hasAssessment": true
  }'
```

---

### Test 2: Add PDF Material
```bash
curl -X POST http://localhost:3000/api/coordinator/material/addTopicMaterial \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "materialType": "PDF",
    "fileName": "Algebra Textbook Chapter 1",
    "fileUrl": "https://drive.google.com/file/d/example/view",
    "estimatedDuration": 60,
    "difficultyLevel": "Medium",
    "instructions": "Read pages 1-20 and complete exercises",
    "hasAssessment": false
  }'
```

---

### Test 3: Get Topic Materials
```bash
curl -X POST http://localhost:3000/api/coordinator/material/getTopicMaterials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1
  }'
```

---

### Test 4: Update Material
```bash
curl -X POST http://localhost:3000/api/coordinator/material/updateTopicMaterial \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "materialId": 1,
    "fileName": "Updated Video Title",
    "estimatedDuration": 45,
    "difficultyLevel": "Hard",
    "hasAssessment": true
  }'
```

---

### Test 5: Delete Material
```bash
curl -X POST http://localhost:3000/api/coordinator/material/deleteTopicMaterial \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "materialId": 1
  }'
```

---

### Test 6: Set Expected Completion Date
```bash
curl -X POST http://localhost:3000/api/coordinator/material/setExpectedCompletionDate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "batchId": 1,
    "expectedDate": "2025-12-31"
  }'
```

---

## 4. Excel Upload Tests

### Test 1: Download Batch Template
```bash
curl -X GET http://localhost:3000/api/coordinator/batch/generate-batch-template \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o batch_template.xlsx
```

---

### Test 2: Download Materials Template
```bash
curl -X GET http://localhost:3000/api/coordinator/material/generate-materials-template \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o materials_template.xlsx
```

---

### Test 3: Upload Batches from Excel
```bash
# First, create a file batch_data.xlsx with the correct format
curl -X POST http://localhost:3000/api/coordinator/batch/upload-batches \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@batch_data.xlsx"
```

---

### Test 4: Upload Materials from Excel
```bash
# First, create a file materials_data.xlsx with the correct format
curl -X POST http://localhost:3000/api/coordinator/material/upload-materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@materials_data.xlsx"
```

---

## 5. Utility Tests

### Test 1: Get Grade Subjects
```bash
curl -X POST http://localhost:3000/api/coordinator/getGradeSubject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gradeId": 1
  }'
```

---

## PowerShell Testing (Windows)

For Windows PowerShell, use `Invoke-RestMethod`:

### Example: Initialize Batches
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    sectionId = 1
    subjectId = 1
    numberOfBatches = 3
    maxStudentsPerBatch = 30
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/coordinator/batch/initializeBatches" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

---

## Postman Collection Import

Create a file `material_management.postman_collection.json`:

```json
{
  "info": {
    "name": "Material Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Batch Management",
      "item": [
        {
          "name": "Initialize Batches",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"sectionId\": 1,\n  \"subjectId\": 1,\n  \"numberOfBatches\": 3,\n  \"maxStudentsPerBatch\": 30\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/coordinator/batch/initializeBatches",
              "host": ["{{baseUrl}}"],
              "path": ["api", "coordinator", "batch", "initializeBatches"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    }
  ]
}
```

---

## Common Response Patterns

### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Validation Error:
```json
{
  "success": false,
  "message": "Section ID and Subject ID are required"
}
```

---

## Testing Workflow

### Complete Batch Management Workflow:
1. **Initialize Batches** → Creates batches and distributes students
2. **Get Batches** → View all batches with statistics
3. **Get Batch Analytics** → View overall analytics
4. **Get Batch Details** → View specific batch with students
5. **Update Batch Size** → Resize batch (may show overflow)
6. **Get Batch Students** → Get students for overflow resolution
7. **Move Multiple Students** → Resolve overflow
8. **Reallocate Batches** → Redistribute based on performance

### Complete Topic Management Workflow:
1. **Get Activities** → Get available activities
2. **Create Root Topic** → Create top-level topic
3. **Create Child Topics** → Add sub-topics
4. **Get Topic Hierarchy** → View complete tree
5. **Add Materials** → Add videos, PDFs, etc.
6. **Set Expected Dates** → Set completion dates per batch

---

## Troubleshooting

### Issue: 401 Unauthorized
**Fix:** Check your token is valid and not expired

### Issue: 400 Bad Request
**Fix:** Verify all required fields are in the request body

### Issue: 500 Internal Server Error
**Fix:** Check backend logs for detailed error message

### Issue: Empty Response
**Fix:** Verify database has data (run initialization first)

---

## Quick Database Check

Before testing, verify your database:

```sql
-- Check if tables exist
SHOW TABLES LIKE 'section_batches';
SHOW TABLES LIKE 'student_batch_assignments';
SHOW TABLES LIKE 'topic_hierarchy';
SHOW TABLES LIKE 'topic_materials';

-- Check if you have test data
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM sections;
SELECT COUNT(*) FROM subjects;
SELECT COUNT(*) FROM subject_section_assignments WHERE is_active = 1;
```

---

## Next Steps

1. ✅ Test each endpoint individually
2. ✅ Test complete workflows
3. ✅ Test error cases (missing params, invalid IDs)
4. ✅ Test Excel upload/download
5. ✅ Integrate with frontend

Happy Testing! 🚀
