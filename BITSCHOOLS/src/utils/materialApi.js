import ApiService from './ApiService';

/**
 * Material Management API Helper
 * All API calls for Batch Management, Topic Hierarchy, and Materials
 */

// ==================== BATCH MANAGEMENT ====================

export const getBatches = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/coordinator/batch/getBatches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const getBatchAnalytics = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/coordinator/batch/getBatchAnalytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const initializeBatches = async (sectionId, subjectId, numberOfBatches, maxStudentsPerBatch) => {
  const response = await ApiService.makeRequest('/coordinator/batch/initializeBatches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId, numberOfBatches, maxStudentsPerBatch }),
  });
  return response.json();
};

export const reallocateBatches = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/coordinator/batch/reallocateBatches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const updateBatchSize = async (batchId, newMaxSize) => {
  const response = await ApiService.makeRequest('/coordinator/batch/updateBatchSize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId, newMaxSize }),
  });
  return response.json();
};

export const getBatchDetails = async (batchId) => {
  const response = await ApiService.makeRequest('/coordinator/batch/getBatchDetails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId }),
  });
  return response.json();
};

export const moveStudentBatch = async (studentRoll, fromBatchId, toBatchId, subjectId, reason) => {
  const response = await ApiService.makeRequest('/coordinator/batch/moveStudentBatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentRoll, fromBatchId, toBatchId, subjectId, reason }),
  });
  return response.json();
};

export const getBatchStudents = async (batchId) => {
  const response = await ApiService.makeRequest('/coordinator/batch/getBatchStudents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId }),
  });
  return response.json();
};

export const moveMultipleStudents = async (studentRolls, fromBatchId, toBatchId) => {
  const response = await ApiService.makeRequest('/coordinator/batch/moveMultipleStudents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentRolls, fromBatchId, toBatchId }),
  });
  return response.json();
};

export const assignStudentsToBatches = async (assignments) => {
  const response = await ApiService.makeRequest('/coordinator/batch/assignStudents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignments }),
  });
  return response.json();
};

// Excel Upload/Download for Batches
export const downloadBatchTemplate = async () => {
  return await ApiService.downloadFile(
    '/coordinator/batch/generate-batch-template',
    'batch_template.xlsx'
  );
};

export const uploadBatchesExcel = async (file) => {
  return await ApiService.uploadFile(
    '/coordinator/batch/upload-batches',
    file,
    'file'
  );
};

// ==================== TOPIC HIERARCHY ====================

export const getTopicHierarchy = async (sectionId, subjectId, contextActivityId) => {
  const response = await ApiService.makeRequest('/coordinator/topic/getTopicHierarchy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId, contextActivityId }),
  });
  return response.json();
};

export const createTopic = async (topicData) => {
  const response = await ApiService.makeRequest('/coordinator/topic/createTopic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(topicData),
  });
  return response.json();
};

export const updateTopic = async (topicData) => {
  const response = await ApiService.makeRequest('/coordinator/topic/updateTopic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(topicData),
  });
  return response.json();
};

export const deleteTopic = async (topicId) => {
  const response = await ApiService.makeRequest('/coordinator/topic/deleteTopic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  });
  return response.json();
};

export const getActivitiesForSubject = async (sectionId, subjectId) => {
  const response = await ApiService.makeRequest('/coordinator/topic/getActivitiesForSubject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId }),
  });
  return response.json();
};

export const getSubActivitiesForActivity = async (sectionId, subjectId, contextActivityId) => {
  const response = await ApiService.makeRequest('/coordinator/topic/getSubActivitiesForActivity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, subjectId, contextActivityId }),
  });
  return response.json();
};

// ==================== MATERIAL MANAGEMENT ====================

export const getTopicMaterials = async (topicId) => {
  const response = await ApiService.makeRequest('/coordinator/material/getTopicMaterials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  });
  return response.json();
};

export const addTopicMaterial = async (materialData) => {
  const response = await ApiService.makeRequest('/coordinator/material/addTopicMaterial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(materialData),
  });
  return response.json();
};

export const updateTopicMaterial = async (materialData) => {
  const response = await ApiService.makeRequest('/coordinator/material/updateTopicMaterial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(materialData),
  });
  return response.json();
};

export const deleteTopicMaterial = async (materialId) => {
  const response = await ApiService.makeRequest('/coordinator/material/deleteTopicMaterial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialId }),
  });
  return response.json();
};

export const setExpectedCompletionDate = async (topicId, batchId, expectedDate) => {
  const response = await ApiService.makeRequest('/coordinator/material/setExpectedCompletionDate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId, batchId, expectedDate }),
  });
  return response.json();
};

// Fetch batch-wise expected completion dates for a topic
export const getBatchExpectedDates = async (topicId) => {
  const response = await ApiService.makeRequest('/coordinator/material/getBatchExpectedDates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId }),
  });
  return response.json();
};

// Excel Upload/Download for Materials
export const downloadMaterialsTemplate = async () => {
  return await ApiService.downloadFile(
    '/coordinator/material/generate-materials-template',
    'materials_template.xlsx'
  );
};

export const uploadMaterialsExcel = async (file) => {
  return await ApiService.uploadFile(
    '/coordinator/material/upload-materials',
    file,
    'file'
  );
};

// ==================== UTILITIES ====================

export const getGradeSubjects = async (gradeId) => {
  const response = await ApiService.makeRequest('/coordinator/getGradeSubject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gradeId }),
  });
  return response.json();
};
