/**
 * Middleware to clean URLs in API responses
 * Fixes the /https:// issue by removing leading slashes from Cloudinary URLs
 */

const cleanUrlsInResponse = (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;

  // Override the json method
  res.json = function(data) {
    // Clean URLs in the response data
    const cleanedData = cleanUrls(data);
    
    // Call the original json method with cleaned data
    return originalJson.call(this, cleanedData);
  };

  next();
};

// Recursive function to clean URLs in any object/array structure
const cleanUrls = (obj) => {
  if (typeof obj === 'string') {
    // Fix malformed URLs that start with /http or /https
    if (obj.startsWith('/http://') || obj.startsWith('/https://')) {
      return obj.substring(1);
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUrls(item));
  }
  
  if (obj && typeof obj === 'object') {
    const cleanedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cleanedObj[key] = cleanUrls(obj[key]);
      }
    }
    return cleanedObj;
  }
  
  return obj;
};

module.exports = cleanUrlsInResponse;
