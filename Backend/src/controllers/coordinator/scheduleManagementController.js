const db = require('../../config/db');

class ScheduleManagementController {
    // Create daily schedule with multiple activities
    static async createDailySchedule(req, res) {
        try {
            const {
                date, gradeId, sectionId, subjectId, periodNumber,
                startTime, endTime, venueId, isEca, activities
            } = req.body;
            const coordinatorId = req.user.id;

            // Start transaction
            await db.execute('START TRANSACTION');

            try {
                // Create main schedule entry
                const scheduleQuery = `
                    INSERT INTO daily_schedule_new 
                    (date, grade_id, section_id, subject_id, period_number, start_time, end_time, venue_id, created_by_coordinator_id, is_eca)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const [scheduleResult] = await db.execute(scheduleQuery, [
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

                        await db.execute(activityQuery, [
                            scheduleId, activity.activityName, activity.activityType,
                            JSON.stringify(activity.batchIds), activity.topicId, activity.materialId,
                            activity.startTime, activity.duration, activity.maxParticipants,
                            activity.assignedMentorId, activity.activityInstructions,
                            activity.isAssessment, activity.assessmentWeightage
                        ]);
                    }
                }

                await db.execute('COMMIT');

                res.json({
                    success: true,
                    message: 'Daily schedule created successfully',
                    data: { scheduleId }
                });
            } catch (error) {
                await db.execute('ROLLBACK');
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
    }

    // Get daily schedule with activities
    static async getDailySchedule(req, res) {
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

            const [schedule] = await db.execute(query, [date, sectionId]);

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
    }

    // Get weekly schedule template
    static async getWeeklySchedule(req, res) {
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

            const [schedule] = await db.execute(query, [sectionId, weekStart, weekStart]);

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
    }

    // Update activity in schedule
    static async updateScheduleActivity(req, res) {
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

            await db.execute(query, [
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
    }

    // Mark activity as completed
    static async markActivityCompleted(req, res) {
        try {
            const { activityId } = req.params;
            const { completionNotes } = req.body;

            const query = `
                UPDATE period_activities 
                SET is_completed = 1, completion_notes = ?
                WHERE id = ?
            `;

            await db.execute(query, [completionNotes, activityId]);

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
    }

    // Get available mentors for time slot
    static async getAvailableMentors(req, res) {
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

            const [mentors] = await db.execute(query, [gradeId, subjectId, date, endTime, startTime]);

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
    }

    // Get available venues for time slot
    static async getAvailableVenues(req, res) {
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

            const [venues] = await db.execute(query, [subjectId, gradeId, date, endTime, startTime]);

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
    }

    // Delete schedule
    static async deleteSchedule(req, res) {
        try {
            const { scheduleId } = req.params;

            // Start transaction
            await db.execute('START TRANSACTION');

            try {
                // Delete activities first
                await db.execute('DELETE FROM period_activities WHERE daily_schedule_id = ?', [scheduleId]);
                
                // Delete schedule
                await db.execute('DELETE FROM daily_schedule_new WHERE id = ?', [scheduleId]);

                await db.execute('COMMIT');

                res.json({
                    success: true,
                    message: 'Schedule deleted successfully'
                });
            } catch (error) {
                await db.execute('ROLLBACK');
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
    }

    // Copy schedule to multiple dates
    static async copySchedule(req, res) {
        try {
            const { scheduleId } = req.params;
            const { targetDates } = req.body;

            // Get original schedule
            const [originalSchedule] = await db.execute(
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
            const [originalActivities] = await db.execute(
                'SELECT * FROM period_activities WHERE daily_schedule_id = ?',
                [scheduleId]
            );

            // Start transaction
            await db.execute('START TRANSACTION');

            try {
                for (const targetDate of targetDates) {
                    // Create new schedule
                    const [newScheduleResult] = await db.execute(`
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
                        await db.execute(`
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

                await db.execute('COMMIT');

                res.json({
                    success: true,
                    message: `Schedule copied to ${targetDates.length} dates successfully`
                });
            } catch (error) {
                await db.execute('ROLLBACK');
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
    }
}

module.exports = ScheduleManagementController;
