const db = require('../../config/db');

// Create daily schedule with multiple activities
exports.createDailySchedule = async (req, res) => {
    try {
        const {
            date, gradeId, sectionId, subjectId, periodNumber,
            startTime, endTime, venueId, isEca, activities
        } = req.body;
        const coordinatorId = req.user.id;

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            // Create main schedule entry
            const scheduleQuery = `
                    INSERT INTO daily_schedule_new 
                    (date, grade_id, section_id, subject_id, period_number, start_time, end_time, venue_id, created_by_coordinator_id, is_eca)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

            const [scheduleResult] = await db.query(scheduleQuery, [
                date, gradeId, sectionId, subjectId, periodNumber, startTime, endTime, venueId, coordinatorId, isEca
            ]);

            const scheduleId = scheduleResult.insertId;

            // Add activities to the period
            if (activities && activities.length > 0) {
                for (const activity of activities) {
                    const activityQuery = `
                            INSERT INTO period_activities 
                            (daily_schedule_id, activity_name, activity_type, batch_ids, topic_id, material_id,
                             start_time, duration, max_participants, assigned_mentor_id, activity_instructions, is_assessment, assessment_weightage)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                    await db.query(activityQuery, [
                        scheduleId, activity.activityName, activity.activityType,
                        JSON.stringify(activity.batchIds), activity.topicId, activity.materialId,
                        activity.startTime, activity.duration, activity.maxParticipants,
                        activity.assignedMentorId, activity.activityInstructions,
                        activity.isAssessment, activity.assessmentWeightage
                    ]);
                }
            }

            await db.query('COMMIT');

            res.json({
                success: true,
                message: 'Daily schedule created successfully',
                data: { scheduleId }
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Create daily schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create daily schedule',
            error: error.message
        });
    }
};

// Get daily schedule with activities
exports.getDailySchedule = async (req, res) => {
    try {
        const { date, sectionId } = req.params;

        const query = `
                SELECT 
                    ds.*, 
                    g.grade_name, sec.section_name, sub.subject_name, v.name as venue_name,
                    pa.id as activity_id, pa.activity_name, pa.activity_type, pa.batch_ids,
                    pa.start_time as activity_start_time, pa.duration, pa.max_participants,
                    pa.activity_instructions, pa.is_assessment, pa.assessment_weightage,
                    pa.is_completed, pa.completion_notes,
                    th.topic_name, tm.activity_name as material_name,
                    m.roll as mentor_roll, m.phone as mentor_phone
                FROM daily_schedule_new ds
                JOIN grades g ON ds.grade_id = g.id
                JOIN sections sec ON ds.section_id = sec.id
                JOIN subjects sub ON ds.subject_id = sub.id
                JOIN venues v ON ds.venue_id = v.id
                LEFT JOIN period_activities pa ON ds.id = pa.daily_schedule_id
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN topic_materials tm ON pa.material_id = tm.id
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                WHERE ds.date = ? AND ds.section_id = ?
                ORDER BY ds.period_number, pa.start_time
            `;

        const [schedule] = await db.query(query, [date, sectionId]);

        // Group activities by schedule
        const groupedSchedule = {};
        schedule.forEach(row => {
            const scheduleKey = row.id;
            if (!groupedSchedule[scheduleKey]) {
                groupedSchedule[scheduleKey] = {
                    id: row.id,
                    date: row.date,
                    period_number: row.period_number,
                    start_time: row.start_time,
                    end_time: row.end_time,
                    subject_name: row.subject_name,
                    venue_name: row.venue_name,
                    grade_name: row.grade_name,
                    section_name: row.section_name,
                    is_eca: row.is_eca,
                    activities: []
                };
            }

            if (row.activity_id) {
                groupedSchedule[scheduleKey].activities.push({
                    id: row.activity_id,
                    activity_name: row.activity_name,
                    activity_type: row.activity_type,
                    batch_ids: JSON.parse(row.batch_ids || '[]'),
                    topic_name: row.topic_name,
                    material_name: row.material_name,
                    activity_start_time: row.activity_start_time,
                    duration: row.duration,
                    max_participants: row.max_participants,
                    activity_instructions: row.activity_instructions,
                    is_assessment: row.is_assessment,
                    assessment_weightage: row.assessment_weightage,
                    is_completed: row.is_completed,
                    completion_notes: row.completion_notes,
                    mentor_roll: row.mentor_roll,
                    mentor_phone: row.mentor_phone
                });
            }
        });

        res.json({
            success: true,
            data: Object.values(groupedSchedule)
        });
    } catch (error) {
        console.error('Get daily schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch daily schedule',
            error: error.message
        });
    }
};

// Get weekly schedule template
exports.getWeeklySchedule = async (req, res) => {
    try {
        const { sectionId, weekStart } = req.params;

        const query = `
                SELECT 
                    ds.date, 
                    DAYNAME(ds.date) as day_name,
                    ds.period_number,
                    ds.start_time,
                    ds.end_time,
                    sub.subject_name,
                    v.name as venue_name,
                    COUNT(pa.id) as activity_count,
                    ds.is_eca
                FROM daily_schedule_new ds
                JOIN subjects sub ON ds.subject_id = sub.id
                JOIN venues v ON ds.venue_id = v.id
                LEFT JOIN period_activities pa ON ds.id = pa.daily_schedule_id
                WHERE ds.section_id = ? 
                AND ds.date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)
                GROUP BY ds.id, ds.date, ds.period_number, ds.start_time, ds.end_time, sub.subject_name, v.name, ds.is_eca
                ORDER BY ds.date, ds.period_number
            `;

        const [schedule] = await db.query(query, [sectionId, weekStart, weekStart]);

        res.json({
            success: true,
            data: schedule
        });
    } catch (error) {
        console.error('Get weekly schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weekly schedule',
            error: error.message
        });
    }
};

// Update activity in schedule
exports.updateScheduleActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const {
            activityName, activityType, batchIds, topicId, materialId,
            startTime, duration, maxParticipants, assignedMentorId,
            activityInstructions, isAssessment, assessmentWeightage
        } = req.body;

        const query = `
                UPDATE period_activities SET
                activity_name = ?, activity_type = ?, batch_ids = ?, topic_id = ?, material_id = ?,
                start_time = ?, duration = ?, max_participants = ?, assigned_mentor_id = ?,
                activity_instructions = ?, is_assessment = ?, assessment_weightage = ?
                WHERE id = ?
            `;

        await db.query(query, [
            activityName, activityType, JSON.stringify(batchIds), topicId, materialId,
            startTime, duration, maxParticipants, assignedMentorId,
            activityInstructions, isAssessment, assessmentWeightage, activityId
        ]);

        res.json({
            success: true,
            message: 'Activity updated successfully'
        });
    } catch (error) {
        console.error('Update schedule activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update activity',
            error: error.message
        });
    }
};

// Mark activity as completed
exports.markActivityCompleted = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { completionNotes } = req.body;

        const query = `
                UPDATE period_activities 
                SET is_completed = 1, completion_notes = ?
                WHERE id = ?
            `;

        await db.query(query, [completionNotes, activityId]);

        res.json({
            success: true,
            message: 'Activity marked as completed'
        });
    } catch (error) {
        console.error('Mark activity completed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark activity as completed',
            error: error.message
        });
    }
};

// Get available mentors for time slot
exports.getAvailableMentors = async (req, res) => {
    try {
        const { date, startTime, endTime, subjectId, gradeId } = req.params;

        const query = `
                SELECT DISTINCT m.id, m.roll, m.phone, u.name
                FROM mentors m
                JOIN mentor_grade_subject_assignments mgsa ON m.id = mgsa.mentor_id
                JOIN users u ON m.phone = u.phone
                WHERE mgsa.grade_id = ? 
                AND mgsa.subject_id = ? 
                AND mgsa.is_active = 1
                AND m.id NOT IN (
                    SELECT DISTINCT pa.assigned_mentor_id
                    FROM period_activities pa
                    JOIN daily_schedule_new ds ON pa.daily_schedule_id = ds.id
                    WHERE ds.date = ?
                    AND pa.start_time < ?
                    AND TIME_ADD(pa.start_time, INTERVAL pa.duration MINUTE) > ?
                    AND pa.assigned_mentor_id IS NOT NULL
                )
                ORDER BY mgsa.is_primary DESC, u.name
            `;

        const [mentors] = await db.query(query, [gradeId, subjectId, date, endTime, startTime]);

        res.json({
            success: true,
            data: mentors
        });
    } catch (error) {
        console.error('Get available mentors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available mentors',
            error: error.message
        });
    }
};

// Get available venues for time slot
exports.getAvailableVenues = async (req, res) => {
    try {
        const { date, startTime, endTime, subjectId, gradeId } = req.params;

        const query = `
                SELECT v.id, v.name, v.capacity, v.type, v.block, v.floor
                FROM venues v
                LEFT JOIN venue_subjects vs ON v.id = vs.venue_id
                LEFT JOIN venue_grades vg ON v.id = vg.venue_id
                WHERE v.status = 'Active'
                AND (vs.subject_id = ? OR vs.subject_id IS NULL)
                AND (vg.grade_id = ? OR vg.grade_id IS NULL)
                AND v.id NOT IN (
                    SELECT DISTINCT ds.venue_id
                    FROM daily_schedule_new ds
                    WHERE ds.date = ?
                    AND ds.start_time < ?
                    AND ds.end_time > ?
                )
                ORDER BY v.capacity DESC, v.name
            `;

        const [venues] = await db.query(query, [subjectId, gradeId, date, endTime, startTime]);

        res.json({
            success: true,
            data: venues
        });
    } catch (error) {
        console.error('Get available venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available venues',
            error: error.message
        });
    }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            // Delete activities first
            await db.query('DELETE FROM period_activities WHERE daily_schedule_id = ?', [scheduleId]);

            // Delete schedule
            await db.query('DELETE FROM daily_schedule_new WHERE id = ?', [scheduleId]);

            await db.query('COMMIT');

            res.json({
                success: true,
                message: 'Schedule deleted successfully'
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete schedule',
            error: error.message
        });
    }
};

// Copy schedule to multiple dates
exports.copySchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { targetDates } = req.body;

        // Get original schedule
        const [originalSchedule] = await db.query(
            'SELECT * FROM daily_schedule_new WHERE id = ?',
            [scheduleId]
        );

        if (!originalSchedule.length) {
            return res.status(404).json({
                success: false,
                message: 'Original schedule not found'
            });
        }

        const original = originalSchedule[0];

        // Get original activities
        const [originalActivities] = await db.query(
            'SELECT * FROM period_activities WHERE daily_schedule_id = ?',
            [scheduleId]
        );

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            for (const targetDate of targetDates) {
                // Create new schedule
                const [newScheduleResult] = await db.query(`
                        INSERT INTO daily_schedule_new 
                        (date, grade_id, section_id, subject_id, period_number, start_time, end_time, venue_id, created_by_coordinator_id, is_eca)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                    targetDate, original.grade_id, original.section_id, original.subject_id,
                    original.period_number, original.start_time, original.end_time,
                    original.venue_id, original.created_by_coordinator_id, original.is_eca
                ]);

                const newScheduleId = newScheduleResult.insertId;

                // Copy activities
                for (const activity of originalActivities) {
                    await db.query(`
                            INSERT INTO period_activities 
                            (daily_schedule_id, activity_name, activity_type, batch_ids, topic_id, material_id,
                             start_time, duration, max_participants, assigned_mentor_id, activity_instructions, is_assessment, assessment_weightage)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                        newScheduleId, activity.activity_name, activity.activity_type,
                        activity.batch_ids, activity.topic_id, activity.material_id,
                        activity.start_time, activity.duration, activity.max_participants,
                        activity.assigned_mentor_id, activity.activity_instructions,
                        activity.is_assessment, activity.assessment_weightage
                    ]);
                }
            }

            await db.query('COMMIT');

            res.json({
                success: true,
                message: `Schedule copied to ${targetDates.length} dates successfully`
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Copy schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to copy schedule',
            error: error.message
        });
    }
};

// Enhanced Academic Schedule Functions

// Get weekly template for grade
exports.getWeeklyTemplate = async (req, res) => {
    try {
        const { gradeId } = req.params;

        const query = `
                SELECT ws.*, 
                       s.subject_name,
                       v.venue_name,
                       sec.section_name
                FROM weekly_schedule ws
                LEFT JOIN subjects s ON ws.subject_id = s.id
                LEFT JOIN venues v ON ws.venue_id = v.id
                LEFT JOIN sections sec ON ws.section_id = sec.id
                WHERE ws.grade_id = ?
                ORDER BY ws.day_of_week, ws.period_number
            `;

        const [results] = await db.query(query, [gradeId]);

        // Group by day of week
        const weeklyTemplate = {};
        results.forEach(row => {
            const dayName = row.day_of_week;
            if (!weeklyTemplate[dayName]) {
                weeklyTemplate[dayName] = [];
            }
            weeklyTemplate[dayName].push({
                id: row.id,
                period_number: row.period_number,
                subject_id: row.subject_id,
                subject_name: row.subject_name,
                section_id: row.section_id,
                section_name: row.section_name,
                venue_id: row.venue_id,
                venue_name: row.venue_name,
                timeStart: row.time_start,
                timeEnd: row.time_end
            });
        });

        res.json({
            success: true,
            data: weeklyTemplate
        });
    } catch (error) {
        console.error('Get weekly template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weekly template',
            error: error.message
        });
    }
};

// Get monthly schedule based on weekly template
exports.getMonthlySchedule = async (req, res) => {
    try {
        const { gradeId, month, year } = req.params;

        // Generate dates for the month and get daily schedules
        const monthlySchedule = [];
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dateString = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

            // Skip Sundays or add weekend handling
            if (dayName !== 'Sunday') {
                // Get daily schedule for this date - using the correct table structure
                const dailyQuery = `
                        SELECT 
                            dsn.id,
                            dsn.date,
                            dsn.period_number,
                            dsn.start_time,
                            dsn.end_time,
                            s.subject_name,
                            v.name as venue_name,
                            sec.section_name,
                            COUNT(pa.id) as activity_count
                        FROM daily_schedule_new dsn
                        LEFT JOIN subjects s ON dsn.subject_id = s.id
                        LEFT JOIN venues v ON dsn.venue_id = v.id  
                        LEFT JOIN sections sec ON dsn.section_id = sec.id
                        LEFT JOIN period_activities pa ON dsn.id = pa.daily_schedule_id
                        WHERE dsn.date = ? AND dsn.grade_id = ?
                        GROUP BY dsn.id
                        ORDER BY dsn.period_number
                    `;

                const [daySchedule] = await db.query(dailyQuery, [dateString, gradeId]);

                if (daySchedule.length > 0) {
                    monthlySchedule.push({
                        date: dateString,
                        day_name: dayName,
                        periods: daySchedule.map(period => ({
                            id: period.id,
                            period_number: period.period_number,
                            timeStart: period.start_time,
                            timeEnd: period.end_time,
                            subject_name: period.subject_name,
                            venue_name: period.venue_name,
                            section_name: period.section_name,
                            activity_count: period.activity_count
                        }))
                    });
                }
            }
        }

        res.json({
            success: true,
            data: monthlySchedule
        });
    } catch (error) {
        console.error('Get monthly schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly schedule',
            error: error.message
        });
    }
}

// Get period activities for a specific period and date
exports.getPeriodActivities = async (req, res) => {
    try {
        const { period_id, date } = req.query;

        const query = `
                SELECT 
                    pa.*,
                    th.topic_name,
                    tm.activity_name as material_name,
                    m.roll as mentor_roll,
                    u.name as mentor_name,
                    aba.batch_number,
                    aba.activity_status as batch_status,
                    aba.max_students
                FROM period_activities pa
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN topic_materials tm ON pa.material_id = tm.id
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN users u ON m.phone = u.phone
                LEFT JOIN activity_batch_assignments aba ON pa.id = aba.period_activity_id
                WHERE pa.daily_schedule_id = ?
                ORDER BY pa.start_time, aba.batch_number
            `;

        const [activities] = await db.query(query, [period_id]);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Get period activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch period activities',
            error: error.message
        });
    }
};

// Create new period activity 
exports.createPeriodActivity = async (req, res) => {
    try {
        const {
            period_id,
            date,
            activity_type,
            duration_minutes,
            batch_number,
            mentor_id,
            topic_id,
            has_assessment,
            assessment_type,
            total_marks
        } = req.body;

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            // Get the daily schedule info
            const [scheduleInfo] = await db.query(
                'SELECT start_time, subject_id FROM daily_schedule WHERE id = ?',
                [period_id]
            );

            if (!scheduleInfo.length) {
                throw new Error('Period not found');
            }

            const { start_time, subject_id } = scheduleInfo[0];

            // Calculate activity start time (you can modify this logic)
            const activityStartTime = start_time; // or calculate based on existing activities

            // Create the period activity using your existing table structure
            const [activityResult] = await db.query(`
                    INSERT INTO period_activities (
                        daily_schedule_id, activity_name, activity_type, batch_ids,
                        topic_id, material_id, start_time, duration, assigned_mentor_id,
                        is_assessment, assessment_weightage, activity_instructions
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                period_id,
                `${activity_type} - Batch ${batch_number}`,
                activity_type,
                JSON.stringify([batch_number]),
                topic_id,
                null, // material_id 
                activityStartTime,
                duration_minutes,
                mentor_id,
                has_assessment,
                total_marks,
                `Activity for batch ${batch_number}`
            ]);

            const activityId = activityResult.insertId;

            // Create batch assignment record if using enhanced tables
            if (has_assessment) {
                // Create assessment tracking record
                await db.query(`
                        INSERT INTO period_assessment_tracking (
                            period_activity_id, assessment_date, subject_id, topic_id,
                            assessment_type, total_marks, batch_numbers, assigned_mentor_id
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                    activityId, date, subject_id, topic_id,
                    assessment_type, total_marks, JSON.stringify([batch_number]), mentor_id
                ]);
            }

            await db.query('COMMIT');

            res.json({
                success: true,
                message: 'Activity created successfully',
                data: { activityId }
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Create period activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create activity',
            error: error.message
        });
    }
};

// Get monthly schedule alternative
exports.getMonthlyScheduleAlt = async (req, res) => {
    try {
        const { gradeId, month, year } = req.params;

        const query = `
                SELECT dsn.*, sec.section_name, sub.subject_name, ven.name as venue_name
                FROM daily_schedule_new dsn
                LEFT JOIN sections sec ON dsn.section_id = sec.id
                LEFT JOIN subjects sub ON dsn.subject_id = sub.id
                LEFT JOIN venues ven ON dsn.venue_id = ven.id
                WHERE MONTH(dsn.date) = ? AND YEAR(dsn.date) = ? AND dsn.grade_id = ?
                ORDER BY dsn.date, dsn.period_number
            `;

        const [results] = await db.query(query, [month, year, gradeId]);

        const monthlySchedule = [];
        for (const row of results) {
            const date = new Date(row.date);
            const dayName = date.toLocaleString('default', { weekday: 'long' });
            const daySchedule = monthlySchedule.find(item => item.date === date.toISOString().split('T')[0]);
            if (daySchedule) {
                daySchedule.periods.push({
                    id: row.id,
                    period_number: row.period_number,
                    subject_id: row.subject_id,
                    subject_name: row.subject_name,
                    section_id: row.section_id,
                    section_name: row.section_name,
                    venue_id: row.venue_id,
                    venue_name: row.venue_name,
                    timeStart: row.start_time,
                    timeEnd: row.end_time
                });
            } else {
                monthlySchedule.push({
                    date: date.toISOString().split('T')[0],
                    dayName: dayName,
                    periods: daySchedule.map(period => ({
                        id: period.id,
                        period_number: period.period_number,
                        subject_id: period.subject_id,
                        subject_name: period.subject_name,
                        section_id: period.section_id,
                        section_name: period.section_name,
                        venue_id: period.venue_id,
                        venue_name: period.venue_name,
                        timeStart: period.start_time,
                        timeEnd: period.end_time
                    }))
                });
            }
        }

        res.json({
            success: true,
            data: monthlySchedule
        });
    } catch (error) {
        console.error('Get monthly schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly schedule',
            error: error.message
        });
    }
};

// Get period activities for a specific date and period (alternative implementation)
exports.getPeriodActivitiesAlt = async (req, res) => {
    try {
        const { periodId, date } = req.params;

        const query = `
                SELECT pa.*, 
                       u.name as mentor_name,
                       m.roll as mentor_roll,
                       th.topic_name,
                       tm.activity_name as material_title
                FROM period_activities pa
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN users u ON m.phone = u.phone
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN topic_materials tm ON pa.material_id = tm.id
                WHERE pa.daily_schedule_id = ? AND pa.activity_date = ?
                ORDER BY pa.start_time
            `;

        const [results] = await db.query(query, [periodId, date]);

        res.json({
            success: true,
            data: results.map(row => ({
                id: row.id,
                activity_type: row.activity_type,
                duration_minutes: row.duration,
                batch_number: row.batch_number,
                mentor_id: row.assigned_mentor_id,
                mentor_name: row.mentor_name,
                mentor_roll: row.mentor_roll,
                topic_id: row.topic_id,
                topic_name: row.topic_name,
                material_id: row.material_id,
                material_title: row.material_title,
                has_assessment: row.is_assessment,
                assessment_type: row.assessment_type,
                total_marks: row.total_marks,
                start_time: row.start_time,
                activity_instructions: row.activity_instructions
            }))
        });
    } catch (error) {
        console.error('Get period activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch period activities',
            error: error.message
        });
    }
};

// Create period activity (split period into activities)
exports.createPeriodActivitySplit = async (req, res) => {
    try {
        const {
            period_id, date, activity_type, duration_minutes, batch_number,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks
        } = req.body;

        // Calculate start time based on existing activities
        const existingQuery = `
                SELECT SUM(duration) as total_duration 
                FROM period_activities 
                WHERE daily_schedule_id = ? AND activity_date = ?
            `;

        const [existing] = await db.query(existingQuery, [period_id, date]);
        const startOffset = existing[0]?.total_duration || 0;

        // Get the period's start time from daily_schedule_new
        const periodQuery = `
                SELECT start_time FROM daily_schedule_new WHERE id = ?
            `;
        const [periodResult] = await db.query(periodQuery, [period_id]);

        if (periodResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Period not found'
            });
        }

        // Calculate activity start time
        const periodStartTime = periodResult[0].start_time;
        const activityStartTime = new Date(`1970-01-01 ${periodStartTime}`);
        activityStartTime.setMinutes(activityStartTime.getMinutes() + startOffset);

        const insertQuery = `
                INSERT INTO period_activities 
                (daily_schedule_id, activity_date, activity_name, activity_type, duration, batch_number,
                 assigned_mentor_id, topic_id, is_assessment, assessment_type, total_marks,
                 start_time, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

        const [result] = await db.query(insertQuery, [
            period_id, date, activity_type || 'Academic Activity', activity_type, duration_minutes, batch_number,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks,
            activityStartTime.toTimeString().slice(0, 8)
        ]);

        res.json({
            success: true,
            message: 'Activity created successfully',
            data: { activityId: result.insertId }
        });
    } catch (error) {
        console.error('Create period activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create activity',
            error: error.message
        });
    }
};

// Update period activity
exports.updatePeriodActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const {
            activity_type, duration_minutes, batch_number,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks
        } = req.body;

        const updateQuery = `
                UPDATE period_activities 
                SET activity_type = ?, duration = ?, batch_number = ?,
                    assigned_mentor_id = ?, topic_id = ?, is_assessment = ?,
                    assessment_type = ?, total_marks = ?, updated_at = NOW()
                WHERE id = ?
            `;

        await db.query(updateQuery, [
            activity_type, duration_minutes, batch_number,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks,
            activityId
        ]);

        res.json({
            success: true,
            message: 'Activity updated successfully'
        });
    } catch (error) {
        console.error('Update period activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update activity',
            error: error.message
        });
    }
};

// Delete period activity
exports.deletePeriodActivity = async (req, res) => {
    try {
        const { activityId } = req.params;

        const deleteQuery = `DELETE FROM period_activities WHERE id = ?`;
        await db.query(deleteQuery, [activityId]);

        res.json({
            success: true,
            message: 'Activity deleted successfully'
        });
    } catch (error) {
        console.error('Delete period activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete activity',
            error: error.message
        });
    }
};

// Get batch activities for a specific date
exports.getBatchActivities = async (req, res) => {
    try {
        const { batchId, date } = req.params;

        const query = `
                SELECT pa.*, 
                       ws.subject_id,
                       s.subject_name,
                       ws.time_start,
                       ws.time_end,
                       v.venue_name,
                       m.name as mentor_name,
                       th.topic_name
                FROM period_activities pa
                JOIN weekly_schedule ws ON pa.weekly_schedule_id = ws.id
                LEFT JOIN subjects s ON ws.subject_id = s.id
                LEFT JOIN venues v ON ws.venue_id = v.id
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                WHERE pa.batch_number = ? AND pa.activity_date = ?
                ORDER BY pa.start_time
            `;

        const [results] = await db.query(query, [batchId, date]);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Get batch activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch batch activities',
            error: error.message
        });
    }
};
