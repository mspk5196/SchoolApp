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
      resource_type: options.resource_type || 'raw' // ✅ Default to 'raw' instead of 'auto'
    };

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error);
      else resolve(result);
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
  // For raw files, include extension in public_id
  const fileNameWithoutExt = originalName.split(".")[0];
  const ext = originalName.split(".").pop().toLowerCase();
  
  const options = {
    folder,
    public_id: `${Date.now()}_${fileNameWithoutExt}.${ext}`, // Include extension in public_id for raw files
    resource_type: "raw", // ✅ Needed for PDF/DOCX/XLSX/MP3
  };

  return uploadToCloudinary(buffer, options);
};

// Upload study materials
const uploadStudyMaterial = async (buffer, originalName, gradeId, subjectId) => {
  const ext = originalName.split('.').pop().toLowerCase();
  
  // Get filename without extension
  const fileNameWithoutExt = originalName.split(".")[0];

  // Determine resource type based on file extension
  let resourceType = 'raw'; // Default for documents/PDFs
  let publicId;
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    resourceType = 'image';
    publicId = `${Date.now()}_${fileNameWithoutExt}`; // No extension for images
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    resourceType = 'video';
    publicId = `${Date.now()}_${fileNameWithoutExt}`; // No extension for videos
  } else if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
    resourceType = 'video'; // Audio files use 'video' resource type in Cloudinary
    publicId = `${Date.now()}_${fileNameWithoutExt}`; // No extension for audio
  } else {
    // For raw files (PDFs, DOCs, etc.), include the extension in public_id
    publicId = `${Date.now()}_${fileNameWithoutExt}.${ext}`;
  }

  const options = {
    folder: `study_materials/grade_${gradeId}/subject_${subjectId}`,
    public_id: publicId,
    resource_type: resourceType,
  };

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
  // Get filename without extension
  const fileNameWithoutExt = originalName.split(".")[0];
  const extension = originalName.split('.').pop().toLowerCase();
  
  // Determine resource type based on file extension
  let resourceType = 'raw'; // Default for documents
  let publicId;
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    resourceType = 'image';
    publicId = `msg_${messageId}_${Date.now()}_${fileNameWithoutExt}`; // No extension for images
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
    resourceType = 'video';
    publicId = `msg_${messageId}_${Date.now()}_${fileNameWithoutExt}`; // No extension for videos
  } else {
    // For raw files (PDFs, DOCs, etc.), include extension in public_id
    publicId = `msg_${messageId}_${Date.now()}_${fileNameWithoutExt}.${extension}`;
  }
  
  const options = {
    folder: 'message_attachments',
    public_id: publicId,
    resource_type: resourceType
  };
  return uploadToCloudinary(buffer, options);
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = null) => {
  // If resource type is specified, use it directly
  if (resourceType && resourceType !== 'auto') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // If no resource type specified or 'auto', try different types
  const resourceTypes = ['image', 'video', 'raw'];
  
  for (const type of resourceTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: type
      });
      
      // If deletion was successful (result indicates success)
      if (result.result === 'ok' || result.result === 'not found') {
        return result;
      }
    } catch (error) {
      // Continue to next resource type if this one fails
      console.log(`Failed to delete with resource_type '${type}', trying next...`);
    }
  }
  
  // If all attempts failed, throw an error
  throw new Error(`Failed to delete file with publicId: ${publicId} - tried all resource types`);
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