import ApiService from '../ApiService';

/**
 * Material Management API Helper
 * All API calls for Batch Management, Topic Hierarchy, and Materials
 */

// ==================== BATCH MANAGEMENT ====================

export const getBatches = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/mentor/batch/getBatches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const getBatchAnalytics = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/mentor/batch/getBatchAnalytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const initializeBatches = async (sectionId, subjectId, numberOfBatches, maxStudentsPerBatch) => {
  const response = await ApiService.makeRequest('/mentor/batch/initializeBatches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId, numberOfBatches, maxStudentsPerBatch }),
  });
  return response.json();
};

export const reallocateBatches = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/mentor/batch/reallocateBatches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const updateBatchSize = async (batchId, newMaxSize) => {
  const response = await ApiService.makeRequest('/mentor/batch/updateBatchSize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId, newMaxSize }),
  });
  return response.json();
};

export const getBatchDetails = async (batchId) => {
  const response = await ApiService.makeRequest('/mentor/batch/getBatchDetails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId }),
  });
  return response.json();
};

export const moveStudentBatch = async (studentRoll, fromBatchId, toBatchId, subjectId, reason) => {
  const response = await ApiService.makeRequest('/mentor/batch/moveStudentBatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentRoll, fromBatchId, toBatchId, subjectId, reason }),
  });
  return response.json();
};

export const getBatchStudents = async (batchId) => {
  const response = await ApiService.makeRequest('/mentor/batch/getBatchStudents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId }),
  });
  return response.json();
};

export const moveMultipleStudents = async (studentRolls, fromBatchId, toBatchId) => {
  const response = await ApiService.makeRequest('/mentor/batch/moveMultipleStudents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentRolls, fromBatchId, toBatchId }),
  });
  return response.json();
};

export const assignStudentsToBatches = async (assignments) => {
  const response = await ApiService.makeRequest('/mentor/batch/assignStudents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignments }),
  });
  return response.json();
};

// Excel Upload/Download for Batches
export const downloadBatchTemplate = async () => {
  return await ApiService.downloadFile(
    '/mentor/batch/generate-batch-template',
    'batch_template.xlsx'
  );
};

export const uploadBatchesExcel = async (file) => {
  return await ApiService.uploadFile(
    '/mentor/batch/upload-batches',
    file,
    'file'
  );
};

// ==================== TOPIC HIERARCHY ====================

export const getTopicHierarchy = async (sectionId, subjectId, contextActivityId) => {
  const response = await ApiService.makeRequest('/mentor/topic/getTopicHierarchy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId, contextActivityId }),
  });
  return response.json();
};

export const createTopic = async (topicData) => {
  const response = await ApiService.makeRequest('/mentor/topic/createTopic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(topicData),
  });
  return response.json();
};

export const updateTopic = async (topicData) => {
  const response = await ApiService.makeRequest('/mentor/topic/updateTopic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(topicData),
  });
  return response.json();
};

export const deleteTopic = async (topicId) => {
  const response = await ApiService.makeRequest('/mentor/topic/deleteTopic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  });
  return response.json();
};

export const getActivitiesForSubject = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/mentor/topic/getActivitiesForSubject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const getSubActivitiesForActivity = async (sectionId, subjectId, contextActivityId) => {
  const response = await ApiService.makeRequest('/mentor/topic/getSubActivitiesForActivity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId, contextActivityId }),
  });
  return response.json();
};

// ==================== MATERIAL MANAGEMENT ====================

export const getTopicMaterials = async (topicId) => {
  const response = await ApiService.makeRequest('/mentor/material/getTopicMaterials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  });
  return response.json();
};

export const addTopicMaterial = async (materialData) => {
  const response = await ApiService.makeRequest('/mentor/material/addTopicMaterial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(materialData),
  });
  return response.json();
};

export const updateTopicMaterial = async (materialData) => {
  const response = await ApiService.makeRequest('/mentor/material/updateTopicMaterial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(materialData),
  });
  return response.json();
};

export const deleteTopicMaterial = async (materialId) => {
  const response = await ApiService.makeRequest('/mentor/material/deleteTopicMaterial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialId }),
  });
  return response.json();
};

export const setExpectedCompletionDate = async (topicId, batchId, expectedDate) => {
  const response = await ApiService.makeRequest('/mentor/material/setExpectedCompletionDate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId, batchId, expectedDate }),
  });
  return response.json();
};

// Fetch batch-wise expected completion dates for a topic
export const getBatchExpectedDates = async (topicId) => {
  const response = await ApiService.makeRequest('/mentor/material/getBatchExpectedDates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  });
  return response.json();
};

// Excel Upload/Download for Materials
// export const downloadMaterialsTemplate = async () => {
//   return await ApiService.downloadFile(
//     '/mentor/material/generate-materials-template',
//     'materials_template.xlsx'
//   );
// };

// export const uploadMaterialsExcel = async (file) => {
//   return await ApiService.uploadFile(
//     '/mentor/material/upload-materials',
//     file,
//     'file'
//   );
// };

// ==================== ACADEMIC YEAR BULK ====================

export const downloadAcademicYearTemplate = async (gradeId) => {
  const url = gradeId ? `/mentor/academic-year/generate-template?gradeId=${encodeURIComponent(gradeId)}` : '/mentor/academic-year/generate-template';
  return await ApiService.downloadFile(
    url,
    'topic_material_upload.xlsx'
  );
};

export const uploadAcademicYearExcel = async (file) => {
  return await ApiService.uploadFile(
    '/mentor/academic-year/upload',
    file,
    'file'
  );
};

// ==================== UTILITIES ====================

export const getSectionSubjects = async (sectionId) => {
  const response = await ApiService.makeRequest('/mentor/getSectionSubjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId }),
  });
  return response.json();
};
