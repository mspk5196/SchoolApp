const { checkOverdueLevels } = require('./mentorController');

// Function to run the daily overdue check
async function runOverdueCheck() {
  try {
    console.log('🔄 Running daily overdue check...');
    const result = await checkOverdueLevels();
    console.log('✅ Overdue check completed successfully');
    return { success: true, result };
  } catch (error) {
    console.error('❌ Overdue check failed:', error);
    throw error;
  }
}

module.exports = { runOverdueCheck, checkOverdueLevels };