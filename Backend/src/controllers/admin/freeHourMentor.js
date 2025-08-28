const db = require('../../config/db');
const cron = require('node-cron');

// Helper functions
function addTime(time, duration) {
    const [h1, m1, s1] = time.split(':').map(Number);
    const [h2, m2, s2] = duration.split(':').map(Number);

    let seconds = s1 + s2;
    let minutes = m1 + m2;
    let hours = h1 + h2;

    if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds %= 60;
    }

    if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes %= 60;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatTime(time) {
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
}

function maxTime(time1, time2) {
    return time1.localeCompare(time2) > 0 ? time1 : time2;
}

// Get mentors with free hours
exports.getFreeHour = async (req, res) => {
    const { grade } = req.query;
    try {
        const sql = `
        SELECT ds.id,m.id as mentorId, u.name, m.roll, up.file_path, ds.start_time, ds.end_time, ds.is_adjusted
        FROM daily_schedule ds
        JOIN mentors m ON ds.mentors_id = m.id
        JOIN users u ON m.phone = u.phone
        JOIN User_photos up ON m.phone = up.phone
        WHERE ds.activity = 7 AND m.grade_id = ?
        ORDER BY m.roll
        `;

        const [mentor] = await db.promise().query(sql, [grade]);
    
        res.json(mentor);
        // console.log(mentor);

    }

    catch (error) {
        console.error('Error finding free hours:', error);
        res.status(500).json({ error: 'Failed to fetch free hours' });

    };
}

// Get activity types
exports.getActivity = async (req, res) => {
    try {
        const [activities] = await db.promise().query(
            'SELECT id,activity_type FROM activity_types'
        );
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
};

// Update the assignFreeHour function
exports.assignFreeHour = async (req, res) => {
    const { mentorId, description, activity, startTime, endTime, date, ds_id } = req.body;

    try {
        // Insert into free_hour_tasks table
        await db.promise().query(
            `INSERT INTO free_hour_tasks 
             (mentor_id, date, start_time, end_time, activity_type_id, description, status, ds_id)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)`,
            [mentorId, date, startTime, endTime, activity, description, ds_id]
        );

        // Mark the slot as assigned in daily_schedule
        await db.promise().query(
            `UPDATE daily_schedule 
             SET is_adjusted = 1 
             WHERE mentors_id = ? AND date = ? AND start_time = ? AND end_time = ?`,
            [mentorId, date, startTime, endTime]
        );

        res.status(201).json({ message: 'Task assigned successfully' });
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ error: 'Failed to assign task' });
    }
};

// Update the getFreeHourActivity function
exports.getFreeHourActivity = async (req, res) => {
    try {
        const [tasks] = await db.promise().query(
            `SELECT 
                fht.id,
                u.name AS facultyName,
                m.roll AS facultyId,
                fht.description,
                at.activity_type,
                CONCAT(
                    DATE_FORMAT(fht.start_time, '%h:%i %p'), 
                    ' to ', 
                    DATE_FORMAT(fht.end_time, '%h:%i %p')
                ) AS timeSlot,
                fht.status,
                fht.assigned_at
            FROM free_hour_tasks fht
            JOIN mentors m ON fht.mentor_id = m.id
            JOIN users u ON m.phone = u.phone
            JOIN activity_types at ON fht.activity_type_id = at.id
            ORDER BY fht.assigned_at DESC`
        );

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};
exports.getSelectedFreeHourActivity = async (req, res) => {
    const { dsId } = req.query;
    try {
        const [tasks] = await db.promise().query(
            `SELECT 
                fht.id,
                u.name AS facultyName,
                m.roll AS facultyId,
                fht.description,
                at.activity_type,
                CONCAT(
                    DATE_FORMAT(fht.start_time, '%h:%i %p'), 
                    ' to ', 
                    DATE_FORMAT(fht.end_time, '%h:%i %p')
                ) AS timeSlot,
                fht.status,
                fht.assigned_at
            FROM free_hour_tasks fht
            JOIN mentors m ON fht.mentor_id = m.id
            JOIN users u ON m.phone = u.phone
            JOIN activity_types at ON fht.activity_type_id = at.id
            WHERE fht.ds_id = ?
            ORDER BY fht.assigned_at DESC`, [dsId]
        );
        
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// Mark task as completed
exports.completeFreeHour = async (req, res) => {
    const { taskId } = req.params;

    try {
        await db.promise().query(
            `UPDATE free_hour_tasks
       SET status = 'Completed', completed_at = NOW()
       WHERE id = ?`,
            [taskId]
        );

        res.json({ message: 'Task marked as completed' });
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Failed to complete task' });
    }
};



//CronJob
const generateDailyFreeSlots = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const workingHours = {
            start: '08:30:00',
            end: '16:30:00',
            lunchStart: '12:30:00',
            lunchEnd: '13:30:00'
        };

        const [mentors] = await db.promise().query(`SELECT m.id FROM mentors m`);

        for (const mentor of mentors) {
            const [schedules] = await db.promise().query(
                `SELECT start_time, end_time FROM daily_schedule WHERE mentors_id = ? AND date = ?`,
                [mentor.id, today]
            );

            const intervals = [{ start: workingHours.lunchStart, end: workingHours.lunchEnd }];
            for (const schedule of schedules) {
                intervals.push({ start: schedule.start_time, end: schedule.end_time });
            }

            intervals.sort((a, b) => a.start.localeCompare(b.start));

            let currentTime = workingHours.start;
            const freeSlots = [];

            for (const interval of intervals) {
                if (currentTime < interval.start) {
                    let slotStart = currentTime;
                    while (slotStart < interval.start) {
                        let slotEnd = addTime(slotStart, '01:00:00');
                        if (slotEnd > interval.start) slotEnd = interval.start;

                        if (!(slotStart >= workingHours.lunchStart && slotEnd <= workingHours.lunchEnd)) {
                            if (slotStart !== slotEnd) {
                                freeSlots.push({ start: slotStart, end: slotEnd });
                            }
                        }

                        slotStart = slotEnd;
                    }
                }
                currentTime = maxTime(currentTime, interval.end);
            }

            if (currentTime < workingHours.end) {
                let slotStart = currentTime;
                while (slotStart < workingHours.end) {
                    let slotEnd = addTime(slotStart, '01:00:00');
                    if (slotEnd > workingHours.end) slotEnd = workingHours.end;

                    if (!(slotStart >= workingHours.lunchStart && slotEnd <= workingHours.lunchEnd)) {
                        if (slotStart !== slotEnd) {
                            freeSlots.push({ start: slotStart, end: slotEnd });
                        }
                    }

                    slotStart = slotEnd;
                }
            }

            for (const slot of freeSlots) {
                await db.promise().query(
                    `INSERT INTO daily_schedule (mentors_id, date, start_time, end_time, is_adjusted, activity)
           VALUES (?, ?, ?, ?, 0, 7)`,
                    [mentor.id, today, slot.start, slot.end]
                );
            }
        }

        console.log('Free hours pre-inserted into daily_schedule.');
    } catch (error) {
        console.error('Failed to insert daily free hours:', error);
    }
};
exports.generateDailyFreeSlots = generateDailyFreeSlots;

// Schedule it at 6 AM daily
cron.schedule('0 6 * * *', generateDailyFreeSlots);