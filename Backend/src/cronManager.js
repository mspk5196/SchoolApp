const cron = require('node-cron');
const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
const { runDailyScheduleUpdate } = require('./controllers/mentor/dailyScheduleUpdate');
const { createAssessmentSessionsByDate } = require('./controllers/mentor/assesmentCronJob');
const { runOverdueCheck } = require('./controllers/mentor/studentBacklogsCron');

// Only start cron jobs if this is the designated worker process
const shouldRunCrons = process.env.CRON_WORKER === 'true' || 
  (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT);

if (shouldRunCrons) {
  console.log('🕐 Starting cron jobs...');

  // Daily attendance updater - runs at 6:00 PM daily
  cron.schedule('0 18 * * *', async () => {
    console.log('🔄 Running daily attendance updater...');
    try {
      const result = await runAttendanceUpdater();
      console.log('✅ Attendance updater completed:', result.message);
    } catch (error) {
      console.error('❌ Attendance updater failed:', error);
    }
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "Asia/Kolkata"
  });

  // Assessment sessions creator - runs at 11:59 PM daily
  cron.schedule('59 23 * * *', async () => {
    console.log('🔄 Creating assessment sessions for tomorrow...');
    try {
      const result = await createAssessmentSessionsByDate();
      console.log('✅ Assessment sessions created:', result);
    } catch (error) {
      console.error('❌ Assessment sessions creation failed:', error);
    }
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "Asia/Kolkata"
  });

  // Academic sessions creator - runs at 12:05 AM daily
  cron.schedule('5 0 * * *', async () => {
    console.log('🔄 Creating today academic sessions...');
    try {
      const result = await runDailyScheduleUpdate();
      console.log('✅ Academic sessions created:', result);
    } catch (error) {
      console.error('❌ Academic sessions creation failed:', error);
    }
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "Asia/Kolkata"
  });

  // Student backlogs checker - runs at 1:00 AM daily
  cron.schedule('0 1 * * *', async () => {
    console.log('🔄 Running overdue levels check...');
    try {
      const result = await runOverdueCheck();
      console.log('✅ Overdue levels check completed:', result);
    } catch (error) {
      console.error('❌ Overdue levels check failed:', error);
    }
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "Asia/Kolkata"
  });

  console.log('✅ All cron jobs initialized');
} else {
  console.log('⏸️ Cron jobs disabled for this process');
}

module.exports = {
  // Export functions for manual testing
  runAttendanceUpdater,
  runDailyScheduleUpdate,
  createAssessmentSessionsByDate,
  runOverdueCheck
};
