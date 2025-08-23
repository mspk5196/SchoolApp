const cron = require('node-cron');
// const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
// const { runDailyScheduleUpdate } = require('./controllers/mentor/dailyScheduleUpdate');
// const { createAssessmentSessionsByDate } = require('./controllers/mentor/assesmentCronJob');
const { updateActivityStatuses, generateDailyPeriodActivities, updateActivityStatuses1, updateActivityStatuses2 } = require('./controllers/mentor/activityLifecycleController');
const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
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
    
    // Helper function to validate cron field values
    function validateCronField(value, min, max, fieldName) {
        if (value === '*') return true;
        
        // Handle step values like */5
        if (value.includes('*/')) {
            const stepPart = value.split('*/')[1];
            const step = parseInt(stepPart);
            return !isNaN(step) && step > 0 && step <= max;
        }
        
        // Handle range values like 1-5
        if (value.includes('-')) {
            const [start, end] = value.split('-').map(v => parseInt(v));
            return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end;
        }
        
        // Handle list values like 1,3,5
        if (value.includes(',')) {
            const values = value.split(',').map(v => parseInt(v));
            return values.every(v => !isNaN(v) && v >= min && v <= max);
        }
        
        // Handle single values
        const numValue = parseInt(value);
        return !isNaN(numValue) && numValue >= min && numValue <= max;
    }
    
    // Validate each field
    if (!validateCronField(minute, 0, 59, 'minute')) {
        throw new Error(`Invalid minute value: ${minute}. Must be 0-59, *, */n, or valid range/list`);
    }
    if (!validateCronField(hour, 0, 23, 'hour')) {
        throw new Error(`Invalid hour value: ${hour}. Must be 0-23, *, */n, or valid range/list`);
    }
    if (!validateCronField(day, 1, 31, 'day')) {
        throw new Error(`Invalid day value: ${day}. Must be 1-31, *, */n, or valid range/list`);
    }
    if (!validateCronField(month, 1, 12, 'month')) {
        throw new Error(`Invalid month value: ${month}. Must be 1-12, *, */n, or valid range/list`);
    }
    if (!validateCronField(weekday, 0, 7, 'weekday')) {
        throw new Error(`Invalid weekday value: ${weekday}. Must be 0-7, *, */n, or valid range/list`);
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

    // const activityTime = adjustTimeForUTC(23, 59);
    const activityCronExpression = `* * * * *`;
    createSafeCronJob(activityCronExpression, async () => {
        console.log('🔄 Running update activity status...');
        try {
            const result = await updateActivityStatuses();
            const result1 = await updateActivityStatuses1();
            const result2 = await updateActivityStatuses2();
            console.log('✅ Update activity status completed:', result.message);
            console.log('✅ Update activity status completed:', result1.message);
            console.log('✅ Update activity status completed:', result2.message);
        } catch (error) {
            console.error('❌ Update activity status failed:', error);
        }
    }, getCronOptions(), 'Update Activity Status Cron Job');
    
    createSafeCronJob(attendanceCronExpression, async () => {
        console.log('🔄 Running generate daily period activities...');
        try {
            const result = await generateDailyPeriodActivities();
            console.log('✅ Generate daily period activities completed:', result.message);
        } catch (error) {
            console.error('❌ Generate daily period activities failed:', error);
        }
    }, getCronOptions(), 'Generate Daily Period Activities Cron Job');
    
    createSafeCronJob(attendanceCronExpression, async () => {
        console.log('🔄 Running run overdue check...');
        try {
            const result = await runOverdueCheck();
            console.log('✅ Run overdue check completed:', result.message);
        } catch (error) {
            console.error('❌ Run overdue check failed:', error);
        }
    }, getCronOptions(), 'Run Overdue Check Cron Job');

    // createSafeCronJob(attendanceCronExpression, async () => {
    //     console.log('🔄 Running daily attendance updater...');
    //     try {
    //         const result = await runAttendanceUpdater();
    //         console.log('✅ Attendance updater completed:', result.message);
    //     } catch (error) {
    //         console.error('❌ Attendance updater failed:', error);
    //     }
    // }, getCronOptions(), 'Attendance Cron Job');
    
    // createSafeCronJob(attendanceCronExpression, async () => {
    //     console.log('🔄 Running daily attendance updater...');
    //     try {
    //         const result = await runAttendanceUpdater();
    //         console.log('✅ Attendance updater completed:', result.message);
    //     } catch (error) {
    //         console.error('❌ Attendance updater failed:', error);
    //     }
    // }, getCronOptions(), 'Attendance Cron Job');

    // // Assessment sessions creator - runs at 11:59 PM IST daily
    // const assessmentTime = adjustTimeForUTC(23, 59);
    // const assessmentCronExpression = `${assessmentTime.minute} ${assessmentTime.hour} * * *`;
    // console.log('🕐 Assessment cron - IST: 23:59, UTC equivalent:', assessmentTime);
    
    // createSafeCronJob(assessmentCronExpression, async () => {
    //     console.log('🔄 Creating assessment sessions for tomorrow...');
    //     try {
    //         const result = await createAssessmentSessionsByDate();
    //         console.log('✅ Assessment sessions created:', result);
    //     } catch (error) {
    //         console.error('❌ Assessment sessions creation failed:', error);
    //     }
    // }, getCronOptions(), 'Assessment Cron Job');
    
    // // Academic sessions creator - runs at 12:30 AM IST daily
    // // Convert 00:30 IST to UTC
    // const academicTime = adjustTimeForUTC(0, 30);
    // const academicCronExpression = `${academicTime.minute} ${academicTime.hour} * * *`;
    
    // console.log('🕐 Academic cron - IST: 00:30, UTC equivalent:', academicTime);
    // console.log('🕐 Academic cron expression:', academicCronExpression);
    
    // createSafeCronJob(academicCronExpression, async () => {
    //     console.log('🔄 Creating today academic sessions...');
    //     try {
    //         const result = await runDailyScheduleUpdate();
    //         console.log('✅ Academic/Assessment sessions created:', result);
    //     } catch (error) {
    //         console.error('❌ Academic sessions creation failed:', error);
    //     }
    // }, getCronOptions(), 'Academic Cron Job', [35, 40, 45]); // Fallback to 00:35, 00:40, or 00:45 if needed

    // // Student backlogs checker - runs at 1:00 AM IST daily
    // const backlogTime = adjustTimeForUTC(1, 0);
    // const backlogCronExpression = `${backlogTime.minute} ${backlogTime.hour} * * *`;
    // console.log('🕐 Backlog cron - IST: 01:00, UTC equivalent:', backlogTime);
    
    // createSafeCronJob(backlogCronExpression, async () => {
    //     console.log('🔄 Running overdue levels check...');
    //     try {
    //         const result = await runOverdueCheck();
    //         console.log('✅ Overdue levels check completed:', result);
    //     } catch (error) {
    //         console.error('❌ Overdue levels check failed:', error);
    //     }
    // }, getCronOptions(), 'Backlog Cron Job');

    // // Exam conflict deletion - runs every 5 minutes to handle recurring exams
    // createSafeCronJob('*/5 * * * *', async () => {
    //     console.log('🔄 Running exam conflict deletion check...');
    //     try {
    //         await runExamConflictDeletion();
    //         console.log('✅ Exam conflict deletion check completed');
    //     } catch (error) {
    //         console.error('❌ Exam conflict deletion check failed:', error);
    //     }
    // }, getCronOptions(), 'Exam Conflict Deletion Cron Job');

    console.log('✅ All cron jobs initialized');
} else {
    console.log('⏸️ Cron jobs disabled for this process');
}

module.exports = {
    // Export functions for manual testing
    runAttendanceUpdater,
    updateActivityStatuses,
    generateDailyPeriodActivities,
    runOverdueCheck,
    updateActivityStatuses1,
    updateActivityStatuses2
    // runDailyScheduleUpdate,
    // createAssessmentSessionsByDate,
};

cron.schedule('0 18 * * *', () => {
    console.log('Cron running!');
}, { timezone: "Asia/Kolkata" });



// const cron = require('node-cron');
// const { updateActivityStatuses, generateDailyPeriodActivities } = require('./controllers/mentor/activityLifecycleController');
// const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
// const { runOverdueCheck } = require('./controllers/mentor/studentBacklogsCron');

// // Run cron jobs based on environment
// const shouldRunCrons = process.env.CRON_WORKER === 'true' || process.env.NODE_ENV == 'production';

// if (shouldRunCrons) {
//     console.log('🕐 Starting cron jobs...');

//     // NEW: Runs every minute to update scheduled activities to 'Not Started'
//     cron.schedule('* * * * *', async () => {
//         console.log('🔄 Cron: Updating activity statuses...');
//         await updateActivityStatuses();
//     });

//     // NEW: Runs once daily at midnight IST to generate period_activities for the day.
//     // 00:01 IST is 18:31 UTC the previous day.
//     cron.schedule('31 18 * * *', async () => {
//         console.log('🔄 Cron: Generating daily period activities for today...');
//         await generateDailyPeriodActivities();
//     }, { scheduled: true, timezone: "UTC" });
    
//     // Example of keeping an existing job (runs at 6:00 PM IST)
//     // 18:00 IST is 12:30 UTC
//     cron.schedule('30 12 * * *', async () => {
//         console.log('🔄 Cron: Running daily attendance updater...');
//         await runAttendanceUpdater();
//     }, { scheduled: true, timezone: "UTC" });

//     // Example of keeping another existing job (runs at 1:00 AM IST)
//     // 01:00 IST is 19:30 UTC the previous day.
//     cron.schedule('30 19 * * *', async () => {
//         console.log('🔄 Cron: Running overdue levels check...');
//         await runOverdueCheck();
//     }, { scheduled: true, timezone: "UTC" });

//     console.log('✅ All cron jobs initialized.');
// } else {
//     console.log('⏸️ Cron jobs are disabled for this process.');
// }