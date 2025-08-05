const { createAssessmentSessionsByDate } = require('./assesmentCronJob');
const { createTodayAcademicSessions } = require('./mentorController');
require('dotenv').config();

// Function to create today's academic sessions
async function runDailyScheduleUpdate() {
  try {
    console.log('🔄 Creating today academic/assessment sessions...');
    
    // Create a mock res object with minimal functionality
    const fakeRes = {
      json: (data) => {
        console.log('✅ Academic/assessment sessions creation result:', data);
        return data;
      },
      status: (code) => ({
        json: (data) => {
          console.log(`Status ${code}:`, data);
          return data;
        }
      })
    };
    
    const result = await createTodayAcademicSessions({}, fakeRes);
    const result2 = await createAssessmentSessionsByDate({}, fakeRes);
    return { success: true, result, result2 };
  } catch (error) {
    console.error('❌ Daily schedule update error:', error);
    throw error;
  }
}

module.exports = { runDailyScheduleUpdate, createTodayAcademicSessions };
