const db = require('../../config/db');

// Get performance data for a student
exports.getPerformanceData = async (req, res) => {
    try {
        const { roll } = req.params;
        console.log("Roll", roll);

        // 1. Get student details and section information
        const [student] = await db.promise().query(`
      SELECT s.id, s.roll, s.name, s.section_id, sec.grade_id 
      FROM students s
      JOIN sections sec ON s.section_id = sec.id
      WHERE s.roll = ?
    `, [roll]);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // 2. Get all subjects for the student's section
        const [subjects] = await db.promise().query(`
      SELECT s.id, s.subject_name 
      FROM section_subject_activities ssa
      JOIN subjects s ON ssa.subject_id = s.id
      WHERE ssa.section_id = ? AND ssa.activity_type = 1
    `, [student[0].section_id]);

        console.log(student[0].section_id);

        // 3. Get student's current levels for each subject
        const [studentLevels] = await db.promise().query(`
      SELECT subject_id, level, status 
      FROM student_levels 
      WHERE student_roll = ?
    `, [roll]);

        console.log(studentLevels);

        // 4. Get expected levels and dates from materials table
        const [expectedLevels] = await db.promise().query(`
      SELECT DISTINCT m.subject_id, m.level, m.expected_date
      FROM materials m
      WHERE m.grade_id = ?
      ORDER BY m.subject_id, m.level
    `, [student[0].grade_id]);

        console.log(subjects);

        // 5. Organize the data
        const performanceData = subjects.map(subject => {
            const studentLevel = studentLevels.find(sl => sl.subject_id === subject.id);
            const subjectExpectedLevels = expectedLevels.filter(el => el.subject_id === subject.id);

            const currentLevel = studentLevel ? studentLevel.level : 0;

            const levels = subjectExpectedLevels.map(el => {
                const expectedDate = new Date(el.expected_date);
                const now = new Date();

                if (el.level < currentLevel) {
                    if (now < expectedDate) {
                        return { level: el.level, status: 'early' };      // Completed early
                    } else {
                        return { level: el.level, status: 'completed' };  // Completed on time or late
                    }
                } else if (el.level === currentLevel) {
                    if (now > expectedDate) {
                        return { level: el.level, status: 'overdue' };    // Still ongoing but overdue
                    } else {
                        return { level: el.level, status: 'onGoing' };    // Still ongoing, not yet due
                    }
                } else {
                    if (now > expectedDate) {
                        return { level: el.level, status: 'overdue' };    // Not started and overdue
                    } else {
                        return { level: el.level, status: 'pending' };    // Not started and still in time
                    }
                }

            });

            return {
                subject_id: subject.id,
                subject_name: subject.subject_name,
                levels,
                current_level: currentLevel,
                max_level: subjectExpectedLevels.length > 0 ? Math.max(...subjectExpectedLevels.map(e => e.level)) : 0
            };
        });


        res.json({
            success: true,
            data: {
                student,
                subjects: performanceData,
                // For y-axis levels, we'll use the maximum level across all subjects + some buffer
                max_level: performanceData.reduce((max, subj) =>
                    Math.max(max, subj.max_level), 0) + 2
            }
        });

    } catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).json({ success: false, message: 'Error fetching performance data' });
    }
};
