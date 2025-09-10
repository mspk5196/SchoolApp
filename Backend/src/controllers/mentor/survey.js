const db = require('../../config/db');

exports.createSurvey = async (req, res) => {
    const {
        mentorId, taskType, title, gradeId, sectionId, startDate,
        endDate, amount, description, students, term, questions
    } = req.body;

    let baseSql, baseParams;

    if (taskType === 'Collect Fee') {
        if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

        baseSql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, amount, description, status, term) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        baseParams = [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, amount, description, 'Active', null];
    } else {
        if (taskType === 'Feedback') {
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({ success: false, message: 'At least one question is required.' });
            }
        }

        baseSql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, description, status, term) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        baseParams = [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, description, 'Active', taskType === 'Feedback' ? term : null];
    }

    try {
        const tx = await db.promise().beginTransaction();

        const result = await tx.query(baseSql, baseParams);
        const surveyId = result.insertId;

        const studentValues = students.map(id => [surveyId, id]);
        await tx.query(`INSERT IGNORE INTO survey_students (survey_id, student_id) VALUES ?`, [studentValues]);

        if (taskType === 'Feedback') {
            const questionValues = questions.map((q, i) => [
                surveyId,
                q.question_text,
                q.answer_type,
                i
            ]);
            await tx.query(
                `INSERT INTO survey_questions (survey_id, question_text, answer_type, question_order) VALUES ?`,
                [questionValues]
            );
        }

        await tx.commit();
        return res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });

    } catch (err) {
        if (err?.rollback) await err.rollback();
        console.error('Transaction failed:', err);
        return res.status(500).json({ success: false, message: 'Survey creation failed: ' + err.message });
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
    const sql = `SELECT * FROM Sections WHERE grade_id = ?`;
    db.query(sql, [gradeId], (err, results) => {
        if (err) {
            console.error("Error fetching sections:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, sections: results });
    });
};

exports.getMentorStudents = (req, res) => {
    const section = req.query.sectionId;
    const sql = `SELECT id, name, roll FROM Students WHERE section_id = ?`;
    db.query(sql, [section], (err, results) => {
        if (err) {
            console.error("Error fetching students:", err);
            return res.status(500).json({ error: "Database error" });
        }
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
            const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
            const currentDate = new Date();

            if (surveys.length === 0) {
                return res.json([]);
            }
            const processed = surveys.map(survey => {
                const endDate = new Date(survey.end_date);
                const localEndDate = new Date(endDate.getTime() + (endDate.getTimezoneOffset() * -60000));
                const endDateStr = localEndDate.toISOString().split('T')[0];
                console.log(endDateStr);

                return {
                    ...survey,
                    status: endDateStr >= today ? 'Active' : 'InActive',
                    time: `${new Date(survey.start_date).toLocaleDateString()} - ${new Date(survey.end_date).toLocaleDateString()}`
                };
            });
            console.log("current: ", today, "end: ", processed[0].end_date);
            res.json(processed);
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

// ** NEW ENDPOINT ** Get a specific student's response for a survey
exports.getStudentSurveyResponse = (req, res) => {
    const { surveyId, studentId } = req.params;
    console.log(surveyId, studentId);
    
    const sql = `
        SELECT
            sq.question_text,
            sq.answer_type,
            sqr.text_answer,
            sqr.option_answer
        FROM survey_questions sq
        LEFT JOIN survey_question_responses sqr
            ON sq.id = sqr.question_id
            AND sqr.student_id = ?
        WHERE sq.survey_id = ?
        ORDER BY sq.question_order;
    `;
    db.query(sql, [studentId, surveyId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
        }
        console.log(results);
        
        res.json({ success: true, responses: results });
    });
};

// End Survey
exports.endSurvey = (req, res) => {
    const { surveyId } = req.params;
    db.query(
        'UPDATE surveys SET status = "InActive", end_date = CURDATE() WHERE id = ?',
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