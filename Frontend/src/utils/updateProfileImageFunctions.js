/**
 * Utility function to update getProfileImageSource functions across components
 * This function handles both local file paths and Cloudinary URLs
 */

const getProfileImageSource = (profilePath, API_URL, defaultImage) => {
  if (profilePath) {
    // Check if it's a Cloudinary URL (starts with http/https)
    if (profilePath.startsWith('http://') || profilePath.startsWith('https://')) {
      return { uri: profilePath };
    }
    // Local file path - normalize and construct URL
    const normalizedPath = profilePath.replace(/\\/g, '/');
    const fullImageUrl = `${API_URL}/${normalizedPath}`;
    return { uri: fullImageUrl };
  } else {
    return defaultImage;
  }
};

export default getProfileImageSource;
