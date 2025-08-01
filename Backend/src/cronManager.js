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
    const attendanceCronExpression = `${attendanceTime.minute} ${attendanceTime.hour} * * *`;
    console.log('🕐 Attendance cron - IST: 18:00, UTC equivalent:', attendanceTime);
    
    try {
        cron.schedule(attendanceCronExpression, async () => {
            console.log('🔄 Running daily attendance updater...');
            try {
                const result = await runAttendanceUpdater();
                console.log('✅ Attendance updater completed:', result.message);
            } catch (error) {
                console.error('❌ Attendance updater failed:', error);
            }
        }, getCronOptions());
        console.log('✅ Attendance cron job scheduled successfully');
    } catch (error) {
        console.error('❌ Failed to schedule attendance cron job:', error);
    }

    // Assessment sessions creator - runs at 11:59 PM IST daily
    const assessmentTime = adjustTimeForUTC(23, 59);
    const assessmentCronExpression = `${assessmentTime.minute} ${assessmentTime.hour} * * *`;
    console.log('🕐 Assessment cron - IST: 23:59, UTC equivalent:', assessmentTime);
    
    try {
        cron.schedule(assessmentCronExpression, async () => {
            console.log('🔄 Creating assessment sessions for tomorrow...');
            try {
                const result = await createAssessmentSessionsByDate();
                console.log('✅ Assessment sessions created:', result);
            } catch (error) {
                console.error('❌ Assessment sessions creation failed:', error);
            }
        }, getCronOptions());
        console.log('✅ Assessment cron job scheduled successfully');
    } catch (error) {
        console.error('❌ Failed to schedule assessment cron job:', error);
    }

    // Academic sessions creator - runs at 12:05 AM IST daily
    const academicTime = adjustTimeForUTC(0, 5);
    const academicCronExpression = `${academicTime.minute} ${academicTime.hour} * * *`;
    console.log('🕐 Academic cron - IST: 00:05, UTC equivalent:', academicTime);
    console.log('🕐 Academic cron expression:', academicCronExpression);
    
    try {
        cron.schedule(academicCronExpression, async () => {
            console.log('🔄 Creating today academic sessions...');
            try {
                const result = await runDailyScheduleUpdate();
                console.log('✅ Academic sessions created:', result);
            } catch (error) {
                console.error('❌ Academic sessions creation failed:', error);
            }
        }, getCronOptions());
        console.log('✅ Academic cron job scheduled successfully');
    } catch (error) {
        console.error('❌ Failed to schedule academic cron job:', error);
        console.error('❌ Attempted expression:', academicCronExpression);
        console.error('❌ Attempted options:', getCronOptions());
    }

    // Student backlogs checker - runs at 1:00 AM IST daily
    const backlogTime = adjustTimeForUTC(1, 0);
    const backlogCronExpression = `${backlogTime.minute} ${backlogTime.hour} * * *`;
    console.log('🕐 Backlog cron - IST: 01:00, UTC equivalent:', backlogTime);
    
    try {
        cron.schedule(backlogCronExpression, async () => {
            console.log('🔄 Running overdue levels check...');
            try {
                const result = await runOverdueCheck();
                console.log('✅ Overdue levels check completed:', result);
            } catch (error) {
                console.error('❌ Overdue levels check failed:', error);
            }
        }, getCronOptions());
        console.log('✅ Backlog cron job scheduled successfully');
    } catch (error) {
        console.error('❌ Failed to schedule backlog cron job:', error);
    }

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