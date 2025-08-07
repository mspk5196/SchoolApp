const cron = require('node-cron');
const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
const { runDailyScheduleUpdate } = require('./controllers/mentor/dailyScheduleUpdate');
const { createAssessmentSessionsByDate } = require('./controllers/mentor/assesmentCronJob');
const { runOverdueCheck } = require('./controllers/mentor/studentBacklogsCron');
const { runExamConflictDeletion } = require('./controllers/coordinator/examConflictCron');

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
    // Always use UTC to avoid timezone conversion issues in production
    // We'll handle IST conversion manually in the cron expressions
    return "UTC";
}

function getCronOptions() {
    // Always use UTC scheduling to avoid timezone issues
    return { scheduled: true };
}

function adjustTimeForUTC(hour, minute = 0) {
    // Convert IST time to UTC (subtract 5.5 hours)
    // IST is UTC+5:30, so we need to subtract 5 hours and 30 minutes
    let utcHour = hour - 5;
    let utcMinute = minute - 30;
    
    // Handle minute overflow/underflow
    if (utcMinute < 0) {
        utcMinute += 60;
        utcHour -= 1;
    } else if (utcMinute >= 60) {
        utcMinute -= 60;
        utcHour += 1;
    }
    
    // Handle hour overflow/underflow
    if (utcHour < 0) {
        utcHour += 24;
    } else if (utcHour >= 24) {
        utcHour -= 24;
    }
    
    return { hour: utcHour, minute: utcMinute };
}

function validateCronExpression(expression) {
    // Basic validation for cron expression format
    const parts = expression.split(' ');
    if (parts.length !== 5) {
        throw new Error(`Invalid cron expression format: ${expression}. Expected 5 parts, got ${parts.length}`);
    }
    
    const [minute, hour, day, month, weekday] = parts;
    
    // Validate ranges (allow * for wildcards)
    if (minute !== '*' && (isNaN(parseInt(minute)) || parseInt(minute) < 0 || parseInt(minute) > 59)) {
        throw new Error(`Invalid minute value: ${minute}. Must be 0-59 or *`);
    }
    if (hour !== '*' && (isNaN(parseInt(hour)) || parseInt(hour) < 0 || parseInt(hour) > 23)) {
        throw new Error(`Invalid hour value: ${hour}. Must be 0-23 or *`);
    }
    if (day !== '*' && (isNaN(parseInt(day)) || parseInt(day) < 1 || parseInt(day) > 31)) {
        throw new Error(`Invalid day value: ${day}. Must be 1-31 or *`);
    }
    if (month !== '*' && (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)) {
        throw new Error(`Invalid month value: ${month}. Must be 1-12 or *`);
    }
    if (weekday !== '*' && (isNaN(parseInt(weekday)) || parseInt(weekday) < 0 || parseInt(weekday) > 7)) {
        throw new Error(`Invalid weekday value: ${weekday}. Must be 0-7 or *`);
    }
    
    return true;
}

function createSafeCronJob(expression, callback, options, jobName, fallbackMinutes = []) {
    try {
        // Validate the expression first
        validateCronExpression(expression);
        
        console.log(`🕐 Scheduling ${jobName} with expression: ${expression}`);
        console.log(`🔧 Options:`, options);
        
        // Try to validate the expression with node-cron
        if (!cron.validate(expression)) {
            throw new Error(`Invalid cron expression according to node-cron: ${expression}`);
        }
        
        // Schedule the job
        cron.schedule(expression, callback, options);
        console.log(`✅ ${jobName} scheduled successfully`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to schedule ${jobName}:`, error.message);
        console.error(`❌ Expression: ${expression}`);
        console.error(`❌ Options:`, options);
        
        // Try fallback times if provided
        if (fallbackMinutes.length > 0) {
            const parts = expression.split(' ');
            for (const fallbackMinute of fallbackMinutes) {
                try {
                    const fallbackExpression = `${fallbackMinute} ${parts[1]} ${parts[2]} ${parts[3]} ${parts[4]}`;
                    console.log(`🔄 Trying fallback expression: ${fallbackExpression}`);
                    
                    if (cron.validate(fallbackExpression)) {
                        cron.schedule(fallbackExpression, callback, options);
                        console.log(`✅ ${jobName} scheduled successfully with fallback time`);
                        return true;
                    }
                } catch (fallbackError) {
                    console.error(`❌ Fallback also failed: ${fallbackError.message}`);
                }
            }
        }
        
        return false;
    }
}

if (shouldRunCrons) {
    console.log('🕐 Starting cron jobs...');
    console.log('🌍 Using timezone: UTC (converting IST times to UTC)');

    // Test time conversions
    console.log('🧪 Testing IST to UTC time conversions:');
    console.log('  - IST 00:05 -> UTC:', adjustTimeForUTC(0, 5));
    console.log('  - IST 01:00 -> UTC:', adjustTimeForUTC(1, 0));
    console.log('  - IST 18:00 -> UTC:', adjustTimeForUTC(18, 0));
    console.log('  - IST 23:59 -> UTC:', adjustTimeForUTC(23, 59));

    // Daily attendance updater - runs at 6:00 PM IST daily
    const attendanceTime = adjustTimeForUTC(18, 0);
    const attendanceCronExpression = `${attendanceTime.minute} ${attendanceTime.hour} * * *`;
    console.log('🕐 Attendance cron - IST: 18:00, UTC equivalent:', attendanceTime);
    
    createSafeCronJob(attendanceCronExpression, async () => {
        console.log('🔄 Running daily attendance updater...');
        try {
            const result = await runAttendanceUpdater();
            console.log('✅ Attendance updater completed:', result.message);
        } catch (error) {
            console.error('❌ Attendance updater failed:', error);
        }
    }, getCronOptions(), 'Attendance Cron Job');

    // Assessment sessions creator - runs at 11:59 PM IST daily
    const assessmentTime = adjustTimeForUTC(23, 59);
    const assessmentCronExpression = `${assessmentTime.minute} ${assessmentTime.hour} * * *`;
    console.log('🕐 Assessment cron - IST: 23:59, UTC equivalent:', assessmentTime);
    
    createSafeCronJob(assessmentCronExpression, async () => {
        console.log('🔄 Creating assessment sessions for tomorrow...');
        try {
            const result = await createAssessmentSessionsByDate();
            console.log('✅ Assessment sessions created:', result);
        } catch (error) {
            console.error('❌ Assessment sessions creation failed:', error);
        }
    }, getCronOptions(), 'Assessment Cron Job');
    
    // Academic sessions creator - runs at 12:30 AM IST daily
    // Convert 00:30 IST to UTC
    const academicTime = adjustTimeForUTC(0, 30);
    const academicCronExpression = `${academicTime.minute} ${academicTime.hour} * * *`;
    
    console.log('🕐 Academic cron - IST: 00:30, UTC equivalent:', academicTime);
    console.log('🕐 Academic cron expression:', academicCronExpression);
    
    createSafeCronJob(academicCronExpression, async () => {
        console.log('🔄 Creating today academic sessions...');
        try {
            const result = await runDailyScheduleUpdate();
            console.log('✅ Academic/Assessment sessions created:', result);
        } catch (error) {
            console.error('❌ Academic sessions creation failed:', error);
        }
    }, getCronOptions(), 'Academic Cron Job', [35, 40, 45]); // Fallback to 00:35, 00:40, or 00:45 if needed

    // Student backlogs checker - runs at 1:00 AM IST daily
    const backlogTime = adjustTimeForUTC(1, 0);
    const backlogCronExpression = `${backlogTime.minute} ${backlogTime.hour} * * *`;
    console.log('🕐 Backlog cron - IST: 01:00, UTC equivalent:', backlogTime);
    
    createSafeCronJob(backlogCronExpression, async () => {
        console.log('🔄 Running overdue levels check...');
        try {
            const result = await runOverdueCheck();
            console.log('✅ Overdue levels check completed:', result);
        } catch (error) {
            console.error('❌ Overdue levels check failed:', error);
        }
    }, getCronOptions(), 'Backlog Cron Job');

    // Exam conflict deletion - runs every 5 minutes to handle recurring exams
    createSafeCronJob('*/5 * * * *', async () => {
        console.log('🔄 Running exam conflict deletion check...');
        try {
            await runExamConflictDeletion();
            console.log('✅ Exam conflict deletion check completed');
        } catch (error) {
            console.error('❌ Exam conflict deletion check failed:', error);
        }
    }, getCronOptions(), 'Exam Conflict Deletion Cron Job');

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