const { createTodayAcademicSessions } = require('./mentorController');
require('dotenv').config();

// Function to create today's academic sessions
async function runDailyScheduleUpdate() {
  try {
    console.log('🔄 Creating today academic sessions...');
    
    // Create a mock res object with minimal functionality
    const fakeRes = {
      json: (data) => {
        console.log('✅ Academic sessions creation result:', data);
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
    return { success: true, result };
  } catch (error) {
    console.error('❌ Daily schedule update error:', error);
    throw error;
  }
}

module.exports = { runDailyScheduleUpdate, createTodayAcademicSessions };
