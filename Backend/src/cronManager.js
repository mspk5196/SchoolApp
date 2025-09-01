const cron = require('node-cron');
// const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
// const { runDailyScheduleUpdate } = require('./controllers/mentor/dailyScheduleUpdate');
// const { createAssessmentSessionsByDate } = require('./controllers/mentor/assesmentCronJob');
const { updateActivityStatuses, generateDailyPeriodActivities, updateActivityStatuses1, updateVenueStatusBasedOnSchedule } = require('./controllers/mentor/activityLifecycleController');
const { runAttendanceUpdater } = require('./controllers/student/attendanceCron');
const { runOverdueCheck } = require('./controllers/mentor/studentBacklogsCron');
const { generateStudentWiseSchedulesCron } = require('./controllers/coordinator/scheduleManagementController');

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
            // const result2 = await updateActivityStatuses2();
            console.log('✅ Update activity status completed:', result.message);
            console.log('✅ Update activity status completed:', result1.message);
            // console.log('✅ Update activity status completed:', result2.message);
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

   const venueStatusCron = `* * * * *`;
    createSafeCronJob(venueStatusCron, async () => {
        console.log('🔄 Running update venue status...');
        try {
            const result = await updateVenueStatusBasedOnSchedule();
            console.log('✅ Update venue status completed:', result.message);
        } catch (error) {
            console.error('❌ Update venue status failed:', error);
        }
    }, getCronOptions(), 'Update Venue Status Cron Job');

    const scheduleTime = adjustTimeForUTC(18, 0);
    const scheduleCronExpression = `${scheduleTime.minute} ${scheduleTime.hour} * * *`;
    createSafeCronJob(scheduleCronExpression, async () => {
        console.log('🔄 Running studentWiseSchedule creation...');
        try {
            const result = await generateStudentWiseSchedulesCron();
            console.log('✅ StudentWiseSchedule creation completed:', result.message);
        } catch (error) {
            console.error('❌ StudentWiseSchedule creation failed:', error);
        }
    }, getCronOptions(), 'StudentWiseSchedule Cron Job');

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
    updateVenueStatusBasedOnSchedule,
    generateStudentWiseSchedulesCron,
    // createAssessmentSessionsByDate,
};

cron.schedule('0 18 * * *', () => {
    console.log('Cron running!');
}, { timezone: "Asia/Kolkata" });