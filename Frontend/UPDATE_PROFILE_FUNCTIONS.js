#!/usr/bin/env node

/**
 * Mass Update Script for Profile Image Functions
 * This script will help update all remaining getProfileImageSource functions
 * to handle the /https:// issue correctly
 */

const UPDATED_FUNCTION = `
  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // Fix malformed URLs with extra slash
      let cleanPath = profilePath;
      if (cleanPath.startsWith('/http://') || cleanPath.startsWith('/https://')) {
        cleanPath = cleanPath.substring(1);
      }
      
      // Check if it's a Cloudinary URL (starts with http/https)
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return { uri: cleanPath };
      }
      
      // Local file path - normalize and construct URL
      const normalizedPath = cleanPath.replace(/\\/g, '/');
      const cleanLocalPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const fullImageUrl = \`\${baseUrl}/\${cleanLocalPath}\`;
      return { uri: fullImageUrl };
    } else {
      return DefaultImage; // Replace DefaultImage with actual default for each component
    }
  };
`;

console.log('Use this updated function pattern in all components:');
console.log(UPDATED_FUNCTION);

console.log('\nComponents that need updating:');
console.log('1. MentorDashboardAttentions.jsx');
console.log('2. MentorDashboardAssessment.jsx');
console.log('3. MentorDashboardAcademics.jsx');
console.log('4. MentorAssesmentRequest.jsx');
console.log('5. MentorSurveyDetails.jsx');
console.log('6. MentorEmergencyLeave.jsx');
console.log('7. MentorEmergencyLeaveHistory.jsx');
console.log('8. MentorGeneralActivity.jsx');
console.log('9. MentorDisciplineLog.jsx');
console.log('10. CoordinatorStudentProfile.jsx');

console.log('\nKey fix: Check for /http:// or /https:// and remove the leading slash!');
