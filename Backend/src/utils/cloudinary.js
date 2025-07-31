const { v2: cloudinary } = require('cloudinary');

// Load environment variables
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload files to Cloudinary
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      ...options, // ✅ Spread first
      resource_type: options.resource_type || 'auto' // ✅ Set default if missing
    };
    
    console.log('Final Upload Options to Cloudinary:', uploadOptions);

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        reject(error);
      } else {
        console.log('Cloudinary Upload Success - URL:', result.secure_url);
        resolve(result);
      }
    }).end(buffer);
  });
};

// Upload profile photos
const uploadProfilePhoto = async (buffer, userId, userType) => {
  const options = {
    folder: `profile_photos/${userType}`,
    public_id: `${userType}_${userId}_${Date.now()}`,
    resource_type: 'image',
    transformation: [
      { width: 500, height: 500, crop: 'fill' },
      { quality: 'auto' }
    ]
  };
  return uploadToCloudinary(buffer, options);
};

// Upload documents (PDFs, DOCs, etc.)

const uploadDocument = async (buffer, originalName, folder = "documents") => {
  const options = {
    folder,
    public_id: `${Date.now()}_${originalName.split(".")[0]}`,
    resource_type: "raw", // ✅ Needed for PDF/DOCX/XLSX/MP3
  };

  return uploadToCloudinary(buffer, options);
};

// Upload study materials
const uploadStudyMaterial = async (buffer, originalName, gradeId, subjectId) => {
  const ext = originalName.split('.').pop().toLowerCase();
  
  console.log('Upload Study Material Debug:');
  console.log('Original Name:', originalName);
  console.log('Extension:', ext);

  // Force raw for all document types including PDF
  const resourceType = ['pdf', 'docx', 'xlsx', 'xls', 'zip', 'doc', 'ppt', 'pptx', 'txt'].includes(ext) ? 'raw' : 'auto';
  
  console.log('Resource Type:', resourceType);

  const options = {
    folder: `study_materials/grade_${gradeId}/subject_${subjectId}`,
    public_id: `${Date.now()}_${originalName.split('.')[0]}`,
    resource_type: resourceType,
  };
  
  console.log('Upload Options:', options);

  return uploadToCloudinary(buffer, options);
};

// Upload event banners
const uploadEventBanner = async (buffer, eventName) => {
  const options = {
    folder: 'event_banners',
    public_id: `event_${Date.now()}_${eventName.replace(/\s+/g, '_')}`,
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 600, crop: 'fill' },
      { quality: 'auto' }
    ]
  };
  return uploadToCloudinary(buffer, options);
};

// Upload message attachments
const uploadMessageAttachment = async (buffer, originalName, messageId) => {
  const options = {
    folder: 'message_attachments',
    public_id: `msg_${messageId}_${Date.now()}_${originalName.split('.')[0]}`,
    resource_type: 'auto'
  };
  return uploadToCloudinary(buffer, options);
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadProfilePhoto,
  uploadDocument,
  uploadStudyMaterial,
  uploadEventBanner,
  uploadMessageAttachment,
  deleteFromCloudinary
};