const db = require('../../config/db');

// Create daily schedule with multiple activities
exports.createDailySchedule = (req, res) => {
    const {
        date, gradeId, sectionId, subjectId, periodNumber,
        startTime, endTime, venueId, isEca, activities
    } = req.body;
    const coordinatorId = req.user.id;

    // Start transaction
    db.query('START TRANSACTION', (err) => {
        if (err) {
            console.error('Transaction start error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to create daily schedule',
                error: err.message
            });
        }

        // Create main schedule entry
        const scheduleQuery = `
                INSERT INTO daily_schedule
                (date, grade_id, section_id, subject_id, period_number, start_time, end_time, venue_id, created_by_coordinator_id, is_eca)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

        db.query(scheduleQuery, [
            date, gradeId, sectionId, subjectId, periodNumber, startTime, endTime, venueId, coordinatorId, isEca
        ], (scheduleError, scheduleResult) => {
            if (scheduleError) {
                return db.query('ROLLBACK', () => {
                    console.error('Create daily schedule error:', scheduleError);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to create daily schedule',
                        error: scheduleError.message
                    });
                });
            }

            const scheduleId = scheduleResult.insertId;

            // Add activities to the period
            if (activities && activities.length > 0) {
                let completedActivities = 0;
                const totalActivities = activities.length;

                activities.forEach((activity, index) => {
                    const activityQuery = `
                            INSERT INTO period_activities 
                            (daily_schedule_id, activity_name, activity_type, batch_ids, topic_id, material_id,
                             start_time, duration, max_participants, assigned_mentor_id, activity_instructions, is_assessment, assessment_weightage)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                    db.query(activityQuery, [
                        scheduleId, activity.activityName, activity.activityType,
                        JSON.stringify(activity.batchIds), activity.topicId, activity.materialId,
                        activity.startTime, activity.duration, activity.maxParticipants,
                        activity.assignedMentorId, activity.activityInstructions,
                        activity.isAssessment, activity.assessmentWeightage
                    ], (activityError) => {
                        if (activityError) {
                            return db.query('ROLLBACK', () => {
                                console.error('Create activity error:', activityError);
                                res.status(500).json({
                                    success: false,
                                    message: 'Failed to create daily schedule',
                                    error: activityError.message
                                });
                            });
                        }

                        completedActivities++;
                        if (completedActivities === totalActivities) {
                            // All activities created successfully
                            db.query('COMMIT', (commitError) => {
                                if (commitError) {
                                    console.error('Commit error:', commitError);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Failed to create daily schedule',
                                        error: commitError.message
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: 'Daily schedule created successfully',
                                    data: { scheduleId }
                                });
                            });
                        }
                    });
                });
            } else {
                // No activities to add, commit the transaction
                db.query('COMMIT', (commitError) => {
                    if (commitError) {
                        console.error('Commit error:', commitError);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create daily schedule',
                            error: commitError.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Daily schedule created successfully',
                        data: { scheduleId }
                    });
                });
            }
        });
    });
};

// Get daily schedule with activities
exports.getDailySchedule = (req, res) => {
    const { date, sectionId } = req.params;

    const query = `
            SELECT 
                ds.*, 
                g.grade_name, sec.section_name, sub.subject_name, v.name as venue_name,
                pa.id as activity_id, pa.activity_name, pa.activity_type, pa.batch_ids,
                pa.start_time as activity_start_time, pa.duration, pa.max_participants,
                pa.activity_instructions, pa.is_assessment, pa.assessment_weightage,
                pa.is_completed, pa.completion_notes,
                th.topic_name, th.parent_id, th.subject_id as th_subject_id,
                tm.activity_name as material_name,
                m.roll as mentor_roll, m.phone as mentor_phone
            FROM daily_schedule ds
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

    db.query(query, [date, sectionId], (error, schedule) => {
        if (error) {
            console.error('Get daily schedule error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch daily schedule',
                error: error.message
            });
        }

        // Get all topics for hierarchy path building
        const subjectIds = [...new Set(schedule.map(row => row.th_subject_id).filter(id => id))];

        if (subjectIds.length === 0) {
            // Group activities by schedule without hierarchy
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
                        topic_hierarchy_path: null,
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

            return res.json({
                success: true,
                data: Object.values(groupedSchedule)
            });
        }

        // Get all topics for the subjects involved
        const topicsQuery = `
            SELECT id, parent_id, topic_name, subject_id
            FROM topic_hierarchy 
            WHERE subject_id IN (${subjectIds.map(() => '?').join(',')})
        `;

        db.query(topicsQuery, subjectIds, (err, allTopics) => {
            if (err) {
                console.error('Get topics for hierarchy error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch topic hierarchy',
                    error: err.message
                });
            }

            // Build hierarchy path function
            const buildHierarchyPath = (topicId, topics, path = []) => {
                const topic = topics.find(t => t.id === topicId);
                if (!topic) return path;

                path.unshift(topic.topic_name);

                if (topic.parent_id) {
                    return buildHierarchyPath(topic.parent_id, topics, path);
                }

                return path;
            };

            // Group activities by schedule with hierarchy
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
                    let hierarchyPath = null;
                    if (row.topic_name && row.parent_id) {
                        const fullPath = buildHierarchyPath(row.parent_id, allTopics);
                        hierarchyPath = fullPath.length > 0 ? fullPath.join(' > ') : null;
                    }

                    groupedSchedule[scheduleKey].activities.push({
                        id: row.activity_id,
                        activity_name: row.activity_name,
                        activity_type: row.activity_type,
                        batch_ids: JSON.parse(row.batch_ids || '[]'),
                        topic_name: row.topic_name,
                        topic_hierarchy_path: hierarchyPath,
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
        });
    });
};

// Get weekly schedule template
exports.getWeeklySchedule = (req, res) => {
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
            FROM daily_schedule ds
            JOIN subjects sub ON ds.subject_id = sub.id
            JOIN venues v ON ds.venue_id = v.id
            LEFT JOIN period_activities pa ON ds.id = pa.daily_schedule_id
            WHERE ds.section_id = ? 
            AND ds.date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)
            GROUP BY ds.id, ds.date, ds.period_number, ds.start_time, ds.end_time, sub.subject_name, v.name, ds.is_eca
            ORDER BY ds.date, ds.period_number
        `;

    db.query(query, [sectionId, weekStart, weekStart], (error, schedule) => {
        if (error) {
            console.error('Get weekly schedule error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch weekly schedule',
                error: error.message
            });
        }

        res.json({
            success: true,
            data: schedule
        });
    });
};

// Update activity in schedule
exports.updateScheduleActivity = (req, res) => {
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

        db.query(query, [
            activityName, activityType, JSON.stringify(batchIds), topicId, materialId,
            startTime, duration, maxParticipants, assignedMentorId,
            activityInstructions, isAssessment, assessmentWeightage, activityId
        ], (err, result) => {
            if (err) {
                console.error('Update schedule activity error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update activity',
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: 'Activity updated successfully'
            });
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
exports.markActivityCompleted = (req, res) => {
    try {
        const { activityId } = req.params;
        const { completionNotes } = req.body;

        const query = `
                UPDATE period_activities 
                SET is_completed = 1, completion_notes = ?
                WHERE id = ?
            `;

        db.query(query, [completionNotes, activityId], (err, result) => {
            if (err) {
                console.error('Mark activity completed error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to mark activity as completed',
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: 'Activity marked as completed'
            });
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
exports.getAvailableMentors = (req, res) => {
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
                    JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
                    WHERE ds.date = ?
                    AND pa.start_time < ?
                    AND TIME_ADD(pa.start_time, INTERVAL pa.duration MINUTE) > ?
                    AND pa.assigned_mentor_id IS NOT NULL
                )
                ORDER BY mgsa.is_primary DESC, u.name
            `;

        db.query(query, [gradeId, subjectId, date, endTime, startTime], (err, mentors) => {
            if (err) {
                console.error('Get available mentors error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch available mentors',
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: mentors
            });
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
exports.getAvailableVenues = (req, res) => {
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
                    FROM daily_schedule ds
                    WHERE ds.date = ?
                    AND ds.start_time < ?
                    AND ds.end_time > ?
                )
                ORDER BY v.capacity DESC, v.name
            `;

        db.query(query, [subjectId, gradeId, date, endTime, startTime], (err, venues) => {
            if (err) {
                console.error('Get available venues error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch available venues',
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: venues
            });
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
            await db.query('DELETE FROM daily_schedule WHERE id = ?', [scheduleId]);

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
            'SELECT * FROM daily_schedule WHERE id = ?',
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
                        INSERT INTO daily_schedule
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
exports.getMonthlySchedule = (req, res) => {
    try {
        const { gradeId, month, year, sectionId } = req.params;

        // Get all daily schedules for the month at once
        const query = `
            SELECT 
                dsn.id,
                dsn.date,
                dsn.period_number,
                dsn.start_time,
                dsn.end_time,
                s.subject_name,
                s.id as subject_id,
                v.name as venue_name,
                sec.section_name,
                sec.id as section_id,
                COUNT(pa.id) as activity_count
            FROM daily_schedule dsn
            LEFT JOIN subjects s ON dsn.subject_id = s.id
            LEFT JOIN venues v ON dsn.venue_id = v.id  
            LEFT JOIN sections sec ON dsn.section_id = sec.id
            LEFT JOIN period_activities pa ON dsn.id = pa.daily_schedule_id
            WHERE MONTH(dsn.date) = ? AND YEAR(dsn.date) = ? AND dsn.grade_id = ? AND dsn.section_id = ?
            GROUP BY dsn.id, dsn.date, dsn.period_number, dsn.start_time, dsn.end_time, 
                     s.subject_name, v.name, sec.section_name, s.id, sec.id
            ORDER BY dsn.date, dsn.period_number
        `;

        db.query(query, [month, year, gradeId], (err, scheduleData) => {
            if (err) {
                console.error('Monthly schedule query error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch monthly schedule',
                    error: err.message
                });
            }

            // Group the results by date
            const monthlySchedule = [];
            const groupedByDate = {};

            scheduleData.forEach(period => {
                const date = period.date.toISOString().split('T')[0];
                const dayName = new Date(period.date).toLocaleDateString('en-US', { weekday: 'long' });

                if (!groupedByDate[date]) {
                    groupedByDate[date] = {
                        date: date,
                        day_name: dayName,
                        periods: []
                    };
                }

                // Skip Sundays
                if (dayName !== 'Sunday') {
                    groupedByDate[date].periods.push({
                        id: period.id,
                        period_number: period.period_number,
                        timeStart: period.start_time,
                        timeEnd: period.end_time,
                        subject_name: period.subject_name,
                        venue_name: period.venue_name,
                        section_name: period.section_name,
                        activity_count: period.activity_count,
                        subject_id: period.subject_id,
                        section_id: period.section_id
                    });
                }
            });

            // Convert to array and sort by date
            Object.values(groupedByDate).forEach(daySchedule => {
                if (daySchedule.periods.length > 0) {
                    monthlySchedule.push(daySchedule);
                }
            });

            monthlySchedule.sort((a, b) => new Date(a.date) - new Date(b.date));

            res.json({
                success: true,
                data: monthlySchedule
            });
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

// Get period activities for a specific period and date
exports.getPeriodActivities = (req, res) => {
    try {
        const { periodId, date } = req.params;

        const query = `
                SELECT 
                    pa.*,
                    th.topic_name,
                    th.parent_id,
                    th.subject_id,
                    tm.activity_name as material_name,
                    m.roll as mentor_roll,
                    u.name as mentor_name
                FROM period_activities pa
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN topic_materials tm ON pa.material_id = tm.id
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN users u ON m.phone = u.phone
                WHERE pa.daily_schedule_id = ?
                ORDER BY pa.start_time
            `;

        db.query(query, [periodId], (err, activities) => {
            if (err) {
                console.error('Get period activities error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch period activities',
                    error: err.message
                });
            }

            // Get all topics for hierarchy path building
            const topicIds = activities.map(activity => activity.topic_id).filter(id => id);
            const subjectIds = [...new Set(activities.map(activity => activity.subject_id).filter(id => id))];

            if (topicIds.length === 0) {
                // Ensure uniqueness and proper formatting even without topics
                const seenIds = new Set();
                const formattedActivities = activities
                    .filter(activity => {
                        if (seenIds.has(activity.id)) {
                            return false; // Skip duplicate
                        }
                        seenIds.add(activity.id);
                        return true;
                    })
                    .map(activity => ({
                        id: activity.id,
                        dailyScheduleId: activity.daily_schedule_id,
                        activity_type: activity.activity_type || '',
                        activity_name: activity.activity_name || '',
                        duration: activity.duration || activity.duration_minutes || 0,
                        batch_number: activity.batch_number || 1,
                        mentor_id: activity.assigned_mentor_id,
                        mentor_name: activity.mentor_name || '',
                        mentor_roll: activity.mentor_roll || '',
                        topic_id: activity.topic_id,
                        topic_name: activity.topic_name || '',
                        topic_hierarchy_path: null,
                        material_id: activity.material_id,
                        material_name: activity.material_name || '',
                        has_assessment: activity.is_assessment || false,
                        assessment_type: activity.assessment_type || '',
                        total_marks: activity.total_marks || 0,
                        start_time: activity.start_time,
                        end_time: activity.end_time,
                        activity_instructions: activity.activity_instructions
                    }));

                return res.json({
                    success: true,
                    data: formattedActivities
                });
            }

            // Get all topics for the subjects involved
            const topicsQuery = `
                SELECT id, parent_id, topic_name, subject_id
                FROM topic_hierarchy 
                WHERE subject_id IN (${subjectIds.map(() => '?').join(',')})
            `;

            db.query(topicsQuery, subjectIds, (err, allTopics) => {
                if (err) {
                    console.error('Get topics for hierarchy error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch topic hierarchy',
                        error: err.message
                    });
                }

                // Build hierarchy path function
                const buildHierarchyPath = (topicId, topics, path = []) => {
                    const topic = topics.find(t => t.id === topicId);
                    if (!topic) return path;

                    path.unshift(topic.topic_name);

                    if (topic.parent_id) {
                        return buildHierarchyPath(topic.parent_id, topics, path);
                    }

                    return path;
                };

                // Add hierarchy path to activities and ensure uniqueness
                const seenIds = new Set();
                const activitiesWithHierarchy = activities
                    .filter(activity => {
                        if (seenIds.has(activity.id)) {
                            return false; // Skip duplicate
                        }
                        seenIds.add(activity.id);
                        return true;
                    })
                    .map(activity => {
                        let hierarchyPath = null;

                        if (activity.topic_id) {
                            const fullPath = buildHierarchyPath(activity.topic_id, allTopics);
                            const parentPath = fullPath.slice(0, -1); // Remove the current topic name
                            hierarchyPath = parentPath.length > 0 ? parentPath.join(' > ') : null;
                        }

                        return {
                            id: activity.id,
                            dailyScheduleId: activity.daily_schedule_id,
                            activity_type: activity.activity_type || '',
                            activity_name: activity.activity_name || '',
                            duration: activity.duration || activity.duration_minutes || 0,
                            batch_number: activity.batch_number || 1,
                            mentor_id: activity.assigned_mentor_id,
                            mentor_name: activity.mentor_name || '',
                            mentor_roll: activity.mentor_roll || '',
                            topic_id: activity.topic_id,
                            topic_name: activity.topic_name || '',
                            topic_hierarchy_path: hierarchyPath,
                            material_id: activity.material_id,
                            material_name: activity.material_name || '',
                            has_assessment: activity.is_assessment || false,
                            assessment_type: activity.assessment_type || '',
                            total_marks: activity.total_marks || 0,
                            start_time: activity.start_time,
                            end_time: activity.end_time,
                            activity_instructions: activity.activity_instructions
                        };
                    });

                res.json({
                    success: true,
                    data: activitiesWithHierarchy
                });
            });
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
exports.createPeriodActivity = (req, res) => {
    try {
        const {
            period_id,
            date,
            activity_type,
            start_time,
            end_time,
            batch_number,
            mentor_id,
            topic_id,
            has_assessment,
            assessment_type,
            total_marks
        } = req.body;

        // Get the daily schedule info first
        db.query(
            'SELECT start_time as period_start, end_time as period_end, subject_id FROM daily_schedule WHERE id = ?',
            [period_id],
            (err, scheduleInfo) => {
                if (err) {
                    console.error('Schedule info query error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch schedule info',
                        error: err.message
                    });
                }

                if (!scheduleInfo.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Period not found'
                    });
                }

                const { period_start, period_end, subject_id } = scheduleInfo[0];

                // Calculate duration in minutes
                const startDateTime = new Date(`1970-01-01T${start_time}:00`);
                const endDateTime = new Date(`1970-01-01T${end_time}:00`);
                const duration = Math.round((endDateTime - startDateTime) / (1000 * 60));

                // Create the period activity
                const insertQuery = `
                    INSERT INTO period_activities (
                        daily_schedule_id, activity_date, activity_name, activity_type, 
                        batch_number, topic_id, start_time, end_time, duration, assigned_mentor_id,
                        is_assessment, assessment_type, total_marks, activity_instructions
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const activityName = `${activity_type} - Batch ${batch_number}`;
                const activityInstructions = `${activity_type} activity for batch ${batch_number} from ${start_time} to ${end_time}`;

                db.query(insertQuery, [
                    period_id,
                    date,
                    activityName,
                    activity_type,
                    batch_number,
                    topic_id,
                    start_time,
                    end_time,
                    duration,
                    mentor_id,
                    has_assessment ? 1 : 0,
                    assessment_type,
                    total_marks,
                    activityInstructions
                ], (err, activityResult) => {
                    if (err) {
                        console.error('Create activity error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create activity',
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Activity created successfully',
                        data: {
                            activityId: activityResult.insertId,
                            activityName,
                            start_time,
                            end_time,
                            duration
                        }
                    });
                });
            }
        );
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
exports.getMonthlyScheduleAlt = (req, res) => {
    try {
        const { gradeId, month, year } = req.params;

        const query = `
                SELECT dsn.*, sec.section_name, sub.subject_name, ven.name as venue_name
                FROM daily_schedule dsn
                LEFT JOIN sections sec ON dsn.section_id = sec.id
                LEFT JOIN subjects sub ON dsn.subject_id = sub.id
                LEFT JOIN venues ven ON dsn.venue_id = ven.id
                WHERE MONTH(dsn.date) = ? AND YEAR(dsn.date) = ? AND dsn.grade_id = ?
                ORDER BY dsn.date, dsn.period_number
            `;

        db.query(query, [month, year, gradeId], (err, results) => {
            if (err) {
                console.error('Get monthly schedule error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch monthly schedule',
                    error: err.message
                });
            }

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
                        periods: [{
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
                        }]
                    });
                }
            }

            res.json({
                success: true,
                data: monthlySchedule
            });
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
exports.getPeriodActivitiesAlt = (req, res) => {
    try {
        const { periodId, date } = req.params;

        const query = `
                SELECT pa.*, 
                       u.name as mentor_name,
                       m.roll as mentor_roll,
                       th.topic_name,
                       CASE 
                           WHEN th.parent_id IS NOT NULL THEN
                               (SELECT GROUP_CONCAT(
                                   ancestor.topic_name 
                                   ORDER BY ancestor.level ASC 
                                   SEPARATOR ' > '
                               )
                               FROM topic_hierarchy ancestor 
                               WHERE ancestor.level < th.level 
                               AND th.topic_code LIKE CONCAT(ancestor.topic_code, '%')
                               AND ancestor.subject_id = th.subject_id)
                           ELSE NULL 
                       END as topic_hierarchy_path,
                       tm.activity_name as material_title
                FROM period_activities pa
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN users u ON m.phone = u.phone
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN topic_materials tm ON pa.material_id = tm.id
                WHERE pa.daily_schedule_id = ? AND pa.activity_date = ?
                ORDER BY pa.start_time
            `;

        db.query(query, [periodId, date], (err, results) => {
            if (err) {
                console.error('Get period activities error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch period activities',
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: (results || []).map(row => ({
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
exports.createPeriodActivitySplit = (req, res) => {
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

        db.query(existingQuery, [period_id, date], (err, existing) => {
            if (err) {
                console.error('Existing activities query error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check existing activities',
                    error: err.message
                });
            }

            const startOffset = existing[0]?.total_duration || 0;

            // Get the period's start time from daily_schedule
            const periodQuery = `
                    SELECT start_time FROM daily_schedule WHERE id = ?
                `;

            db.query(periodQuery, [period_id], (err, periodResult) => {
                if (err) {
                    console.error('Period query error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch period info',
                        error: err.message
                    });
                }

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

                db.query(insertQuery, [
                    period_id, date, activity_type || 'Academic Activity', activity_type, duration_minutes, batch_number,
                    mentor_id, topic_id, has_assessment, assessment_type, total_marks,
                    activityStartTime.toTimeString().slice(0, 8)
                ], (err, result) => {
                    if (err) {
                        console.error('Insert activity error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create activity',
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Activity created successfully',
                        data: { activityId: result.insertId }
                    });
                });
            });
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

// Create multiple time-based period activities
exports.createTimeBasedActivitiesBatch = (req, res) => {
    try {
        const { period_id, date, activities } = req.body;

        // activities array should contain:
        // [{ batch_number, activity_type, start_time, end_time, topic_id, mentor_id, has_assessment, assessment_type, total_marks }]

        if (!activities || !Array.isArray(activities) || activities.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Activities array is required'
            });
        }
        // Validate time overlaps within the same batch
        const batchActivities = {};
        for (const activity of activities) {
            const { batch_number, start_time, end_time } = activity;
            if (!batchActivities[batch_number]) {
                batchActivities[batch_number] = [];
            }

            // Check for overlaps within the same batch
            for (const existing of batchActivities[batch_number]) {
                if ((start_time < existing.end_time && end_time > existing.start_time)) {
                    return res.status(400).json({
                        success: false,
                        message: `Time overlap detected for batch ${batch_number}: ${start_time}-${end_time} overlaps with ${existing.start_time}-${existing.end_time}`
                    });
                }
            }

            batchActivities[batch_number].push({ start_time, end_time });
        }

        // Start transaction with lock timeout handling
        db.query('SET SESSION innodb_lock_wait_timeout = 30', (lockErr) => {
            if (lockErr) {
                console.error('Set lock timeout error:', lockErr);
            }

            db.query('START TRANSACTION', (err) => {
                if (err) {
                    console.error('Transaction start error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to start transaction',
                        error: err.message
                    });
                }

                // Process activities sequentially to avoid lock conflicts
                let currentIndex = 0;
                const insertedActivities = [];

                const processNextActivity = () => {
                    if (currentIndex >= activities.length) {
                        // All activities processed, commit transaction
                        db.query('COMMIT', (commitErr) => {
                            if (commitErr) {
                                console.error('Commit error:', commitErr);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Failed to commit transaction',
                                    error: commitErr.message
                                });
                            }

                            res.json({
                                success: true,
                                message: `${activities.length} activities created successfully`,
                                data: { activities: insertedActivities }
                            });
                        });
                        return;
                    }

                    const activity = activities[currentIndex];
                    const {
                        batch_number, activity_type, start_time, end_time, topic_id,
                        mentor_id, has_assessment, assessment_type, total_marks, activity_instructions
                    } = activity;

                    // Calculate duration in minutes
                    const startDate = new Date(`1970-01-01 ${start_time}`);
                    const endDate = new Date(`1970-01-01 ${end_time}`);
                    const duration_minutes = Math.round((endDate - startDate) / (1000 * 60));

                    const insertQuery = `
                        INSERT INTO period_activities 
                        (daily_schedule_id, activity_date, activity_name, activity_type, duration, 
                         batch_number, assigned_mentor_id, topic_id, is_assessment, assessment_type, 
                         total_marks, start_time, end_time, activity_instructions, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    `;

                    const activityName = `${activity_type} - Batch ${batch_number}`;

                    db.query(insertQuery, [
                        period_id, date, activityName, activity_type,
                        duration_minutes, batch_number, mentor_id, topic_id,
                        has_assessment ? 1 : 0, assessment_type, total_marks,
                        start_time, end_time, activity_instructions || ''
                    ], (insertErr, result) => {
                        if (insertErr) {
                            console.error('Insert activity error:', insertErr);
                            return db.query('ROLLBACK', () => {
                                res.status(500).json({
                                    success: false,
                                    message: 'Failed to create activity',
                                    error: insertErr.message,
                                    details: `Error on activity ${currentIndex + 1}: ${insertErr.sqlMessage || insertErr.message}`
                                });
                            });
                        }

                        insertedActivities.push({
                            id: result.insertId,
                            ...activity,
                            activity_name: activityName,
                            duration_minutes
                        });

                        currentIndex++;
                        // Process next activity
                        setImmediate(processNextActivity);
                    });
                };

                // Start processing activities
                processNextActivity();
            });
        });
    } catch (error) {
        console.error('Create time-based activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create activities',
            error: error.message
        });
    }
};

// Update period activity
exports.updatePeriodActivity = (req, res) => {
    try {
        const { activityId } = req.params;
        const {
            activity_type, duration, batch_number,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks,
            activity_instructions, activity_name, end_time, start_time
        } = req.body;

        const updateQuery = `
                UPDATE period_activities 
                SET activity_type = ?, duration = ?, batch_number = ?,
                    assigned_mentor_id = ?, topic_id = ?, is_assessment = ?,
                    assessment_type = ?, total_marks = ?, activity_instructions = ?, activity_name = ?, end_time = ?, start_time = ?, updated_at = NOW()
                WHERE id = ?
            `;

        db.query(updateQuery, [
            activity_type, duration, batch_number,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks,
            activity_instructions, activity_name, end_time, start_time, activityId
        ], (err, result) => {
            if (err) {
                console.error('Update period activity error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update activity',
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: 'Activity updated successfully'
            });
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
exports.deletePeriodActivity = (req, res) => {
    try {
        const { activityId } = req.params;

        const deleteQuery = `DELETE FROM period_activities WHERE id = ?`;
        db.query(deleteQuery, [activityId], (err, result) => {
            if (err) {
                console.error('Delete period activity error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete activity',
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: 'Activity deleted successfully'
            });
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
exports.getBatchActivities = (req, res) => {
    const { batchId, date } = req.params;

    const query = `
            SELECT pa.*, 
                   ws.subject_id,
                   s.subject_name,
                   ws.time_start,
                   ws.time_end,
                   v.venue_name,
                   m.name as mentor_name,
                   th.topic_name,
                   CASE 
                       WHEN th.parent_id IS NOT NULL THEN
                           (SELECT GROUP_CONCAT(
                               ancestor.topic_name 
                               ORDER BY ancestor.level ASC 
                               SEPARATOR ' > '
                           )
                           FROM topic_hierarchy ancestor 
                           WHERE ancestor.level < th.level 
                           AND th.topic_code LIKE CONCAT(ancestor.topic_code, '%')
                           AND ancestor.subject_id = th.subject_id)
                       ELSE NULL 
                   END as topic_hierarchy_path
            FROM period_activities pa
            JOIN weekly_schedule ws ON pa.weekly_schedule_id = ws.id
            LEFT JOIN subjects s ON ws.subject_id = s.id
            LEFT JOIN venues v ON ws.venue_id = v.id
            LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
            LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
            WHERE pa.batch_number = ? AND pa.activity_date = ?
            ORDER BY pa.start_time
        `;

    db.query(query, [batchId, date], (error, results) => {
        if (error) {
            console.error('Get batch activities error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch batch activities',
                error: error.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// Get section batches for schedule management
exports.getSectionBatches = (req, res) => {
    try {
        const { sectionId, subjectId } = req.params;

        const query = `
            SELECT 
                sb.id,
                sb.batch_name,
                sb.batch_level,
                sb.max_students,
                COUNT(sba.id) as current_students
            FROM section_batches sb
            LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
            WHERE sb.section_id = ? AND sb.subject_id = ? AND sb.is_active = 1
            GROUP BY sb.id, sb.batch_name, sb.batch_level, sb.max_students
            ORDER BY sb.batch_level
        `;

        db.query(query, [sectionId, subjectId], (error, results) => {
            if (error) {
                console.error('Get section batches error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch section batches',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: results
            });
        });
    } catch (error) {
        console.error('Get section batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch section batches',
            error: error.message
        });
    }
};
