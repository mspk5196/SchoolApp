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
        const query2 = `
            UPDATE academic_sessions
            SET status = 'Not Started'
            WHERE status = 'Schedule Created'
              AND date = CURDATE()
              AND start_time <= CURTIME()
        `;
        const query3 = `
            UPDATE assessment_sessions
            SET status = 'Not Started'
            WHERE status = 'Schedule Created'
              AND date = CURDATE()
              AND start_time <= CURTIME()
        `;
        // Use promise-based query for async/await
        const [result] = await db.promise().query(query);
        const [result2] = await db.promise().query(query2);
        const [result3] = await db.promise().query(query3);
        const message = `Updated ${result.affectedRows} activities to 'Not Started'.`;
        const message2 = `Updated ${result2.affectedRows} academic sessions to 'Not Started'.`;
        const message3 = `Updated ${result3.affectedRows} assessment sessions to 'Not Started'.`;
        return { success: true, message: message + ' ' + message2 + ' ' + message3 };
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
        const query2 = `
            UPDATE academic_sessions
            SET status = 'Time Over'
            WHERE status = 'Not Started'
              AND date = CURDATE()
              AND end_time <= CURTIME()
        `;
        const query3 = `
            UPDATE assessment_sessions
            SET status = 'Time Over'
            WHERE status = 'Not Started'
              AND date = CURDATE()
              AND end_time <= CURTIME()
        `;
        // Use promise-based query for async/await
        const [result] = await db.promise().query(query);
        const [result2] = await db.promise().query(query2);
        const [result3] = await db.promise().query(query3);
        const message = `Updated ${result.affectedRows} activities to 'Time Over'.`;
        const message2 = `Updated ${result2.affectedRows} academic sessions to 'Time Over'.`;
        const message3 = `Updated ${result3.affectedRows} assessment sessions to 'Time Over'.`;
        return { success: true, message: message + ' ' + message2 + ' ' + message3 };
    } catch (error) {
        console.error('CRON ERROR: Failed to update activity statuses:', error);
        return { success: false, message: error.message };
    }
};
const updateActivityStatuses2 = async () => {
    try {
        // const query = `
        //     UPDATE period_activities
        //     SET status = 'Time Over'
        //     WHERE status = 'Not Started'
        //       AND activity_date = CURDATE()
        //       AND end_time <= CURTIME()
        // `;
        const query2 = `
            UPDATE academic_sessions
            SET status = 'Finished(need to update performance)'
            WHERE status = 'In Progress'
              AND date = CURDATE()
              AND end_time <= CURTIME()
        `;
        const query3 = `
            UPDATE assessment_sessions
            SET status = 'Finished(need to update performance)'
            WHERE status = 'In Progress'
              AND date = CURDATE()
              AND end_time <= CURTIME()
        `;
        // Use promise-based query for async/await
        // const [result] = await db.promise().query(query);
        const [result2] = await db.promise().query(query2);
        const [result3] = await db.promise().query(query3);
        // const message = `Updated ${result.affectedRows} activities to 'Time Over'.`;
        const message2 = `Updated ${result2.affectedRows} academic sessions to 'Finished(need to update performance)'.`;
        const message3 = `Updated ${result3.affectedRows} assessment sessions to 'Finished(need to update performance)'.`;
        return { success: true, message: message2 + ' ' + message3 };
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

// Update venue status based on current schedule
const updateVenueStatusBasedOnSchedule = () => {
  return new Promise((resolve, reject) => {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 8);
      const currentDate = now.toISOString().split('T')[0];

      const query = `
        SELECT DISTINCT ds.venue_id
        FROM daily_schedule ds 
        JOIN period_activities pa ON ds.id = pa.dsn_id
        WHERE pa.activity_date = ? 
        AND pa.start_time <= ? 
        AND pa.end_time >= ?
        AND pa.status IN ('Not Started', 'In Progress')
        AND ds.venue_id IS NOT NULL`;

      db.query(query, [currentDate, currentTime, currentTime], (err, results) => {
        if (err) {
          console.error('Error checking active sessions:', err);
          return reject(err);
        }

        const activeVenueIds = results.map(r => r.venue_id);
        
        let updateQuery;
        let queryParams = [];

        if (activeVenueIds.length > 0) {
          const placeholders = activeVenueIds.map(() => '?').join(',');
          updateQuery = `
            UPDATE venues 
            SET status = CASE 
              WHEN id IN (${placeholders}) THEN 'Active' 
              ELSE 'InActive' 
            END`;
          queryParams = activeVenueIds;
        } else {
          // If no active venues, set all to InActive
          updateQuery = `UPDATE venues SET status = 'InActive'`;
        }

        db.query(updateQuery, queryParams, (err, updateResult) => {
          if (err) {
            console.error('Error updating venue statuses:', err);
            return reject(err);
          }
          
          resolve({
            message: `Venue statuses updated successfully. ${activeVenueIds.length} venues are currently active.`,
            activeVenues: activeVenueIds.length,
            affectedRows: updateResult.affectedRows
          });
        });
      });
    } catch (error) {
      console.error('Error in updateVenueStatusBasedOnSchedule:', error);
      reject(error);
    }
  });
};


module.exports = {
    updateActivityStatuses,
    generateDailyPeriodActivities,
    updateActivityStatuses1,
    updateActivityStatuses2,
    updateVenueStatusBasedOnSchedule
};