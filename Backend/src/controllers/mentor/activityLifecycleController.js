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
  const now = new Date();
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const currentTime = now.toTimeString().substring(0, 8);
  const currentDate = now.toISOString().split('T')[0];

  const query = `
    SELECT ds.venue_id
    FROM daily_schedule ds 
    JOIN period_activities pa ON ds.id = pa.dsn_id
    WHERE pa.activity_date = ? 
    AND pa.start_time <= ? 
    AND pa.end_time >= ?
    AND pa.status != 'Finished(need to update performance)'
    AND pa.status != 'Completed'
    AND pa.status != 'Cancelled'
    AND ds.venue_id IS NOT NULL`;

  db.query(query, [currentDate, currentTime, currentTime], (err, results) => {
    if (err) {
      console.error('Error checking active sessions:', err);
      return;
    }

    const activeVenueIds = results.map(r => r.venue_id);
    const placeholders = activeVenueIds.length > 0
      ? activeVenueIds.map(() => '?').join(',')
      : 'NULL';

    const updateQuery = `
      UPDATE venues 
      SET status = CASE 
        WHEN id IN (${placeholders}) THEN 'Active' 
        ELSE 'InActive' 
      END`;

    db.query(updateQuery, activeVenueIds, (err) => {
      if (err) {
        console.error('Error updating venue statuses:', err);
      }
    });
  });
};


module.exports = {
    updateActivityStatuses,
    generateDailyPeriodActivities,
    updateActivityStatuses1,
    updateVenueStatusBasedOnSchedule
};