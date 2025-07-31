/**
 * Universal profile image source handler
 * This handles all edge cases for both Cloudinary URLs and local file paths
 */

import { cleanImageUrl } from './cleanImageUrl';

export const getProfileImageSource = (profilePath, defaultImage, API_URL) => {
  // Return default if no profile path
  if (!profilePath || profilePath === '' || profilePath === null || profilePath === undefined) {
    return defaultImage;
  }

  // Clean the URL first to fix any malformed URLs like /https://
  const cleanUrl = cleanImageUrl(profilePath);
  
  // Handle Cloudinary URLs (complete URLs)
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return { uri: cleanUrl };
  }

  // Handle local file paths
  if (API_URL) {
    // Normalize the path (replace backslashes with forward slashes)
    let normalizedPath = cleanUrl.replace(/\\/g, '/');
    
    // Remove leading slash from path to avoid double slashes
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }
    
    // Ensure API_URL doesn't end with slash
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    
    // Construct the full URL
    const fullUrl = `${baseUrl}/${normalizedPath}`;
    return { uri: fullUrl };
  }

  // Fallback to treating it as a local file path relative to current location
  return { uri: cleanUrl };
};

export default getProfileImageSource;
