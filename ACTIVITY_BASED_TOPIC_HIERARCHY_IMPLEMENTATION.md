# Activity-Based Topic Hierarchy Implementation

## Overview
Enhanced the topic hierarchy system to support activity-specific topic organization. Now each activity type (Academic, Assessment, Member Activity, ECA, etc.) can have its own separate topic hierarchy within a subject.

## Changes Made

### 1. Database Schema Updates

#### File: `Backend/add_activity_to_topic_hierarchy.sql`
- **Added column**: `section_subject_activity_id` to `topic_hierarchy` table
- **Foreign key**: Links to `section_subject_activities` table
- **Migration script**: Updates existing records to link with 'Academic' activity type
- **Index**: Added for performance optimization

### 2. Frontend Changes

#### File: `Frontend/src/pages/Coordinator/Material/TopicHierarchy/TopicHierarchyManagement.jsx`

**New State Variables:**
- `activities`: Stores available activity types for selected subject
- `selectedActivity`: Currently selected activity ID
- `sections`: Available sections for the grade
- `selectedSection`: Currently selected section ID

**New Functions:**
- `fetchSections()`: Fetches sections for the active grade
- `fetchActivitiesForSubject()`: Gets activity types for selected subject and section
- `fetchTopicHierarchy()`: Updated to use activity ID instead of subject ID

**UI Enhancements:**
- **Section Selector**: Dropdown to select section
- **Subject Selector**: Dropdown to select subject (existing)
- **Activity Selector**: Dropdown to select activity type
- **Hierarchical Flow**: Section → Subject → Activity → Topics

**Updated API Calls:**
- Topic creation now uses `sectionSubjectActivityId` instead of `subjectId`
- Topic fetching uses new activity-based endpoint

### 3. Backend API Updates

#### File: `Backend/src/routes/coordinator.js`
- **New Route**: `GET /topics/hierarchy/activity/:activityId`

#### File: `Backend/src/controllers/coordinator/topicHierarchyController.js`

**New Function: `getTopicHierarchyByActivity`**
- Fetches topic hierarchy for specific activity
- Returns activity details along with hierarchy
- Builds nested tree structure for topics

**Updated Function: `createTopic`**
- **Dual Support**: Handles both new activity-based and legacy subject-based creation
- **Activity-based**: Uses `sectionSubjectActivityId` parameter
- **Legacy**: Maintains backward compatibility with `subjectId` parameter
- **Validation**: Ensures either activity ID or subject ID is provided

### 4. Updated Material Home Navigation

#### File: `Frontend/src/pages/Coordinator/Material/MaterialHomePage/CoordinatorMaterialHome.jsx`
- Updated button text from "📚 Topics" to "📚 Topic Hierarchy"
- Maintains existing navigation parameters

## Data Flow

### Old Flow (Subject-based):
```
Grade → Subject → Topics
```

### New Flow (Activity-based):
```
Grade → Section → Subject → Activity → Topics
```

## Activity Types Supported

Based on your system, each subject can have multiple activity types:

1. **Academic** 📚
   - Regular classroom learning activities
   - Topic-based material organization
   - Can have assessments or not

2. **Assessment** 📝
   - Evaluation-focused activities
   - Performance measurement topics
   - Assessment-mandatory topics

3. **Member Activity** 👥
   - Group-based activities
   - Collaborative learning topics
   - Variable assessment requirements

4. **ECA (Extra Curricular Activities)** 🎨
   - Non-academic activities
   - Skill development topics
   - Flexible assessment structure

## Database Structure

### Before (Subject-based):
```sql
topic_hierarchy:
- id
- subject_id (FK to subjects)
- parent_id
- topic_name
- has_assessment
- ...
```

### After (Activity-based):
```sql
topic_hierarchy:
- id
- subject_id (FK to subjects) [legacy, kept for compatibility]
- section_subject_activity_id (FK to section_subject_activities) [NEW]
- parent_id
- topic_name
- has_assessment
- ...
```

## Benefits

1. **Granular Organization**: Each activity type can have completely different topic structures
2. **Flexible Assessment**: Different activities can have different assessment requirements
3. **Better Material Management**: Materials are organized by specific activity context
4. **Scalability**: Easy to add new activity types without affecting existing hierarchies
5. **Backward Compatibility**: Legacy subject-based hierarchies still supported
6. **Clear Context**: Topics have clear activity context for better understanding

## API Endpoints

### New Endpoints:
- `GET /api/topics/hierarchy/activity/:activityId` - Get topic hierarchy for specific activity

### Updated Endpoints:
- `POST /api/topics/create` - Now accepts `sectionSubjectActivityId` parameter
- `GET /api/coordinator/weekly-schedule/getSectionSubjectActivities` - Used to fetch activities for subject

### Existing Endpoints (Legacy Support):
- `GET /api/topics/hierarchy/:subjectId/:gradeId` - Still works for legacy subject-based hierarchies

## Migration Notes

1. **Database Migration**: Run `add_activity_to_topic_hierarchy.sql` to update schema
2. **Data Migration**: Existing topics will be linked to 'Academic' activity type
3. **Gradual Transition**: System supports both old and new approaches
4. **No Breaking Changes**: Existing functionality remains intact

## Future Enhancements

1. **Activity-specific Settings**: Different activities could have different topic validation rules
2. **Cross-activity Dependencies**: Topics from one activity could be prerequisites for another
3. **Activity Templates**: Pre-defined topic structures for common activity types
4. **Performance Analytics**: Track topic completion rates by activity type
5. **Customizable Activity Types**: Allow coordinators to create custom activity types

## Usage Instructions

### For Coordinators:

1. **Navigate to Material Management**
2. **Select Grade** from the grade tabs
3. **Choose Subject** from the subject cards
4. **Click "📚 Topic Hierarchy"**
5. **Select Section** from dropdown
6. **Select Subject** from dropdown (pre-selected)
7. **Choose Activity Type** from dropdown
8. **Manage Topics** for that specific activity

### Topic Creation:
- Topics are now created per activity, not per subject
- Each activity can have completely different topic structures
- Assessment requirements can vary by activity type
- Materials are organized under activity-specific topics

This implementation provides a robust foundation for activity-based topic management while maintaining backward compatibility and enabling future enhancements.
