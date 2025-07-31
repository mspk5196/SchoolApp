/**
 * Global URL cleaner utility to fix common URL issues
 * Specifically fixes the /https:// problem caused by incorrect concatenation
 */

export const cleanImageUrl = (url) => {
  if (!url) return null;
  
  let cleanUrl = url.toString().trim();
  
  // Fix the most common issue: /https:// or /http://
  if (cleanUrl.startsWith('/http://') || cleanUrl.startsWith('/https://')) {
    cleanUrl = cleanUrl.substring(1);
  }
  
  // Remove any double slashes (except after protocol)
  cleanUrl = cleanUrl.replace(/([^:]\/)\/+/g, '$1');
  
  return cleanUrl;
};

export const getCleanImageSource = (imagePath, defaultImage = null) => {
  if (!imagePath) return defaultImage;
  
  const cleanUrl = cleanImageUrl(imagePath);
  
  // If it's a complete URL, return as-is
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return { uri: cleanUrl };
  }
  
  return defaultImage;
};

// Extract filename with extension from Cloudinary URL or path
export const getFileNameFromUrl = (url, fallbackName = 'download') => {
  if (!url) return fallbackName;
  
  try {
    // If it's a Cloudinary URL, extract the public_id part
    if (url.includes('cloudinary.com')) {
      // Extract the part after the last slash and before any query params
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const nameWithoutQuery = lastPart.split('?')[0];
      
      // For Cloudinary raw files, the extension is automatically added by Cloudinary
      // The URL structure is: .../raw/upload/v.../folder/filename.extension
      // So we can extract the filename with extension directly
      if (nameWithoutQuery.includes('.')) {
        return nameWithoutQuery;
      }
      
      // If no extension in URL, try to determine from the URL path
      // Look for file type in the URL structure
      if (url.includes('/raw/')) {
        // For raw files, try to determine extension from common patterns
        const pathParts = url.split('/');
        const filename = pathParts[pathParts.length - 1];
        
        // If no extension, assume PDF for raw files (most common case)
        if (!filename.includes('.')) {
          return `${filename}.pdf`;
        }
        return filename;
      }
      
      return nameWithoutQuery;
    }
    
    // For local paths or other URLs
    const pathParts = url.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const nameWithoutQuery = fileName.split('?')[0];
    
    return nameWithoutQuery || fallbackName;
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return fallbackName;
  }
};

export default cleanImageUrl;
