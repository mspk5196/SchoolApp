const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Assessment materials storage configuration
const assessmentMaterialsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/assessment_materials');
  },
  filename: (req, file, cb) => {
    const uniqueName = `assessment_${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for assessment materials
const fileFilter = (req, file, cb) => {
  // Allow PDF, DOC, DOCX, and image files
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.'), false);
  }
};

// Configure multer for assessment materials
const uploadAssessmentMaterial = multer({
  storage: assessmentMaterialsStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

module.exports = {
  uploadAssessmentMaterial
};
