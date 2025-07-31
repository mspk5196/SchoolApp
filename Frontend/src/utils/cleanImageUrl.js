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

export default cleanImageUrl;
