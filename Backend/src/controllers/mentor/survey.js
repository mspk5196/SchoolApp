const db = require('../../config/db');

// // Create Survey

// exports.createSurvey = (req, res) => {
//     const { mentorId, taskType, title, gradeId, sectionId, startDate, endDate, amount, description, students, clarityTeaching, clarityMaterials, timeMgmt, satisfaction } = req.body;

//     if (taskType === 'Collect Fee') {
//         if (!amount) {
//             return res.status(400).json({ success: false, message: 'Amount is required for Collect Fee task type' });
//         }
//         else {
//             const sql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, amount, description, status) VALUES (?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)`;
//             db.query(sql, [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, amount, description, new Date() < new Date(endDate) ? 'Active' : 'InActive'], (err, result) => {
//                 if (err) {
//                     return res.status(500).json({ success: false, message: err.message });
//                 }
//                 const surveyId = result.insertId;
//                 const studentValues = students.map(studentId => [surveyId, studentId]);
//                 // Insert survey students
//                 db.query('INSERT INTO survey_students (survey_id, student_id) VALUES ?', [studentValues], (err) => {
//                     if (err) {
//                         return res.status(500).json({ success: false, message: err.message });
//                     }
//                     res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
//                 });
//             });
//         }
//     } else if (taskType === 'Feedback') {
//         if (!clarityTeaching || !clarityMaterials || !timeMgmt || !satisfaction) {
//             return res.status(400).json({ success: false, message: 'All feedback scores are required for Feedback task type' });
//         }
//         else {
//             const sql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, amount, description, status, clty_fcty_teaching, clty_fcty_materials, time_management, over_all) VALUES (?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?, ?, ?, ?, ?)`;
//             db.query(sql, [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, null, description, new Date() < new Date(endDate) ? 'Active' : 'InActive', clarityTeaching, clarityMaterials, timeMgmt, satisfaction], (err, result) => {
//                 if (err) {
//                     return res.status(500).json({ success: false, message: err.message });
//                 }
//                 const surveyId = result.insertId;
//                 const studentValues = students.map(studentId => [surveyId, studentId]);
//                 // Insert survey students
//                 db.query('INSERT INTO survey_students (survey_id, student_id) VALUES ?', [studentValues], (err) => {
//                     if (err) {
//                         return res.status(500).json({ success: false, message: err.message });
//                     }
//                     res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
//                 });
//             });
//         }
//     }
//     else {
//         const sql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, description, status) VALUES (?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)`;
//         db.query(sql, [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, null, description, new Date() < new Date(endDate) ? 'Active' : 'InActive'], (err, result) => {
//             if (err) {
//                 return res.status(500).json({ success: false, message: err.message });
//             }
//             const surveyId = result.insertId;
//             const studentValues = students.map(studentId => [surveyId, studentId]);
//             // Insert survey students
//             db.query('INSERT INTO survey_students (survey_id, student_id) VALUES ?', [studentValues], (err) => {
//                 if (err) {
//                     return res.status(500).json({ success: false, message: err.message });
//                 }
//                 res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
//             });
//         });
//     }

// };


// // Get all grades
// exports.getGrades = (req, res) => {
//     const sql = `SELECT * FROM Grades`;
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Error fetching grades:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         res.json({ success: true, grades: results });
//     });
// };
// exports.getSectionsByGrade = (req, res) => {
//     const gradeId = req.query.gradeId;
//     console.log(gradeId);

//     const sql = `SELECT * FROM Sections WHERE grade_id = ?`;
//     db.query(sql, [gradeId], (err, results) => {
//         if (err) {
//             console.error("Error fetching sections:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         console.log(results);

//         res.json({ success: true, sections: results });
//     });
// };
// exports.getMentorStudents = (req, res) => {
//     const section = req.query.sectionId;
//     // console.log(section);

//     const sql = `SELECT id, name, roll FROM Students WHERE section_id = ?`;
//     db.query(sql, [section], (err, results) => {
//         if (err) {
//             console.error("Error fetching students:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         console.log(results);

//         res.json({ success: true, students: results });
//     });
// };

// // Get Surveys for Mentor
// exports.getMentorSurveys = (req, res) => {
//     const { mentorId } = req.params;

//     db.query(
//         `SELECT s.*, g.grade_name, sec.section_name, 
//     COUNT(ss.student_id) AS student_count
//     FROM surveys s
//     LEFT JOIN grades g ON s.grade_id = g.id
//     LEFT JOIN sections sec ON s.section_id = sec.id
//     LEFT JOIN survey_students ss ON s.id = ss.survey_id
//     WHERE s.mentor_id = ?
//     GROUP BY s.id
//     ORDER BY s.created_at DESC`,
//         [mentorId],
//         (err, surveys) => {
//             if (err) return res.status(500).json({ error: err.message });

//             // Calculate status based on current date
//             const currentDate = new Date();
//             const processed = surveys.map(survey => ({
//                 ...survey,
//                 status: new Date(survey.end_date) > currentDate ? 'Active' : 'InActive',
//                 time: `${new Date(survey.start_date).toLocaleDateString()} - ${new Date(survey.end_date).toLocaleDateString()}`
//             }));

//             res.json(processed);
//         }
//     );
// };

// // Get Survey Details
// exports.getSurveyDetails = (req, res) => {
//     const { surveyId } = req.params;

//     db.query(
//         `SELECT s.*, g.grade_name, sec.section_name
//     FROM surveys s
//     LEFT JOIN grades g ON s.grade_id = g.id
//     LEFT JOIN sections sec ON s.section_id = sec.id
//     WHERE s.id = ?`,
//         [surveyId],
//         (err, survey) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (survey.length === 0) return res.status(404).json({ error: 'Survey not found' });

//             res.json(survey[0]);
//         }
//     );
// };
// // Get Survey Students
// exports.getSurveyStudents = (req, res) => {
//     const { surveyId } = req.params;

//     db.query(
//         `SELECT s.id, s.name, ss.completed, s.roll, s.profile_photo
//     FROM survey_students ss
//     LEFT JOIN students s ON ss.student_id = s.id
//     WHERE ss.survey_id = ?`,
//         [surveyId],
//         (err, students) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json(students);
//         }
//     );
// };

// // End Survey
// exports.endSurvey = (req, res) => {
//     const { surveyId } = req.params;

//     db.query(
//         'UPDATE surveys SET status = "inactive", end_date = NOW() WHERE id = ?',
//         [surveyId],
//         (err, result) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (result.affectedRows === 0) {
//                 return res.status(404).json({ error: 'Survey not found' });
//             }
//             res.json({ message: 'Survey ended successfully' });
//         }
//     );
// };

// // Submit Feedback Response
// exports.submitFeedback = (req, res) => {
//     db.beginTransaction((err, transaction) => {
//         if (err) return res.status(500).json({ success: false, message: err.message });

//         const { surveyId, studentId, scores } = req.body;

//         // 1. Insert response
//         transaction.query(
//             `INSERT INTO survey_responses 
//       (survey_id, student_id, clarity_teaching, clarity_materials, 
//        time_management, satisfaction, comments)
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//             [
//                 surveyId,
//                 studentId,
//                 scores.clarityTeaching,
//                 scores.clarityMaterials,
//                 scores.timeManagement,
//                 scores.satisfaction,
//                 scores.comments
//             ],
//             (err) => {
//                 if (err) {
//                     return transaction.rollback(() => {
//                         if (err.code === 'ER_DUP_ENTRY') {
//                             return res.status(400).json({ error: 'Response already submitted' });
//                         }
//                         res.status(400).json({ error: err.message });
//                     });
//                 }

//                 // 2. Update completion status
//                 transaction.query(
//                     `UPDATE survey_students 
//           SET completed = 1 
//           WHERE survey_id = ? AND student_id = ?`,
//                     [surveyId, studentId],
//                     (err) => {
//                         if (err) {
//                             return transaction.rollback(() => {
//                                 res.status(500).json({ error: err.message });
//                             });
//                         }

//                         transaction.commit((err) => {
//                             if (err) {
//                                 return transaction.rollback(() => {
//                                     res.status(500).json({ error: err.message });
//                                 });
//                             }
//                             res.json({ message: 'Feedback submitted successfully' });
//                         });
//                     }
//                 );
//             }
//         );
//     });
// };

// Create Survey

// exports.createSurvey = (req, res) => {
//     const { mentorId, taskType, title, gradeId, sectionId, startDate, endDate, amount, description, students, term, questions } = req.body;

//     let baseSql, baseParams;

//     if (taskType === 'Collect Fee') {
//         if (!amount) {
//             return res.status(400).json({ success: false, message: 'Amount is required for Collect Fee task type' });
//         }
//         baseSql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, amount, description, status, term) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//         baseParams = [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, amount, description, 'Active', null];
//     } else if (taskType === 'Feedback') {
//         if (!questions || !Array.isArray(questions) || questions.length === 0) {
//             return res.status(400).json({ success: false, message: 'At least one question is required for Feedback surveys.' });
//         }
//         baseSql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, description, status, term) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//         baseParams = [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, description, 'Active', term];
//     } else { // Other
//         baseSql = `INSERT INTO surveys (mentor_id, task_type, title, grade_id, section_id, start_date, end_date, description, status, term) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//         baseParams = [mentorId, taskType, title, gradeId, sectionId, startDate, endDate, description, 'Active', null];
//     }

//     // Start transaction
//     db.beginTransaction(err => {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Transaction Error: ' + err.message });
//         }

//         // 1. Insert into surveys table
//         db.query(baseSql, baseParams, (err, result) => {
//             if (err) {
//                 return db.rollback(() => {
//                     res.status(500).json({ success: false, message: 'Failed to create survey: ' + err.message });
//                 });
//             }

//             const surveyId = result.insertId;

//             // 2. Insert into survey_students table
//             const studentValues = students.map(studentId => [surveyId, studentId]);
//             db.query('INSERT INTO survey_students (survey_id, student_id) VALUES ?', [studentValues], (err) => {
//                 if (err) {
//                     return db.rollback(() => {
//                         res.status(500).json({ success: false, message: 'Failed to assign students: ' + err.message });
//                     });
//                 }

//                 // 3. If it's a Feedback survey, insert questions
//                 if (taskType === 'Feedback') {
//                     const questionValues = questions.map((q, index) => [
//                         surveyId,
//                         q.question_text,
//                         q.answer_type,
//                         index
//                     ]);

//                     db.query('INSERT INTO survey_questions (survey_id, question_text, answer_type, question_order) VALUES ?', [questionValues], (err) => {
//                         if (err) {
//                             return db.rollback(() => {
//                                 res.status(500).json({ success: false, message: 'Failed to save questions: ' + err.message });
//                             });
//                         }

//                         // All queries succeeded, commit the transaction
//                         db.commit(err => {
//                             if (err) {
//                                 return db.rollback(() => {
//                                     res.status(500).json({ success: false, message: 'Commit failed: ' + err.message });
//                                 });
//                             }
//                             res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
//                         });
//                     });
//                 } else {
//                     // Not a feedback survey, just commit
//                     db.commit(err => {
//                         if (err) {
//                             return db.rollback(() => {
//                                 res.status(500).json({ success: false, message: 'Commit failed: ' + err.message });
//                             });
//                         }
//                         res.status(201).json({ success: true, id: surveyId, message: 'Survey created successfully' });
//                     });
//                 }
//             });
//         });
//     });
// };

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