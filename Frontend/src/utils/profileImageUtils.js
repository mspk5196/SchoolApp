// Utility function to handle profile image sources for both local paths and Cloudinary URLs
import { API_URL } from './env.js';
import { cleanImageUrl } from './cleanImageUrl.js';

export const getProfileImageSource = (profilePath, defaultImage = null) => {
  if (profilePath) {
    // Clean up any malformed URLs first
    const cleanProfilePath = cleanImageUrl(profilePath);
    
    // Check if it's already a full URL (Cloudinary URL)
    if (cleanProfilePath.startsWith('http://') || cleanProfilePath.startsWith('https://')) {
      return { uri: cleanProfilePath };
    } 
    
    // Check if it already starts with API_URL (avoid double prefixing)
    if (cleanProfilePath.startsWith(API_URL)) {
      return { uri: cleanProfilePath };
    }
    
    // Handle local paths - replace backslashes with forward slashes and construct full URL
    const normalizedPath = cleanProfilePath.replace(/\\/g, '/');
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
    
    // Ensure API_URL doesn't end with slash to avoid double slashes
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    
    const fullImageUrl = `${baseUrl}/${cleanPath}`;
    return { uri: fullImageUrl };
  } else {
    return defaultImage || require('../assets/Genreal/profile.png');
  }
};

export default getProfileImageSource;
