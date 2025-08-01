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
    // Check if the timezone is supported in the current environment
    try {
        Intl.DateTimeFormat(undefined, { timeZone: "Asia/Kolkata" });
        return "Asia/Kolkata";
    } catch (error) {
        console.warn('⚠️ Asia/Kolkata timezone not supported, falling back to UTC+05:30');
        return "UTC";
    }
}

function getCronOptions() {
    const timezone = getTimezone();
    if (timezone === "UTC") {
        // If we can't use Asia/Kolkata, we'll adjust the times to UTC equivalent
        // Asia/Kolkata is UTC+05:30, so we subtract 5.5 hours from the times
        return { scheduled: true };
    }
    return { scheduled: true, timezone: timezone };
}

function adjustTimeForUTC(hour, minute = 0) {
    // Convert IST time to UTC (subtract 5.5 hours)
    const timezone = getTimezone();
    if (timezone === "UTC") {
        let utcHour = hour - 5;
        let utcMinute = minute - 30;
        
        if (utcMinute < 0) {
            utcMinute += 60;
            utcHour -= 1;
        }
        
        if (utcHour < 0) {
            utcHour += 24;
        }
        
        return { hour: utcHour, minute: utcMinute };
    }
    return { hour, minute };
}

if (shouldRunCrons) {
    console.log('🕐 Starting cron jobs...');
    console.log('🌍 Using timezone:', getTimezone());

    // Daily attendance updater - runs at 6:00 PM IST daily
    const attendanceTime = adjustTimeForUTC(18, 0);
    cron.schedule(`${attendanceTime.minute} ${attendanceTime.hour} * * *`, async () => {
        console.log('🔄 Running daily attendance updater...');
        try {
            const result = await runAttendanceUpdater();
            console.log('✅ Attendance updater completed:', result.message);
        } catch (error) {
            console.error('❌ Attendance updater failed:', error);
        }
    }, getCronOptions());

    // Assessment sessions creator - runs at 11:59 PM IST daily
    const assessmentTime = adjustTimeForUTC(23, 59);
    console.log('Assessment cron');
    
    cron.schedule(`${assessmentTime.minute} ${assessmentTime.hour} * * *`, async () => {
        console.log('🔄 Creating assessment sessions for tomorrow...');
        try {
            const result = await createAssessmentSessionsByDate();
            console.log('✅ Assessment sessions created:', result);
        } catch (error) {
            console.error('❌ Assessment sessions creation failed:', error);
        }
    }, getCronOptions());

    // // Academic sessions creator - runs at 12:05 AM IST daily
    const academicTime = adjustTimeForUTC(0, 5);
    console.log('Academic cron');
    cron.schedule(`${academicTime.minute} ${academicTime.hour} * * *`, async () => {
        console.log('🔄 Creating today academic sessions...');
        try {
            const result = await runDailyScheduleUpdate();
            console.log('✅ Academic sessions created:', result);
        } catch (error) {
            console.error('❌ Academic sessions creation failed:', error);
        }
    }, getCronOptions());

    // // Student backlogs checker - runs at 1:00 AM IST daily
    // const backlogTime = adjustTimeForUTC(1, 0);
    // cron.schedule(`${backlogTime.minute} ${backlogTime.hour} * * *`, async () => {
    //     console.log('🔄 Running overdue levels check...');
    //     try {
    //         const result = await runOverdueCheck();
    //         console.log('✅ Overdue levels check completed:', result);
    //     } catch (error) {
    //         console.error('❌ Overdue levels check failed:', error);
    //     }
    // }, getCronOptions());

    console.log('✅ All cron jobs initialized');
} else {
    console.log('⏸️ Cron jobs disabled for this process');
}

module.exports = {
    // Export functions for manual testing
    runAttendanceUpdater,
    // runDailyScheduleUpdate,
    // createAssessmentSessionsByDate,
    // runOverdueCheck
};


// const cron = require('node-cron');
// cron.schedule('0 18 * * *', () => {
//     console.log('Cron running!');
// }, { timezone: "Asia/Kolkata" });