// Assessment session creation logic
const mentorController = require('./mentorController');

// Function to create assessment sessions for a specific date
async function createAssessmentSessionsByDate(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  try {
    const result = await mentorController.createAssessmentSessionsByDate(targetDate);
    console.log(`✅ Created ${result || 0} assessment sessions for ${targetDate}`);
    return { success: true, created: result || 0, date: targetDate };
  } catch (error) {
    console.error('❌ Error creating assessment sessions:', error);
    throw error;
  }
}

module.exports = { createAssessmentSessionsByDate };