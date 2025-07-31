// Utility function to handle profile image sources for both local paths and Cloudinary URLs
import { API_URL } from './env.js';

export const getProfileImageSource = (profilePath, defaultImage = null) => {
  if (profilePath) {
    // Check if it's already a full URL (Cloudinary URL)
    if (profilePath.startsWith('http')) {
      return { uri: profilePath };
    } else {
      // Handle local paths - replace backslashes with forward slashes and construct full URL
      const normalizedPath = profilePath.replace(/\\/g, '/');
      const fullImageUrl = `${API_URL}/${normalizedPath}`;
      return { uri: fullImageUrl };
    }
  } else {
    return defaultImage || require('../assets/Genreal/profile.png');
  }
};

export default getProfileImageSource;
