const cron = require('node-cron');
const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
const { runDailyScheduleUpdate } = require('./controllers/mentor/dailyScheduleUpdate');
const { createAssessmentSessionsByDate } = require('./controllers/mentor/assesmentCronJob');
const { runOverdueCheck } = require('./controllers/mentor/studentBacklogsCron');

// Only start cron jobs if this is the designated worker process or in Railway production
const shouldRunCrons = process.env.CRON_WORKER === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT) ||
    (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT);

console.log('🔧 Cron configuration:');
console.log('  - CRON_WORKER:', process.env.CRON_WORKER);
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('  - Should run crons:', shouldRunCrons);

function getTimezone() {
    let tz = (process.env.TIMEZONE || "Asia/Kolkata").trim();
    if (tz.startsWith('=')) tz = tz.slice(1);
    return tz;
}

if (shouldRunCrons) {
    console.log('🕐 Starting cron jobs...');
    //   console.log("Scheduling cron job with date:", yourDateVariable);

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
        timezone: getTimezone()
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
        timezone: getTimezone()
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
        timezone: getTimezone()
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
        timezone: getTimezone()
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
