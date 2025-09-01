const db = require('../../config/db');
const ExcelJS = require('exceljs');
const fs = require("fs");

// Get all sections for a grade
exports.getSectionsByGrade = async (req, res) => {
    const { activeGrade } = req.body;

    const sql = `
    SELECT sec.id, sec.section_name, sec.grade_id
    FROM Sections sec
    WHERE grade_id = ?
  `;
    db.query(sql, [activeGrade], (err, results) => {
        if (err) {
            console.error("Error fetching sections data:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: "Sections data fetched successfully", gradeSections: results });
    });
};

// Get all subjects
exports.getAllSubjects = (req, res) => {

    const { activeSection } = req.body;

    const sql = `
    SELECT DISTINCT ssa.subject_id as id, sub.subject_name
    FROM section_subject_activities ssa
    JOIN Subjects sub ON ssa.subject_id = sub.id
    WHERE section_id = ?;
  `;
    db.query(sql, [activeSection], (err, results) => {
        if (err) {
            console.error("Error fetching subjects data:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: "Subjects data fetched successfully", subjects: results });
    });
};

//get WeeklySchedule
exports.getWeeklySchedule = (req, res) => {
    const { sectionId, day } = req.query;

    const query = `
    SELECT ws.*, s.subject_name, ven.id as venue_id, ven.name as venue_name
    FROM weekly_schedule ws
    JOIN subjects s ON ws.subject_id = s.id
    JOIN Venues ven ON ws.venue = ven.id
    WHERE ws.section_id = ? AND ws.day = ?
    ORDER BY ws.start_time`;

    db.query(query, [sectionId, day], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        console.log(results);
        res.json({ success: true, scheduleItems: results });

    });
};

exports.addOrUpdateWeeklySchedule = async (req, res) => {
    const { id, sectionId, day, startTime, endTime, subjectId, mentorsId, activity, venue } = req.body;

    if (!sectionId || !day || !startTime || !endTime || !subjectId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Step 1: Calculate session_no
        const [existingSessions] = await db.promise().query(
            `SELECT COUNT(*) AS count FROM weekly_schedule 
       WHERE section_id = ? AND day = ? AND start_time < ?`,
            [sectionId, day, startTime]
        );
        const sessionNo = existingSessions[0].count + 1;
        // console.log("weekly",id);

        // Step 2: Update existing schedule
        if (id) {
            const updateQuery = `
        UPDATE weekly_schedule 
        SET 
          section_id = ?,
          day = ?,
          start_time = ?,
          end_time = ?,
          subject_id = ?,
          activity = ?,
          venue = ?,
          session_no = ?
        WHERE id = ?`;


            await db.promise().query(updateQuery,
                [sectionId, day, startTime, endTime, subjectId, activity || null, venue || null, sessionNo, id]);

            return res.json({
                success: true,
                message: 'Schedule item updated successfully',
                id: id
            });
        }
        // Step 3: Insert new schedule
        else {
            const insertQuery = `
        INSERT INTO weekly_schedule 
        (section_id, day, start_time, end_time, subject_id, activity, venue, session_no)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const [results] = await db.promise().query(insertQuery,
                [sectionId, day, startTime, endTime, subjectId, activity || null, venue || null, sessionNo]);

            return res.json({
                success: true,
                message: 'Schedule item created successfully',
                id: results.insertId
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};

// Delete a schedule item
exports.deleteWeeklySchedule = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM weekly_schedule WHERE id = ?';

    //   const query1 = 'SELECT id FROM daily_schedule WHERE original_schedule_id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Schedule item not found' });
        }

        res.json({ success: true, message: 'Schedule item deleted successfully' });

        // db.query(query1, [id], (err, results) => {
        //   if (err) {
        //     console.error(err);
        //     return res.status(500).json({ success: false, message: 'Database error' });
        //   }
        //   if (results.length > 0) {
        //     const dailyScheduleIds = results.map(row => row.id);

        //     // First check if there are any non-completed assessment sessions
        //     const checkQuery = 'SELECT COUNT(*) as count FROM assessment_sessions WHERE dsa_id IN (?) AND status != "completed"';

        //     db.query(checkQuery, [dailyScheduleIds], (err, checkResults) => {
        //       if (err) {
        //         console.error(err);
        //         return res.status(500).json({ success: false, message: 'Database error checking assessment sessions' });
        //       }

        //       const nonCompletedCount = checkResults[0].count;

        //       if (nonCompletedCount > 0) {
        //         return res.status(400).json({
        //           success: false,
        //           message: 'Cannot delete schedule: There are assessment sessions in progress or pending completion'
        //         });
        //       }

        //       // Proceed with deletion if all assessment sessions are completed
        //       const query2 = 'DELETE FROM academic_sessions WHERE dsa_id IN (?)';
        //       const query3 = 'DELETE FROM assessment_sessions WHERE dsa_id IN (?) AND status = "completed"';
        //       const deleteQuery = 'DELETE FROM daily_schedule WHERE id IN (?)';

        //       // First delete completed assessment_sessions
        //       db.query(query3, [dailyScheduleIds], (err) => {
        //         if (err) {
        //           console.error(err);
        //           return res.status(500).json({ success: false, message: 'Database error deleting assessment sessions' });
        //         }

        //         // Then delete acadamic_sessions
        //         db.query(query2, [dailyScheduleIds], (err) => {
        //           if (err) {
        //             console.error(err);
        //             return res.status(500).json({ success: false, message: 'Database error deleting academic sessions' });
        //           }

        //           // Finally delete daily_schedule
        //           db.query(deleteQuery, [dailyScheduleIds], (err) => {
        //             if (err) {
        //               console.error(err);
        //               return res.status(500).json({ success: false, message: 'Database error deleting daily schedule' });
        //             }
        //             res.json({ success: true, message: 'Schedule item deleted successfully' });
        //           });
        //         });
        //       });
        //     });
        //   } else {
        //     res.json({ success: true, message: 'Schedule item deleted successfully' });
        //   }
        // })
    });
}


// Check for time conflicts in schedule
exports.checkTimeConflict = (req, res) => {
    const { sectionId, day, startTime, endTime, excludeId } = req.query;

    const query = `
    SELECT COUNT(*) as conflictCount
    FROM weekly_schedule
    WHERE section_id = ? 
    AND day = ?
    AND (
      (start_time < ? AND end_time > ?) OR
      (start_time < ? AND end_time > ?) OR
      (start_time >= ? AND end_time <= ?)
    )
    ${excludeId ? 'AND id != ?' : ''}`;

    const params = [sectionId, day, endTime, startTime, endTime, startTime, startTime, endTime];
    if (excludeId) params.push(excludeId);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({
            success: true,
            hasConflict: results[0].conflictCount > 0
        });
    });
};

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

        // Format date as string in MySQL (IST assumed)
        const query = `
            SELECT 
    dsn.id,
    DATE_FORMAT(dsn.date, '%Y-%m-%d') AS date,
    DAYNAME(dsn.date) AS day_name,
    dsn.start_time,
    dsn.end_time,
    s.subject_name,
    s.id AS subject_id,
    v.name AS venue_name,
    sec.section_name,
    sec.id AS section_id
FROM daily_schedule dsn
LEFT JOIN subjects s ON dsn.subject_id = s.id
LEFT JOIN venues v ON dsn.venue_id = v.id  
LEFT JOIN sections sec ON dsn.section_id = sec.id
WHERE MONTH(dsn.date) = ?
  AND YEAR(dsn.date) = ?
  AND dsn.section_id = ?
ORDER BY dsn.date, dsn.start_time;

        `;

        db.query(query, [month, year, sectionId], (err, scheduleData) => {
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
                const date = period.date; // Already formatted as 'YYYY-MM-DD'
                const dayName = period.day_name; // Already correct

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
            console.log('Monthly Schedule:', JSON.stringify(monthlySchedule, null, 2));

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
                SELECT DISTINCT
                    pa.*,
                    th.topic_name,
                    th.parent_id,
                    th.subject_id,
                    tm.activity_name as material_name,
                    m.roll as mentor_roll,
                    u.name as mentor_name,
                    sb.batch_level,
                    sb.id as batch_id
                FROM period_activities pa
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN topic_materials tm ON pa.material_id = tm.id
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN users u ON m.phone = u.phone
                LEFT JOIN section_batches sb ON pa.batch_id = sb.id
                WHERE pa.dsn_id = ?
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

            // console.log('Topic IDs:', topicIds);
            // console.log('Subject IDs:', subjectIds);

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
                        dailyScheduleId: activity.dsn_id,
                        activity_type: activity.activity_type || '',
                        activity_name: activity.activity_name || '',
                        duration: activity.duration || activity.duration_minutes || 0,
                        batch_number: activity.batch_level || '',
                        batch_id: activity.batch_id,
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
                            dailyScheduleId: activity.dsn_id,
                            activity_type: activity.activity_type || '',
                            activity_name: activity.activity_name || '',
                            duration: activity.duration || activity.duration_minutes || 0,
                            batch_number: activity.batch_level || '',
                            batch_id: activity.batch_id || null,
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
        const { period_id, date, activities, sectionId } = req.body;

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
                        batch_number, activity_type, activity_type_id, sub_activity_type_id, start_time, end_time, topic_id,
                        mentor_id, has_assessment, assessment_type, total_marks, activity_instructions, batch_id
                    } = activity;

                    // Calculate duration in minutes
                    const startDate = new Date(`1970-01-01 ${start_time}`);
                    const endDate = new Date(`1970-01-01 ${end_time}`);
                    const duration_minutes = Math.round((endDate - startDate) / (1000 * 60));

                    const insertQuery = `
                        INSERT INTO period_activities 
                        (dsn_id, activity_date, activity_name, activity_type, section_subject_activity_id, ssa_sub_activity_id, duration, 
                         batch_id, assigned_mentor_id, topic_id, is_assessment, 
                         total_marks, start_time, end_time, activity_instructions, created_at, section_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                    `;

                    const activityName = `${activity_type} - Batch ${batch_number}`;

                    db.query(insertQuery, [
                        period_id, date, activityName, activity_type, activity_type_id, sub_activity_type_id,
                        duration_minutes, batch_id, mentor_id, topic_id,
                        has_assessment ? 1 : 0, total_marks,
                        start_time, end_time, activity_instructions || '',
                        sectionId
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
            activity_type, activity_type_id, sub_activity_id, sub_activity_type_id, duration, batch_number, batch_id,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks,
            activity_instructions, activity_name, end_time, start_time
        } = req.body;

        console.log('Updating activity:', {
            activityId,
            activity_type, activity_type_id, sub_activity_id, sub_activity_type_id, duration, batch_number, batch_id,
            mentor_id, topic_id, has_assessment, assessment_type, total_marks,
            activity_instructions, activity_name, end_time, start_time
        });

        const updateQuery = `
                UPDATE period_activities 
                SET activity_type = ?, duration = ?, batch_id = ?,
                    assigned_mentor_id = ?, topic_id = ?, is_assessment = ?, section_subject_activity_id = ?, ssa_sub_activity_id = ?,
                    total_marks = ?, activity_instructions = ?, activity_name = ?, end_time = ?, start_time = ?, updated_at = NOW()
                WHERE id = ?
            `;

        db.query(updateQuery, [
            activity_type, duration, batch_id,
            mentor_id, topic_id, has_assessment, activity_type_id, sub_activity_type_id, total_marks,
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


// Get daily schedule for a specific student with overrides
// Get daily schedule for a specific student with overrides
exports.getStudentSchedule = async (req, res) => {
    const { date, studentRoll } = req.params;

    try {
        const [student] = await db.promise().query('SELECT section_id FROM students WHERE roll = ?', [studentRoll]);
        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const sectionId = student[0].section_id;

        // First get the basic daily schedule
        const dailyScheduleQuery = `
            SELECT DISTINCT
                ds.id as daily_schedule_id, ds.date, ds.start_time as period_start_time, ds.end_time as period_end_time,
                s.subject_name, v.name as venue_name, s.id as subject_id
            FROM daily_schedule ds
            JOIN subjects s ON ds.subject_id = s.id
            JOIN venues v ON ds.venue_id = v.id
            WHERE ds.date = ? AND ds.section_id = ?
            ORDER BY ds.start_time;
        `;
        const [dailyScheduleResult] = await db.promise().query(dailyScheduleQuery, [date, sectionId]);

        // For each daily schedule, get the student's specific period activities (based on their batch assignments)
        const baseSchedule = [];
        
        for (const schedule of dailyScheduleResult) {
            // Check if this student has a period activity for this time slot
            const activityQuery = `
                SELECT 
                    pa.id as period_activity_id, pa.start_time, pa.end_time, ds.subject_id, ds.venue_id, m.roll as mentor_roll,
                    pa.batch_id, u.name as mentor_name, sb.batch_name, sb.batch_level,
                    pa.ssa_sub_activity_id, pa.topic_id, pa.section_id, pa.assigned_mentor_id, 
                    sa.sub_act_name, at.activity_type, th.topic_name, th.parent_id,
                    pa.activity_name, pa.activity_type as period_activity_type
                FROM period_activities pa
                JOIN daily_schedule ds ON ds.id = pa.dsn_id
                JOIN student_batch_assignments sba ON sba.batch_id = pa.batch_id AND sba.student_roll = ? AND sba.is_current = '1'
                JOIN section_batches sb ON sb.id = sba.batch_id
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN users u ON m.phone = u.phone
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN ssa_sub_activities sssa ON pa.ssa_sub_activity_id = sssa.id
                LEFT JOIN sub_activities sa ON sssa.sub_act_id = sa.id
                LEFT JOIN section_subject_activities ssa ON sssa.ssa_id = ssa.id
                LEFT JOIN activity_types at ON ssa.activity_type = at.id
                WHERE pa.dsn_id = ?;
            `;
            const [activityResult] = await db.promise().query(activityQuery, [studentRoll, schedule.daily_schedule_id]);

            // Get all topics for hierarchy building if we have topics
            const topicIds = activityResult.map(activity => activity.topic_id).filter(id => id);
            let allTopics = [];
            
            if (topicIds.length > 0) {
                const topicsQuery = `
                    SELECT id, parent_id, topic_name, subject_id
                    FROM topic_hierarchy 
                    WHERE subject_id = ?
                `;
                const [topicsResult] = await db.promise().query(topicsQuery, [schedule.subject_id]);
                allTopics = topicsResult;
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

            // Combine daily schedule with student's specific activity (if any)
            for (const activity of activityResult) {
                let topicHierarchyPath = null;
                
                if (activity.topic_id && allTopics.length > 0) {
                    const hierarchyPath = buildHierarchyPath(activity.topic_id, allTopics);
                    topicHierarchyPath = hierarchyPath.length > 0 ? hierarchyPath.join(' > ') : activity.topic_name;
                }

                const scheduleItem = {
                    ...schedule,
                    period_activity_id: activity.period_activity_id,
                    start_time: activity.start_time,
                    end_time: activity.end_time,
                    batch_id: activity.batch_id,
                    mentor_name: activity.mentor_name,
                    topic_name: activity.topic_name,
                    topic_hierarchy_path: topicHierarchyPath,
                    batch_name: activity.batch_name,
                    batch_number: activity.batch_level,
                    ssa_sub_activity_id: activity.ssa_sub_activity_id,
                    topic_id: activity.topic_id,
                    section_id: activity.section_id,
                    assigned_mentor_id: activity.assigned_mentor_id,
                    sub_activity_name: activity.sub_act_name,
                    activity_type: activity.activity_type,
                    subject_id: activity.subject_id,
                    subject_name: schedule.subject_name,
                    venue_id: activity.venue_id,
                    activity_name: activity.activity_name,
                    period_activity_type: activity.period_activity_type,
                    mentor_roll: activity.mentor_roll
                };

                baseSchedule.push(scheduleItem);
            }
        }
        
        res.json({ success: true, schedule: baseSchedule });

    } catch (error) {
        console.error("Error fetching student schedule:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Create or update a student-specific schedule override
exports.createOrUpdateStudentScheduleOverride = async (req, res) => {
    const { id, daily_schedule_id, student_roll, activity_type, start_time, end_time, topic_id, mentor_id, venue_id, notes } = req.body;

    if (id) {
        // Update
        const query = `UPDATE student_schedule_overrides SET activity_type = ?, start_time = ?, end_time = ?, topic_id = ?, mentor_id = ?, venue_id = ?, notes = ? WHERE id = ?`;
        db.query(query, [activity_type, start_time, end_time, topic_id, mentor_id, venue_id, notes, id], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, message: 'Override updated' });
        });
    } else {
        // Insert
        const query = `INSERT INTO student_schedule_overrides (daily_schedule_id, student_roll, activity_type, start_time, end_time, topic_id, mentor_id, venue_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [daily_schedule_id, student_roll, activity_type, start_time, end_time, topic_id, mentor_id, venue_id, notes], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, message: 'Override created', id: result.insertId });
        });
    }
};

// Delete a student-specific schedule override
exports.deleteStudentScheduleOverride = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM student_schedule_overrides WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, message: 'Override deleted' });
    });
};


// Enhanced processScheduleSheet function with better error handling
exports.processScheduleSheet = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const { sectionId } = req.body;
        const filePath = req.file.path;

        const dbPromise = db.promise();

        // Read Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet("Schedule Data");

        if (!worksheet) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: "Invalid Excel format. Please use the provided template.",
            });
        }

        const rows = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
                const values = row.values.slice(1);
                if (values.some((val) => val !== null && val !== undefined && val !== "")) {
                    rows.push(values);
                }
            }
        });


        if (rows.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: "No data found in the Excel sheet",
            });
        }

        // Start transaction
        const connection = await dbPromise.getConnection();
        await connection.query("START TRANSACTION");

        try {
            let processedCount = 0;
            const errors = [];
            const weeklyEntries = [];

            for (let i = 0; i < rows.length; i++) {
                try {
                    const [
                        sno,
                        date,
                        fromTime,
                        toTime,
                        subjectName,
                        venueName,
                        batchLevel,
                        activityType,
                        subActivityName,
                        topicPath,
                        mentorInfo,
                        isAssessment,
                        instructions,
                    ] = rows[i];

                    if (!date || !fromTime || !toTime || !subjectName) continue;

                    // Lookups

                    const [subject] = await connection.execute(
                        "SELECT id FROM subjects WHERE subject_name = ?",
                        [subjectName]
                    );
                    // console.log(subject.id);
                    if (!subject) {
                        errors.push(`Row ${i + 2}: Subject "${subjectName}" not found`);
                        continue;
                    }

                    const [venue] = await connection.execute(
                        "SELECT id FROM venues WHERE name = ?",
                        [venueName]
                    );
                    //   console.log(venue);
                    if (!venue) {
                        errors.push(`Row ${i + 2}: Venue "${venueName}" not found`);
                        continue;
                    }

                    // Mentor parse
                    const mentorMatch = mentorInfo?.toString().match(/(.+?)\s*\(([^)]+)\)/);
                    const mentorName = mentorMatch ? mentorMatch[1].trim() : mentorInfo;
                    const mentorRoll = mentorMatch ? mentorMatch[2].trim() : "";

                    const [mentor] = await connection.execute(
                        `SELECT m.id 
                        FROM mentors m 
                        JOIN users u ON m.phone = u.phone 
                        WHERE u.name = ? AND m.roll = ?`,
                        [mentorName, mentorRoll]
                    );
                    //   console.log(mentor);

                    const [activity] = await connection.execute(
                        `SELECT ssa.id 
                        FROM section_subject_activities ssa
                        JOIN activity_types at ON ssa.activity_type = at.id
                        WHERE at.activity_type = ? AND ssa.subject_id = ? AND ssa.section_id = ?`,
                        [activityType, subject.id, sectionId]
                    );
                    //   console.log(activity);
                    const [subActivity] = await connection.execute(
                        `SELECT sssa.id 
                        FROM ssa_sub_activities sssa
                        JOIN sub_activities sa ON sssa.sub_act_id = sa.id
                        WHERE sa.sub_act_name = ? AND sssa.ssa_id = ?`,
                        [subActivityName, activity.id]
                    );
                    //   console.log(subActivity);

                    // Topic hierarchy

                    let topicId = null;
                    if (topicPath) {
                        const match = topicPath.match(/^(\d+)-\[(.+?)\]\s*(.+)$/);
                        console.log(match);

                        if (!match) {
                            return null;
                        }

                        const [, idStr, subjectName, topicHierarchy] = match;
                        topicId = parseInt(idStr, 10);
                    }

                    //   console.log(topicId);

                    // console.log("hi");
                    const batchLevelMatch = batchLevel?.toString().match(/\[.*?\]\s*(.+)/);
                    const cleanBatchLevel = batchLevelMatch ? batchLevelMatch[1] : batchLevel;

                    const [batchId] = await connection.execute(
                        `SELECT id FROM section_batches WHERE batch_level = ? AND section_id = ? AND subject_id = ?`,
                        [cleanBatchLevel, sectionId, subject.id]
                    );

                    const startDateTime = new Date(`1970-01-01T${fromTime}:00`);
                    const endDateTime = new Date(`1970-01-01T${toTime}:00`);
                    const duration = Math.round((endDateTime - startDateTime) / 60000);
                    console.log(date,
                        `${activityType} - Batch ${cleanBatchLevel}`,
                        activityType,
                        duration,
                        batchId?.id,
                        mentor?.id || null,
                        topicId,
                        fromTime,
                        toTime,
                        isAssessment == 1 ? 1 : 0,
                        instructions || "",
                        activity?.id || null,
                        subActivity?.id || null);

                    // Insert into period_activities
                    await connection.execute(
                        `INSERT INTO period_activities 
             (activity_date, activity_name, activity_type, section_id, duration, 
              batch_id, assigned_mentor_id, topic_id, start_time, end_time,
              is_assessment, activity_instructions, section_subject_activity_id, 
              ssa_sub_activity_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                        [
                            date,
                            `${activityType} - Batch ${cleanBatchLevel}`,
                            activityType,
                            sectionId,
                            duration,
                            batchId?.id,
                            mentor?.id || null,
                            topicId,
                            fromTime,
                            toTime,
                            isAssessment == 1 ? 1 : 0,
                            instructions || "",
                            activity?.id || null,
                            subActivity?.id || null,
                        ]
                    );

                    // Weekly schedule
                    const dayOfWeek = new Date(date).toLocaleString("en-US", { weekday: "long" });

                    // Collect weekly entry
                    weeklyEntries.push({
                        sectionId,
                        subjectId: subject.id,
                        venueId: venue.id,
                        date,
                        fromTime,
                        toTime
                    });

                    processedCount++;
                } catch (rowError) {
                    console.error(`Error processing row ${i + 2}:`, rowError);
                    errors.push(`Row ${i + 2}: ${rowError.message}`);
                }
            }

            function mergeSlots(entries) {
                const merged = [];
                const groups = {};

                for (const e of entries) {
                    const key = `${e.sectionId}-${e.subjectId}-${e.venueId}-${e.date}`;
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(e);
                }

                for (const key in groups) {
                    const group = groups[key];
                    const fromTimes = group.map(g => g.fromTime).sort();
                    const toTimes = group.map(g => g.toTime).sort();
                    merged.push({
                        ...group[0], // copy sectionId, subjectId, venueId, date
                        fromTime: fromTimes[0],                  // earliest
                        toTime: toTimes[toTimes.length - 1]      // latest
                    });
                }

                return merged;
            }

            const mergedEntries = mergeSlots(weeklyEntries);

            for (const entry of mergedEntries) {
                const dayOfWeek = new Date(entry.date).toLocaleString("en-US", { weekday: "long" });

                // Insert into weekly_schedule
                await connection.execute(
                    `INSERT INTO weekly_schedule 
            (day, subject_id, section_id, venue, start_time, end_time, session_no, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE 
              start_time = VALUES(start_time),
              end_time = VALUES(end_time),
              venue = VALUES(venue)`,
                    [dayOfWeek, entry.subjectId, entry.sectionId, entry.venueId, entry.fromTime, entry.toTime]
                );

                // Insert into daily_schedule
                const insertDaily = await connection.execute(
                    `INSERT INTO daily_schedule 
      (date, subject_id, section_id, venue_id, start_time, end_time, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE 
        venue_id = VALUES(venue_id),
        start_time = VALUES(start_time),
        end_time = VALUES(end_time)`,
                    [
                        entry.date,
                        entry.subjectId,
                        entry.sectionId,
                        entry.venueId,
                        entry.fromTime,
                        entry.toTime
                    ]
                );

                console.log("Inserted into daily_schedule:", insertDaily);

                let dailyId = insertDaily.insertId;
                if (!dailyId) {
                    const [rows] = await connection.execute(
                        `SELECT id FROM daily_schedule 
       WHERE date = ? AND section_id = ? AND subject_id = ? AND venue_id = ? 
         AND start_time = ? AND end_time = ? LIMIT 1`,
                        [entry.date, entry.sectionId, entry.subjectId, entry.venueId, entry.fromTime, entry.toTime]
                    );
                    dailyId = rows[0]?.id;
                }

                // Update period_activities with correct daily_schedule id
                console.log("Updating period_activities with dailyId:", dailyId, entry.date, entry.sectionId);
                const sqlDate = new Date(entry.date).toISOString().split("T")[0];
                if (dailyId) {
                    await connection.execute(
                        `UPDATE period_activities pa
       SET pa.dsn_id = ?
       WHERE pa.activity_date = ? AND pa.section_id = ?`,
                        [dailyId, sqlDate, parseInt(entry.sectionId)]
                    );
                }
            }
            await connection.execute("COMMIT");
            connection.release();

            const fs = require("fs");
            fs.unlinkSync(filePath);

            res.json({
                success: true,
                message: `Schedule uploaded successfully. Processed ${processedCount} rows.`,
                data: {
                    processedRows: processedCount,
                    totalRows: rows.length,
                    errors: errors.length > 0 ? errors : null
                }
            });

        } catch (error) {
            await connection.execute("ROLLBACK");
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error("Process schedule sheet error:", error);
        try {
            const fs = require("fs");
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
        } catch (cleanupError) {
            console.error("File cleanup error:", cleanupError);
        }
        res.status(500).json({ success: false, message: "Failed to process schedule sheet", error: error.message });
    }
};


// exports.generateScheduleTemplate = async (req, res) => {
//   try {
//     const { gradeId, sectionId } = req.params;
//     const dbPromise = db.promise();

//     // Fetch dropdown data
//     const [subjects, venues, mentors, activities, subActivities, batches, topics] =
//       await Promise.all([
//         dbPromise.query("SELECT id, subject_name FROM subjects"),
//         dbPromise.query(
//           `SELECT v.id, v.name 
//            FROM venues v
//            WHERE v.grade_id = ?`,
//           [gradeId]
//         ),
//         dbPromise.query(
//           `SELECT m.id, u.name, m.roll 
//            FROM mentors m 
//            JOIN users u ON m.phone = u.phone
//            WHERE m.grade_id = ?`,
//           [gradeId]
//         ),
//         dbPromise.query("SELECT id, activity_type FROM activity_types"),
//         dbPromise.query("SELECT id, sub_act_name FROM sub_activities"),
//         dbPromise.query(
//           `SELECT DISTINCT batch_level 
//            FROM section_batches 
//            WHERE section_id = ?
//            ORDER BY batch_level`,
//           [sectionId]
//         ),
//         dbPromise.query(
//           `SELECT th.id, th.topic_name, th.parent_id, th.subject_id, s.subject_name
//            FROM topic_hierarchy th
//            JOIN subjects s ON th.subject_id = s.id
//            ORDER BY th.subject_id, th.topic_name`,
//         ),
//       ]);

//     // Extract results
//     const subjectsData = subjects[0];
//     const venuesData = venues[0];
//     const mentorsData = mentors[0];
//     const activitiesData = activities[0];
//     const subActivitiesData = subActivities[0];
//     const batchesData = batches[0];
//     const topicsData = topics[0];

//     // Create workbook + sheets
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Schedule Data");
//     const validationSheet = workbook.addWorksheet("Validation Data");

//     // Define columns for Schedule Data
//     worksheet.columns = [
//       { header: "SNo", key: "sno", width: 5 },
//       { header: "Date (YYYY-MM-DD)", key: "date", width: 15 },
//       { header: "From Time (HH:MM)", key: "fromTime", width: 15 },
//       { header: "To Time (HH:MM)", key: "toTime", width: 15 },
//       { header: "Subject", key: "subject", width: 20 },
//       { header: "Venue", key: "venue", width: 15 },
//       { header: "Batch Level", key: "batchLevel", width: 12 },
//       { header: "Activity Type", key: "activityType", width: 20 },
//       { header: "Sub Activity", key: "subActivity", width: 20 },
//       { header: "Topic", key: "topic", width: 30 },
//       { header: "Mentor", key: "mentor", width: 25 },
//       { header: "Is Assessment (0/1)", key: "isAssessment", width: 15 },
//       { header: "Instructions", key: "instructions", width: 30 },
//     ];

//     // Sample row
//     worksheet.addRow({
//       sno: 1,
//       date: "2025-08-25",
//       fromTime: "09:30",
//       toTime: "10:00",
//       subject: "",
//       venue: "",
//       batchLevel: "",
//       activityType: "",
//       subActivity: "",
//       topic: "Arithmetic operations > Addition",
//       mentor: "",
//       isAssessment: 0,
//       instructions: "Nil",
//     });

//     // ===============================
//     // Fill Validation Data (IMPROVED APPROACH)
//     // ===============================

//     // Helper function to add validation data and return the range
//     const addValidationData = (title, data, startCol = 1) => {
//       const titleRowNum = validationSheet.lastRow ? validationSheet.lastRow.number + 2 : 1;
//       validationSheet.getCell(titleRowNum, startCol).value = title;

//       const dataStartRow = titleRowNum + 1;
//       data.forEach((item, index) => {
//         validationSheet.getCell(dataStartRow + index, startCol).value = item;
//       });

//       const dataEndRow = dataStartRow + data.length - 1;
//       const colLetter = String.fromCharCode(64 + startCol);

//       return `'Validation Data'!${colLetter}${dataStartRow}:${colLetter}${dataEndRow}`;
//     };

//     // Helper function to build topic hierarchy path
//     const buildHierarchyPath = (topicId, topics, path = []) => {
//       const topic = topics.find(t => t.id === topicId);
//       if (!topic) return path;

//       path.unshift(topic.topic_name);

//       if (topic.parent_id) {
//         return buildHierarchyPath(topic.parent_id, topics, path);
//       }

//       return path;
//     };

//     // Create validation data arrays
//     const subjectNames = subjectsData.map(s => s.subject_name);
//     const venueNames = venuesData.map(v => v.name);
//     const batchLevels = batchesData.map(b => b.batch_level);
//     const activityTypes = activitiesData.map(a => a.activity_type);
//     const subActivityNames = subActivitiesData.map(s => s.sub_act_name);
//     const mentorDisplayNames = mentorsData.map(m => `${m.name} (${m.roll})`);

//     // Create topic hierarchy display with subject grouping
//     const topicHierarchy = topicsData.map(topic => {
//       const hierarchyPath = buildHierarchyPath(topic.id, topicsData);
//       return `[${topic.subject_name}] ${hierarchyPath.join(' > ')}`;
//     });

//     // Add validation data to sheet and get ranges
//     const subjectRange = addValidationData("SUBJECTS", subjectNames, 1);
//     const venueRange = addValidationData("VENUES", venueNames, 2);
//     const batchRange = addValidationData("BATCH LEVELS", batchLevels, 3);
//     const activityRange = addValidationData("ACTIVITY TYPES", activityTypes, 4);
//     const subActivityRange = addValidationData("SUB ACTIVITIES", subActivityNames, 5);
//     const mentorRange = addValidationData("MENTORS", mentorDisplayNames, 6);
//     const topicRange = addValidationData("TOPICS", topicHierarchy, 7);

//     // ===============================
//     // Apply Data Validations (IMPROVED)
//     // ===============================

//     // Add multiple rows for template (50 rows should be enough)
//     for (let i = 2; i <= 51; i++) { // Starting from row 2 (after header)
//       // Subject validation (column E - index 5)
//       worksheet.getCell(`E${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: [subjectRange],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Subject',
//         error: 'Please select a valid subject from the dropdown list.'
//       };

//       // Venue validation (column F - index 6)
//       worksheet.getCell(`F${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: [venueRange],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Venue',
//         error: 'Please select a valid venue from the dropdown list.'
//       };

//       // Batch Level validation (column G - index 7)
//       worksheet.getCell(`G${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: [batchRange],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Batch Level',
//         error: 'Please select a valid batch level from the dropdown list.'
//       };

//       // Activity Type validation (column H - index 8)
//       worksheet.getCell(`H${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: [activityRange],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Activity Type',
//         error: 'Please select a valid activity type from the dropdown list.'
//       };

//       // Sub Activity validation (column I - index 9)
//       worksheet.getCell(`I${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: [subActivityRange],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Sub Activity',
//         error: 'Please select a valid sub activity from the dropdown list.'
//       };

//       // Topic validation (column J - index 10)
//       worksheet.getCell(`J${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: [topicRange],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Topic',
//         error: 'Please select a valid topic from the dropdown list.'
//       };

//       // Mentor validation (column K - index 11)
//       worksheet.getCell(`K${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: [mentorRange],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Mentor',
//         error: 'Please select a valid mentor from the dropdown list.'
//       };

//       // Is Assessment validation (column L - index 12)
//       worksheet.getCell(`L${i}`).dataValidation = {
//         type: 'list',
//         allowBlank: true,
//         formulae: ['"0,1"'],
//         showErrorMessage: true,
//         errorStyle: 'error',
//         errorTitle: 'Invalid Assessment Value',
//         error: 'Please enter 0 for No or 1 for Yes.'
//       };
//     }

//     // ===============================
//     // Instructions Sheet
//     // ===============================
//     const instructionsSheet = workbook.addWorksheet("Instructions");
//     instructionsSheet.addRows([
//       ["SCHEDULE TEMPLATE INSTRUCTIONS"],
//       [""],
//       ["1. Fill in the Schedule Data sheet with your schedule information"],
//       ["2. Use the dropdown menus in each column to select valid values"],
//       ["3. Date format: YYYY-MM-DD (e.g., 2025-08-25)"],
//       ["4. Time format: HH:MM (24-hour format, e.g., 09:30, 14:00)"],
//       ['5. For mentors, use the dropdown (format: "Name (Roll)")'],
//       ["6. Is Assessment: 0 for No, 1 for Yes"],
//       ["7. Refer to Validation Data sheet for available options"],
//       [""],
//       ["REQUIRED FIELDS:"],
//       ["- Date, From Time, To Time, Subject, Venue, Batch Level"],
//       ["- Activity Type, Sub Activity, Topic, Mentor"],
//       [""],
//       ["TOPIC FORMAT:"],
//       ["- Topics are displayed with subject prefix: [Subject Name] Parent > Child > Topic"],
//       ["- Select the topic that matches your chosen subject"],
//       [""],
//       ["OPTIONAL FIELDS:"],
//       ["- Instructions"],
//       [""],
//       ["NOTE: Template includes 50 pre-configured rows with dropdown validations"]
//     ]);

//     // ===============================
//     // Styling and Protection
//     // ===============================

//     // Style the headers
//     const headerRow = worksheet.getRow(1);
//     headerRow.font = { bold: true };
//     headerRow.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFE0E0E0' }
//     };

//     // Hide the validation sheet from normal view (optional)
//     validationSheet.state = 'hidden';

//     // ===============================
//     // Send File
//     // ===============================
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=schedule_template_grade${gradeId}_section${sectionId}.xlsx`
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Generate template error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate template",
//       error: error.message,
//     });
//   }
// };

exports.generateScheduleTemplate = async (req, res) => {
    try {
        const { gradeId, sectionId } = req.params;
        const dbPromise = db.promise();

        // Fetch all data needed for filtering
        const [subjects, venues, mentors, activities, subActivities, batches, topics, ssaMappings] =
            await Promise.all([
                dbPromise.query("SELECT id, subject_name FROM subjects"),
                dbPromise.query(
                    `SELECT v.id, v.name 
           FROM venues v
           WHERE v.grade_id = ?`,
                    [gradeId]
                ),
                dbPromise.query(
                    `SELECT m.id, u.name, m.roll, m.subject_id
           FROM mentors m 
           JOIN users u ON m.phone = u.phone
           WHERE m.grade_id = ?`,
                    [gradeId]
                ),
                dbPromise.query("SELECT id, activity_type FROM activity_types"),
                dbPromise.query("SELECT id, sub_act_name FROM sub_activities"),
                dbPromise.query(
                    `SELECT DISTINCT sb.id, sb.batch_level, sb.subject_id, s.subject_name
           FROM section_batches sb
           JOIN subjects s ON sb.subject_id = s.id
           WHERE sb.section_id = ?
           ORDER BY sb.batch_level`,
                    [sectionId]
                ),
                dbPromise.query(
                    `SELECT th.id, th.topic_name, th.parent_id, th.subject_id, s.subject_name,
                  th.section_subject_activity_id, th.ssa_sub_activity_id
           FROM topic_hierarchy th
           JOIN subjects s ON th.subject_id = s.id
           ORDER BY th.subject_id, th.topic_name`,
                ),
                dbPromise.query(
                    `SELECT ssa.id, ssa.activity_type, ssa.section_id, ssa.subject_id, 
                  ssa_sub.sub_act_id
           FROM section_subject_activities ssa
           LEFT JOIN ssa_sub_activities ssa_sub ON ssa.id = ssa_sub.ssa_id
           WHERE ssa.section_id = ?`,
                    [sectionId]
                )
            ]);

        // Extract results
        const subjectsData = subjects[0];
        const venuesData = venues[0];
        const mentorsData = mentors[0];
        const activitiesData = activities[0];
        const subActivitiesData = subActivities[0];
        const batchesData = batches[0];
        const topicsData = topics[0];
        const ssaMappingsData = ssaMappings[0];

        // Create workbook + sheets
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Schedule Data");
        const validationSheet = workbook.addWorksheet("Validation Data");

        // Define columns for Schedule Data
        worksheet.columns = [
            { header: "SNo", key: "sno", width: 5 },
            { header: "Date (YYYY-MM-DD)", key: "date", width: 15 },
            { header: "From Time (HH:MM)", key: "fromTime", width: 15 },
            { header: "To Time (HH:MM)", key: "toTime", width: 15 },
            { header: "Subject", key: "subject", width: 20 },
            { header: "Venue", key: "venue", width: 15 },
            { header: "Batch Level", key: "batchLevel", width: 12 },
            { header: "Activity Type", key: "activityType", width: 20 },
            { header: "Sub Activity", key: "subActivity", width: 20 },
            { header: "Topic", key: "topic", width: 30 },
            { header: "Mentor", key: "mentor", width: 25 },
            { header: "Is Assessment (0/1)", key: "isAssessment", width: 15 },
            { header: "Instructions", key: "instructions", width: 30 },
        ];

        // Sample row
        worksheet.addRow({
            sno: 1,
            date: "2025-08-25",
            fromTime: "09:30",   // keep as string
            toTime: "10:00",     // keep as string
            subject: "",
            venue: "",
            batchLevel: "",
            activityType: "",
            subActivity: "",
            topic: "",
            mentor: "",
            isAssessment: 0,
            instructions: "Nil",
        });

        worksheet.getColumn("fromTime").numFmt = "@"; // "@" = text in Excel
        worksheet.getColumn("toTime").numFmt = "@";


        // ===============================
        // Prepare data for dynamic filtering
        // ===============================

        // Create subject mapping
        const subjectMap = {};
        subjectsData.forEach((subject, index) => {
            subjectMap[subject.subject_name] = subject.id;
        });

        // Create activity mapping by subject
        const subjectActivityMap = {};
        ssaMappingsData.forEach(ssa => {
            if (!subjectActivityMap[ssa.subject_id]) {
                subjectActivityMap[ssa.subject_id] = new Set();
            }
            subjectActivityMap[ssa.subject_id].add(ssa.activity_type);
        });

        // Create sub-activity mapping by activity and subject
        const activitySubActivityMap = {};
        ssaMappingsData.forEach(ssa => {
            const key = `${ssa.subject_id}-${ssa.activity_type}`;
            if (!activitySubActivityMap[key]) {
                activitySubActivityMap[key] = new Set();
            }
            if (ssa.sub_act_id) {
                activitySubActivityMap[key].add(ssa.sub_act_id);
            }
        });

        // Create batch levels by subject
        console.log(batchesData);

        const subjectBatchMap = {};
        batchesData.forEach(batch => {
            if (!subjectBatchMap[batch.subject_id]) {
                subjectBatchMap[batch.subject_id] = new Set();
            }
            subjectBatchMap[batch.subject_id].add(`${batch.id}-[${batch.subject_name}] ${batch.batch_level}`);
        });

        // Create topics by subject, activity, and sub-activity
        const subjectTopicMap = {};
        topicsData.forEach(topic => {
            const key = `${topic.subject_id}-${topic.section_subject_activity_id || '0'}-${topic.ssa_sub_activity_id || '0'}`;
            if (!subjectTopicMap[key]) {
                subjectTopicMap[key] = [];
            }

            // Build hierarchy path
            const hierarchyPath = buildHierarchyPath(topic.id, topicsData);
            subjectTopicMap[key].push({
                id: topic.id,
                display: hierarchyPath.join(' > '),
                fullPath: hierarchyPath.join(' > ')
            });
        });

        // Create mentors by subject
        const subjectMentorMap = {};
        mentorsData.forEach(mentor => {
            if (!subjectMentorMap[mentor.subject_id]) {
                subjectMentorMap[mentor.subject_id] = [];
            }
            subjectMentorMap[mentor.subject_id].push(`${mentor.name} (${mentor.roll})`);
        });

        // Helper function to build topic hierarchy path
        function buildHierarchyPath(topicId, topics, path = []) {
            const topic = topics.find(t => t.id === topicId);
            if (!topic) return path;

            path.unshift(topic.topic_name);

            if (topic.parent_id) {
                return buildHierarchyPath(topic.parent_id, topics, path);
            }
            //   console.log(path);

            return path;
        }

        // ===============================
        // Fill Validation Data
        // ===============================

        // Helper function to add validation data and return the range
        const addValidationData = (title, data, startCol = 1) => {
            const titleRowNum = validationSheet.lastRow ? validationSheet.lastRow.number + 2 : 1;
            validationSheet.getCell(titleRowNum, startCol).value = title;

            const dataStartRow = titleRowNum + 1;
            data.forEach((item, index) => {
                validationSheet.getCell(dataStartRow + index, startCol).value = item;
            });

            const dataEndRow = dataStartRow + data.length - 1;
            const colLetter = String.fromCharCode(64 + startCol);

            return `'Validation Data'!$${colLetter}$${dataStartRow}:$${colLetter}$${dataEndRow}`;
        };

        // Create validation data arrays
        const subjectNames = subjectsData.map(s => s.subject_name);
        const venueNames = venuesData.map(v => v.name);
        const batchLevels = batchesData.map(b => `[${b.subject_name}] ${b.batch_level}`);
        const activityTypes = activitiesData.map(a => a.activity_type);
        const subActivityNames = subActivitiesData.map(s => s.sub_act_name);
        const mentorDisplayNames = mentorsData.map(m => `${m.name} (${m.roll})`);

        // Create topic hierarchy display
        const topicHierarchy = topicsData.map(topic => {
            const hierarchyPath = buildHierarchyPath(topic.id, topicsData);
            return `${topic.id}-[${topic.subject_name}] ${hierarchyPath.join(' > ')}`
        });

        // Add validation data to sheet and get ranges
        const subjectRange = addValidationData("SUBJECTS", subjectNames, 1);
        const venueRange = addValidationData("VENUES", venueNames, 2);
        const batchRange = addValidationData("BATCH LEVELS", batchLevels, 3);
        const activityRange = addValidationData("ACTIVITY TYPES", activityTypes, 4);
        const subActivityRange = addValidationData("SUB ACTIVITIES", subActivityNames, 5);
        const mentorRange = addValidationData("MENTORS", mentorDisplayNames, 6);
        const topicRange = addValidationData("TOPICS", topicHierarchy, 7);

        // ===============================
        // Apply Data Validations
        // ===============================

        for (let i = 2; i <= 51; i++) {
            // Subject validation (column E)
            worksheet.getCell(`E${i}`).dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [subjectRange],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Subject',
                error: 'Please select a valid subject from the dropdown list.'
            };

            // Venue validation (column F)
            worksheet.getCell(`F${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [venueRange],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Venue',
                error: 'Please select a valid venue from the dropdown list.'
            };

            // Batch Level validation (column G)
            worksheet.getCell(`G${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [batchRange],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Batch Level',
                error: 'Please select a valid batch level from the dropdown list.'
            };

            // Activity Type validation (column H)
            worksheet.getCell(`H${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [activityRange],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Activity Type',
                error: 'Please select a valid activity type from the dropdown list.'
            };

            // Sub Activity validation (column I)
            worksheet.getCell(`I${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [subActivityRange],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Sub Activity',
                error: 'Please select a valid sub activity from the dropdown list.'
            };

            // Topic validation (column J)
            worksheet.getCell(`J${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [topicRange],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Topic',
                error: 'Please select a valid topic from the dropdown list.'
            };

            // Mentor validation (column K)
            worksheet.getCell(`K${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [mentorRange],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Mentor',
                error: 'Please select a valid mentor from the dropdown list.'
            };

            // Is Assessment validation (column L)
            worksheet.getCell(`L${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"0,1"'],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Assessment Value',
                error: 'Please enter 0 for No or 1 for Yes.'
            };
        }

        // ===============================
        // Instructions Sheet
        // ===============================
        const instructionsSheet = workbook.addWorksheet("Instructions");
        instructionsSheet.addRows([
            ["SCHEDULE TEMPLATE INSTRUCTIONS"],
            [""],
            ["1. Fill in the Schedule Data sheet with your schedule information"],
            ["2. Use the dropdown menus in each column to select valid values"],
            ["3. Date format: YYYY-MM-DD (e.g., 2025-08-25)"],
            ["4. Time format: HH:MM (24-hour format, e.g., 09:30, 14:00)"],
            ['5. For mentors, use the dropdown (format: "Name (Roll)")'],
            ["6. Is Assessment: 0 for No, 1 for Yes"],
            ["7. Refer to Validation Data sheet for available options"],
            [""],
            ["REQUIRED FIELDS:"],
            ["- Date, From Time, To Time, Subject, Venue, Batch Level"],
            ["- Activity Type, Sub Activity, Topic, Mentor"],
            [""],
            ["TOPIC FORMAT:"],
            ["- Topics are displayed in hierarchy: Parent > Child > Topic"],
            ["- Select the topic that matches your chosen subject"],
            [""],
            ["OPTIONAL FIELDS:"],
            ["- Instructions"],
            [""],
            ["NOTE: Template includes 50 pre-configured rows with dropdown validations"]
        ]);

        // ===============================
        // Styling and Protection
        // ===============================

        // Style the headers
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Hide the validation sheet from normal view (optional)
        validationSheet.state = 'hidden';

        // ===============================
        // Send File
        // ===============================
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=schedule_template_grade${gradeId}_section${sectionId}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Generate template error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate template",
            error: error.message,
        });
    }
};

const createStudentWiseSchedule = async (sectionId, days, includeToday) => {
    let connection;
    try {
        // Calculate date range
        const today = new Date();
        const startDate = includeToday ? today : new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000);

        // Get connection from pool
        connection = await db.promise().getConnection();

        // Start transaction
        await connection.query('START TRANSACTION');

        // Get period activities for the specified section and date range
        const periodActivities = await connection.query(`
            SELECT 
                pa.*,
                pa.batch_id,
                sba.student_roll,
                s.id as student_id,
                ssa.subject_id,
                m.id as mentor_id
            FROM period_activities pa
            JOIN section_subject_activities ssa ON pa.section_subject_activity_id = ssa.id
            JOIN section_batches sb ON sb.id = pa.batch_id AND sb.section_id = ssa.section_id AND sb.subject_id = ssa.subject_id
            JOIN student_batch_assignments sba ON sba.batch_id = pa.batch_id AND sba.is_current = 1
            JOIN students s ON s.roll = sba.student_roll
            LEFT JOIN mentors m ON m.id = pa.assigned_mentor_id
            WHERE ssa.section_id = ? 
            AND pa.activity_date BETWEEN ? AND ?
            AND pa.status = 'Schedule Created'
            AND ssa.is_active = 1
            AND sb.is_active = 1
            AND pa.batch_id IS NOT NULL
            ORDER BY pa.activity_date, pa.start_time
        `, [sectionId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

        console.log(`Fetched ${periodActivities.length} period activities for section ${sectionId}`);
        console.log('Period activities with student assignments:', periodActivities.map(pa => ({
            activity_id: pa.id,
            activity_name: pa.activity_name,
            batch_id: pa.batch_id,
            student_roll: pa.student_roll,
            subject_id: pa.subject_id
        })));

        if (periodActivities.length === 0) {
            await connection.query('ROLLBACK');
            await connection.release();
            return {
                message: 'No period activities found for the specified criteria',
                schedulesCreated: 0
            };
        }

        let schedulesCreated = 0;
        const createdSchedules = [];

        // Group activities by type for batch processing
        const academicActivities = [];
        const assessmentActivities = [];

        for (const activity of periodActivities) {
            // Format date properly for MySQL datetime
            const formatDate = (date) => {
                if (typeof date === 'string') {
                    return date.split('T')[0]; // Extract date part if it's ISO string
                }
                if (date instanceof Date) {
                    return date.toISOString().split('T')[0];
                }
                return date;
            };

            const activityDate = formatDate(activity.activity_date);

            // Check if schedule already exists to avoid duplicates
            const existingAcademic = await connection.query(`
                SELECT id FROM academic_sessions 
                WHERE pa_id = ? AND student_roll = ? AND date = ?
            `, [activity.id, activity.student_roll, activityDate]);

            const existingAssessment = await connection.query(`
                SELECT id FROM assessment_sessions 
                WHERE pa_id = ? AND student_roll = ? AND date = ?
            `, [activity.id, activity.student_roll, activityDate]);

            if (existingAcademic.length > 0 || existingAssessment.length > 0) {
                console.log(`Schedule already exists for activity ${activity.id}, student ${activity.student_roll}`);
                continue;
            }

            const activityData = {
                pa_id: activity.id,
                student_roll: activity.student_roll,
                section_id: sectionId,
                mentor_id: activity.mentor_id || activity.assigned_mentor_id,
                subject_id: activity.subject_id,
                ssa_sub_activity_id: activity.ssa_sub_activity_id,
                batch_id: activity.batch_id,
                topic_id: activity.topic_id,
                eligibility_status: 'Eligible',
                status: 'Schedule Created',
                date: activityDate,
                start_time: `${activity.start_time}`,
                end_time: activity.end_time ?
                    `${activity.end_time}` :
                    `${activity.start_time}`,
                remarks: `Class scheduled for ${activity.activity_name}`
            };

            // Determine if this is an assessment or academic activity
            if (activity.is_assessment === 1) {
                assessmentActivities.push({
                    ...activityData,
                    total_marks: activity.total_marks || 100,
                    malpractice: 0
                });
            } else {
                academicActivities.push({
                    ...activityData,
                    attentiveness: null
                });
            }
        }

        // Insert academic sessions
        if (academicActivities.length > 0) {
            for (const session of academicActivities) {
                try {
                    const result = await connection.query(`
                        INSERT INTO academic_sessions (
                            pa_id, student_roll, section_id, mentor_id, subject_id, 
                            ssa_sub_activity_id, batch_id, topic_id, eligibility_status,
                            status, date, start_time, end_time, attentiveness, remarks
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        session.pa_id, session.student_roll, session.section_id,
                        session.mentor_id, session.subject_id, session.ssa_sub_activity_id,
                        session.batch_id, session.topic_id, session.eligibility_status,
                        session.status, session.date, session.start_time,
                        session.end_time, session.attentiveness, session.remarks
                    ]);

                    schedulesCreated++;
                    createdSchedules.push({
                        type: 'academic',
                        id: result.insertId,
                        student_roll: session.student_roll,
                        activity_name: periodActivities.find(pa => pa.id === session.pa_id)?.activity_name
                    });
                } catch (error) {
                    console.error(`Error creating academic session for student ${session.student_roll}:`, error);
                    throw error; // Re-throw to trigger rollback
                }
            }
        }

        // Insert assessment sessions
        if (assessmentActivities.length > 0) {
            for (const session of assessmentActivities) {
                try {
                    const result = await connection.query(`
                        INSERT INTO assessment_sessions (
                            pa_id, student_roll, section_id, mentor_id, subject_id,
                            ssa_sub_activity_id, batch_id, topic_id, eligibility_status,
                            status, date, start_time, end_time, total_marks, remarks, malpractice
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        session.pa_id, session.student_roll, session.section_id,
                        session.mentor_id, session.subject_id, session.ssa_sub_activity_id,
                        session.batch_id, session.topic_id, session.eligibility_status,
                        session.status, session.date, session.start_time,
                        session.end_time, session.total_marks, session.remarks, session.malpractice
                    ]);

                    schedulesCreated++;
                    createdSchedules.push({
                        type: 'assessment',
                        id: result.insertId,
                        student_roll: session.student_roll,
                        activity_name: periodActivities.find(pa => pa.id === session.pa_id)?.activity_name
                    });
                } catch (error) {
                    console.error(`Error creating assessment session for student ${session.student_roll}:`, error);
                    throw error; // Re-throw to trigger rollback
                }
            }
        }

        // Commit transaction
        await connection.query('COMMIT');
        await connection.release();

        return {
            message: `Successfully created ${schedulesCreated} student-wise schedules`,
            schedulesCreated,
            academicSessions: academicActivities.length,
            assessmentSessions: assessmentActivities.length,
            createdSchedules,
            dateRange: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            }
        };

    } catch (error) {
        console.error('Error in createStudentWiseSchedule:', error);
        if (connection) {
            try {
                await connection.query('ROLLBACK');
                await connection.release();
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }
        throw error;
    }
};

exports.generateStudentWiseSchedulesManual = async (req, res) => {
    try {
        const { gradeId, sectionId, days, includeToday } = req.body;

        // Validate input
        if (!gradeId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Grade ID and Section ID are required",
            });
        }

        // Generate the schedule
        const scheduleData = await createStudentWiseSchedule(sectionId, days, includeToday);

        // Send the generated schedule as a response
        res.status(200).json({
            success: true,
            data: scheduleData,
        });
    } catch (error) {
        console.error("Generate student-wise schedule error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate student-wise schedule",
            error: error.message,
        });
    }
};
exports.generateStudentWiseSchedulesCron = async (req, res) => {
    try {

        const days = 7;
        const includeToday = true;

        const getSectionIdSql = `
        SELECT id FROM sections;
        `;

        db.query(getSectionIdSql, async (err, results) => {
            if (err) {
                console.error('Error fetching section IDs:', err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch section IDs",
                    error: err.message,
                });
            }
            const scheduleData = [];
            for (const sectionId of results.map(r => r.id)) {
                // Generate the schedule
                const data = await createStudentWiseSchedule(sectionId, days, includeToday);
                scheduleData.push(data);
            }
        });

        // Send the generated schedule as a response
        res.status(200).json({
            success: true,
            data: scheduleData,
        });
    } catch (error) {
        console.error("Generate student-wise schedule error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate student-wise schedule",
            error: error.message,
        });
    }
};

exports.getSectionStudents = (req, res) => {
    const { sectionId } = req.body;
    console.log(sectionId);

    const sql = `
    SELECT st.id, st.name, st.roll, st.profile_photo
    FROM Students st
    WHERE st.section_id = ?
  `;
    db.query(sql, [sectionId], (err, results) => {
        if (err) {
            console.error("Error fetching student data:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        console.log(results);

        res.json({ success: true, message: "Student data fetched successfully", sectionStudent: results });
    });
};