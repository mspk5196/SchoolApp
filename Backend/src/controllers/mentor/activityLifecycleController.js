// const { createAssessmentSessionsByDate } = require('./assesmentCronJob');
// const { createTodayAcademicSessions } = require('./mentorController');
// require('dotenv').config();

// // Function to create today's academic sessions
// async function runDailyScheduleUpdate() {
//   try {
//     console.log('🔄 Creating today academic/assessment sessions...');
    
//     // Create a mock res object with minimal functionality
//     const fakeRes = {
//       json: (data) => {
//         console.log('✅ Academic/assessment sessions creation result:', data);
//         return data;
//       },
//       status: (code) => ({
//         json: (data) => {
//           console.log(`Status ${code}:`, data);
//           return data;
//         }
//       })
//     };
    
    
//     const result = await createTodayAcademicSessions({}, fakeRes);
//     // const result = await createTodayAcademicSessions({}, fakeRes);
//     // const result2 = await createAssessmentSessionsByDate({}, fakeRes);
//     return { success: true, result, result2 };
//   } catch (error) {
//     console.error('❌ Daily schedule update error:', error);
//     throw error;
//   }
// }

// module.exports = { runDailyScheduleUpdate, createTodayAcademicSessions };


const db = require('../../config/db');

/**
 * @description Updates status of activities from 'Schedule Created' to 'Not Started'
 * when their start time is reached. Runs every minute via cron job.
 */
const updateActivityStatuses = async () => {
    try {
        const query = `
            UPDATE period_activities
            SET status = 'Not Started'
            WHERE status = 'Schedule Created'
              AND activity_date = CURDATE()
              AND start_time <= CURTIME()
        `;
        // Use promise-based query for async/await
        const [result] = await db.promise().query(query);
        const message = `Updated ${result.affectedRows} activities to 'Not Started'.`;
        return { success: true, message };
    } catch (error) {
        console.error('CRON ERROR: Failed to update activity statuses:', error);
        return { success: false, message: error.message };
    }
};
const updateActivityStatuses1 = async () => {
    try {
        const query = `
            UPDATE period_activities
            SET status = 'Time Over'
            WHERE status = 'Not Started'
              AND activity_date = CURDATE()
              AND end_time <= CURTIME()
        `;
        // Use promise-based query for async/await
        const [result] = await db.promise().query(query);
        const message = `Updated ${result.affectedRows} activities to 'Time Over'.`;
        return { success: true, message };
    } catch (error) {
        console.error('CRON ERROR: Failed to update activity statuses:', error);
        return { success: false, message: error.message };
    }
};

const updateActivityStatuses2 = async () => {
    try {
        const query = `
            UPDATE period_activities
            SET status = 'Finished(need to update performance)'
            WHERE status = 'In Progress'
              AND activity_date = CURDATE()
              AND end_time = CURTIME()
        `;
        // Use promise-based query for async/await
        const [result] = await db.promise().query(query);
        const message = `Updated ${result.affectedRows} activities to 'Finished(need to update performance)'.`;
        return { success: true, message };
    } catch (error) {
        console.error('CRON ERROR: Failed to update activity statuses:', error);
        return { success: false, message: error.message };
    }
};

/**
 * @description Generates entries in `period_activities` for the current day based on `daily_schedule`.
 * Runs once daily via cron job.
 */
const generateDailyPeriodActivities = async () => {
    try {
        // This query now populates period_activities directly. Add logic to determine batch and topic IDs.
        // NOTE: Determining topic_id and batch_number might require complex logic based on your curriculum rules.
        // This is a simplified example.
        const query = `
            INSERT INTO period_activities (daily_schedule_id, activity_date, activity_name, activity_type, topic_id, start_time, end_time, assigned_mentor_id, status, batch_number)
            SELECT 
                ds.id,
                CURDATE(),
                at.activity_type, -- Or a more descriptive name
                CASE 
                    WHEN at.activity_type = 'Assessment' THEN 'Assessment' 
                    ELSE 'Academic' 
                END,
                NULL, -- Placeholder for topic_id - requires logic to determine
                ds.start_time,
                ds.end_time,
                ds.mentors_id, -- Make sure daily_schedule has this populated
                'Schedule Created',
                1 -- Placeholder for batch_number - requires logic
            FROM daily_schedule ds
            JOIN activity_types at ON ds.activity = at.id
            WHERE ds.date = CURDATE()
            AND NOT EXISTS (SELECT 1 FROM period_activities WHERE daily_schedule_id = ds.id AND activity_date = CURDATE());
        `;
        const [result] = await db.promise().query(query);
        console.log(`CRON: Generated ${result.affectedRows} period activities for today.`);
    } catch (error) {
        console.error('CRON ERROR: Failed to generate period activities:', error);
    }
};


module.exports = {
    updateActivityStatuses,
    generateDailyPeriodActivities,
    updateActivityStatuses1,
    updateActivityStatuses2
};