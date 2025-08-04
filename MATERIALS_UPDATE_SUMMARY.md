# Material Management System Update - Activities Implementation

## Overview
Updated the material management system to organize materials under activities instead of directly under subjects. This provides better organization where subjects can have multiple activity types (Academic, Assessment, One Member Activity, etc.).

## Database Changes

### 1. Materials Table Update
- **File**: `Backend/add_title_to_materials.sql`
- **Changes**:
  - Added `title` column (VARCHAR(255), optional)
  - Added `section_subject_activity_id` column (INT, foreign key)
  - Added foreign key constraint to `section_subject_activities` table
  - Migration script to update existing records
  - Note: Old `grade_id` and `subject_id` columns can be removed after migration

## Backend Changes

### 1. Coordinator Controller Updates
- **File**: `Backend/src/controllers/coordinator/coordinatorController.js`

#### Modified Functions:
- **`getGradeSubject`**: 
  - Now returns subjects grouped with their activities
  - Includes `section_subject_activity_id` for each activity
  
- **`uploadStudyMaterial`**: 
  - Uses `section_subject_activity_id` instead of `grade_id` + `subject_id`
  - Added `title` field support
  
- **`getMaterials`**: 
  - Queries by `section_subject_activity_id`
  - Joins with related tables to get subject and activity info
  
- **`deleteLevel`**: 
  - Updated to use `section_subject_activity_id`
  
- **`updateExpectedDate`**: 
  - Updated to use `section_subject_activity_id`

## Frontend Changes

### 1. Material Home Page Updates
- **File**: `Frontend/src/pages/Coordinator/Material/MaterialHomePage/CoordinatorMaterialHome.jsx`
- **Changes**:
  - Updated `fetchGradeSubjects` to handle new grouped data structure
  - Modified navigation to go to `SubjectActivityPage` instead of directly to `SubjectPage`
  - Passes activities array to the next page

### 2. New Subject Activity Page
- **File**: `Frontend/src/pages/Coordinator/Material/SubjectActivity/SubjectActivityPage.jsx`
- **Purpose**: Shows activities under each subject
- **Features**:
  - Displays all activities for a selected subject
  - Navigates to `SubjectPage` with specific activity context
  - Uses existing styles from `SubjectPage`

### 3. Subject Page Updates
- **File**: `Frontend/src/pages/Coordinator/Material/Subject/SubjectPage.jsx`
- **Major Changes**:
  - Added `activity_name` and `section_subject_activity_id` parameters
  - Added `title` field in the form
  - Updated `fetchMaterials` to use `section_subject_activity_id`
  - Updated `handleSave` to send new parameters
  - Updated delete and edit functions to use new structure
  - Display title in materials list
  - Updated headers to show activity name

## Navigation Updates Required
- **File**: Navigation configuration needs to include new route
- **Required**: Add `SubjectActivityPage` route to navigation stack
- **Reference**: See `Frontend/navigation_setup_instructions.js`

## Migration Steps

### 1. Database Migration
```sql
-- Run the SQL script to update materials table
SOURCE Backend/add_title_to_materials.sql;
```

### 2. Verify Data Migration
- Check that existing materials are properly linked to section_subject_activities
- Ensure foreign key constraints are working

### 3. Update Navigation
- Add the new SubjectActivityPage route to your navigation stack
- Test navigation flow: MaterialHome → SubjectActivityPage → SubjectPage

### 4. Testing Checklist
- [ ] Subject listing shows correctly in MaterialHome
- [ ] Clicking subject shows activities
- [ ] Clicking activity opens SubjectPage with correct context
- [ ] Adding new materials works with title field
- [ ] Editing expected dates works
- [ ] Deleting materials and levels works
- [ ] Materials display includes title when available

## API Changes Summary

### Updated Endpoints:
1. **POST /api/coordinator/getGradeSubject**
   - Returns: Grouped subjects with activities and section_subject_activity_id

2. **POST /api/coordinator/uploadStudyMaterial**
   - New params: `section_subject_activity_id`, `title`
   - Removed: `grade_id`, `subject_id`

3. **GET /api/coordinator/getMaterials**
   - New param: `section_subject_activity_id`
   - Removed: `gradeID`, `subjectID`

4. **DELETE /api/coordinator/deleteLevel**
   - New param: `section_subject_activity_id`
   - Removed: `gradeID`, `subjectID`

5. **PUT /api/coordinator/updateExpectedDate**
   - New param: `section_subject_activity_id`
   - Removed: `grade_id`, `subject_id`

## Benefits of New Structure
1. **Better Organization**: Materials are organized by activity type within subjects
2. **Flexibility**: Can easily add new activity types
3. **Clearer Context**: Materials have clear activity context
4. **Scalability**: Structure supports future enhancements
5. **Data Integrity**: Uses proper foreign key relationships

## Notes
- This implementation is currently for coordinator only as requested
- The old grade_id and subject_id columns in materials table are kept temporarily for safety
- Title field is optional to maintain backward compatibility
- All existing functionality (delete, edit, view) has been preserved
