const db = require('../../config/db');

// Create Survey

exports.createSurvey = (req, res) => {
    const { mentorId, taskType, title, gradeId, sectionId, startDate, endDate, amount, description, students, clarityTeaching, clarityMaterials, timeMgmt, satisfaction } = req.body;

    if (taskType === 'Collect Fee') {
        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required for Collect Fee task type' });
        }
        else {
            const sql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, amount, description, status) VALUES (?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)`;
            db.query(sql, [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, amount, description, new Date() < new Date(endDate) ? 'Active' : 'InActive'], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                const surveyId = result.insertId;
                const studentValues = students.map(studentId => [surveyId, studentId]);
                // Insert survey students
                db.query('INSERT INTO survey_students (survey_id, student_id) VALUES ?', [studentValues], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
                });
            });
        }
    } else if (taskType === 'Feedback') {
        if (!clarityTeaching || !clarityMaterials || !timeMgmt || !satisfaction) {
            return res.status(400).json({ success: false, message: 'All feedback scores are required for Feedback task type' });
        }
        else {
            const sql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, amount, description, status, clty_fcty_teaching, clty_fcty_materials, time_management, over_all) VALUES (?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?, ?, ?, ?, ?)`;
            db.query(sql, [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, null, description, new Date() < new Date(endDate) ? 'Active' : 'InActive', clarityTeaching, clarityMaterials, timeMgmt, satisfaction], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                const surveyId = result.insertId;
                const studentValues = students.map(studentId => [surveyId, studentId]);
                // Insert survey students
                db.query('INSERT INTO survey_students (survey_id, student_id) VALUES ?', [studentValues], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
                });
            });
        }
    }
    else {
        const sql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, description, status) VALUES (?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)`;
        db.query(sql, [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, null, description, new Date() < new Date(endDate) ? 'Active' : 'InActive'], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            const surveyId = result.insertId;
            const studentValues = students.map(studentId => [surveyId, studentId]);
            // Insert survey students
            db.query('INSERT INTO survey_students (survey_id, student_id) VALUES ?', [studentValues], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
            });
        });
    }

};


// Get all grades
exports.getGrades = (req, res) => {
    const sql = `SELECT * FROM Grades`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching grades:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, grades: results });
    });
};
exports.getSectionsByGrade = (req, res) => {
    const gradeId = req.query.gradeId;
    console.log(gradeId);

    const sql = `SELECT * FROM Sections WHERE grade_id = ?`;
    db.query(sql, [gradeId], (err, results) => {
        if (err) {
            console.error("Error fetching sections:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log(results);

        res.json({ success: true, sections: results });
    });
};
exports.getMentorStudents = (req, res) => {
    const section = req.query.sectionId;
    // console.log(section);

    const sql = `SELECT id, name, roll FROM Students WHERE section_id = ?`;
    db.query(sql, [section], (err, results) => {
        if (err) {
            console.error("Error fetching students:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log(results);

        res.json({ success: true, students: results });
    });
};

// Get Surveys for Mentor
exports.getMentorSurveys = (req, res) => {
    const { mentorId } = req.params;

    db.query(
        `SELECT s.*, g.grade_name, sec.section_name, 
    COUNT(ss.student_id) AS student_count
    FROM surveys s
    LEFT JOIN grades g ON s.grade_id = g.id
    LEFT JOIN sections sec ON s.section_id = sec.id
    LEFT JOIN survey_students ss ON s.id = ss.survey_id
    WHERE s.mentor_id = ?
    GROUP BY s.id
    ORDER BY s.created_at DESC`,
        [mentorId],
        (err, surveys) => {
            if (err) return res.status(500).json({ error: err.message });

            // Calculate status based on current date
            const currentDate = new Date();
            const processed = surveys.map(survey => ({
                ...survey,
                status: new Date(survey.end_date) > currentDate ? 'Active' : 'InActive',
                time: `${new Date(survey.start_date).toLocaleDateString()} - ${new Date(survey.end_date).toLocaleDateString()}`
            }));

            res.json(processed);
        }
    );
};

// Get Survey Details
exports.getSurveyDetails = (req, res) => {
    const { surveyId } = req.params;

    db.query(
        `SELECT s.*, g.grade_name, sec.section_name
    FROM surveys s
    LEFT JOIN grades g ON s.grade_id = g.id
    LEFT JOIN sections sec ON s.section_id = sec.id
    WHERE s.id = ?`,
        [surveyId],
        (err, survey) => {
            if (err) return res.status(500).json({ error: err.message });
            if (survey.length === 0) return res.status(404).json({ error: 'Survey not found' });

            res.json(survey[0]);
        }
    );
};
// Get Survey Students
exports.getSurveyStudents = (req, res) => {
    const { surveyId } = req.params;

    db.query(
        `SELECT s.id, s.name, ss.completed, s.roll, s.profile_photo
    FROM survey_students ss
    LEFT JOIN students s ON ss.student_id = s.id
    WHERE ss.survey_id = ?`,
        [surveyId],
        (err, students) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(students);
        }
    );
};

// End Survey
exports.endSurvey = (req, res) => {
    const { surveyId } = req.params;

    db.query(
        'UPDATE surveys SET status = "inactive", end_date = NOW() WHERE id = ?',
        [surveyId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Survey not found' });
            }
            res.json({ message: 'Survey ended successfully' });
        }
    );
};

// Submit Feedback Response
exports.submitFeedback = (req, res) => {
    db.beginTransaction((err, transaction) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const { surveyId, studentId, scores } = req.body;

        // 1. Insert response
        transaction.query(
            `INSERT INTO survey_responses 
      (survey_id, student_id, clarity_teaching, clarity_materials, 
       time_management, satisfaction, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                surveyId,
                studentId,
                scores.clarityTeaching,
                scores.clarityMaterials,
                scores.timeManagement,
                scores.satisfaction,
                scores.comments
            ],
            (err) => {
                if (err) {
                    return transaction.rollback(() => {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ error: 'Response already submitted' });
                        }
                        res.status(400).json({ error: err.message });
                    });
                }

                // 2. Update completion status
                transaction.query(
                    `UPDATE survey_students 
          SET completed = 1 
          WHERE survey_id = ? AND student_id = ?`,
                    [surveyId, studentId],
                    (err) => {
                        if (err) {
                            return transaction.rollback(() => {
                                res.status(500).json({ error: err.message });
                            });
                        }

                        transaction.commit((err) => {
                            if (err) {
                                return transaction.rollback(() => {
                                    res.status(500).json({ error: err.message });
                                });
                            }
                            res.json({ message: 'Feedback submitted successfully' });
                        });
                    }
                );
            }
        );
    });
};