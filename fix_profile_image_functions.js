const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const filesToFix = [
  'Frontend/src/pages/Mentor/Dashboard/Acadamics/MentorDashboardAcademics.jsx',
  'Frontend/src/pages/Mentor/Dashboard/Assessment/MentorDashboardAssessment.jsx',
  'Frontend/src/pages/Mentor/AssesmentRequest/MentorAssesmentRequest.jsx',
  'Frontend/src/pages/Mentor/Activity/EmergencyLeave/MentorEmergencyLeaveHistory.jsx',
  'Frontend/src/pages/Mentor/Activity/EmergencyLeave/MentorEmergencyLeave.jsx',
  'Frontend/src/pages/Mentor/Activity/DiciplineLog/MentorDisciplineLog.jsx',
  'Frontend/src/pages/Coordinator/Profile/CoordinatorProfile.jsx',
  'Frontend/src/pages/Coordinator/Student/IssueLogs/CoordinatorStudentDisciplineLog.jsx',
  'Frontend/src/pages/Coordinator/Student/BackLogs/CoordinatorBackLogs.jsx',
  'Frontend/src/pages/Admin/Student/StudentList/StudentDetails/AdminStudentDetails.jsx',
  'Frontend/src/pages/Admin/Student/IssueLog/AdminStudentIssuelog.jsx',
  'Frontend/src/pages/Admin/Student/Backlogs/AdminStudentBacklogs.jsx',
];

// The old problematic pattern
const oldPattern = /const getProfileImageSource = \(profilePath\) => \{[\s\S]*?if \(profilePath\) \{[\s\S]*?\/\/ 1\. Replace backslashes with forward slashes[\s\S]*?const normalizedPath = profilePath\.replace\(\/\\\\\/g, '\/'\);[\s\S]*?\/\/ 2\. Construct the full URL[\s\S]*?const fullImageUrl = `\$\{API_URL\}\/\$\{normalizedPath\}`;?[\s\S]*?return \{ uri: fullImageUrl \};[\s\S]*?\} else \{[\s\S]*?return .*?;[\s\S]*?\}[\s\S]*?\};/g;

// The correct pattern
const newPattern = `  const getProfileImageSource = (profilePath) => {
    if (profilePath) {
      // Check if it's already a full URL (Cloudinary URL)
      if (profilePath.startsWith('http://') || profilePath.startsWith('https://')) {
        return { uri: profilePath };
      }
      // For local paths, normalize and construct URL with API_URL
      const normalizedPath = profilePath.replace(/\\\\/g, '/');
      const fullImageUrl = \`\${API_URL}/\${normalizedPath}\`;
      return { uri: fullImageUrl };
    } else {
      return Staff; // or Profile depending on the component
    }
  };`;

console.log('This script would fix the getProfileImageSource functions in multiple files.');
console.log('Files to fix:', filesToFix.length);
console.log('Run this script with Node.js to perform the fixes.');
