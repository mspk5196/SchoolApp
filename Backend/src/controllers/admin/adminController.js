const db = require('../../config/db');

exports.getAdminData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT a.id AS id, a.roll, a.phone, u.name
    FROM Admins a
    JOIN Users u ON a.phone = u.phone
    WHERE a.phone = ?;
  `;
  db.query(sql, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, adminData: results[0] });
  });
};

// Get all grades for admin student home
exports.getGrades = (req, res) => {
  const sql = `SELECT id, grade_name FROM Grades ORDER BY grade_name`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching grades:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }

    res.json({ success: true, grades: results });
  });
};
// Get all grades for admin student home
exports.getGradeSections = (req, res) => {
  const { gradeId } = req.params;
  console.log(gradeId);

  const sql = `SELECT id, section_name 
  FROM Sections
  WHERE grade_id = ?
  ORDER BY section_name`;

  db.query(sql, [gradeId], (err, results) => {
    if (err) {
      console.error('Error fetching grades:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
    console.log(results);

    res.json({ success: true, gradeSections: results });
  });
};

// Get student dashboard stats by grade
exports.getStudentStatsByGrade = (req, res) => {
  const { gradeId } = req.params;

  const sql = `
    SELECT g.id, g.grade_name, COUNT(s.id) AS student_count 
    FROM Grades g
    LEFT JOIN Sections sec ON g.id = sec.grade_id
    LEFT JOIN Students s ON sec.id = s.section_id
    WHERE g.id = ?
    GROUP BY g.id, g.grade_name
  `;

  db.query(sql, [gradeId], (err, results) => {
    if (err) {
      console.error('Error fetching student stats:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch student stats' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    res.json({ success: true, stats: results[0] });
  });
};

// Get students by grade and section
exports.getStudentsByGradeAndSection = (req, res) => {
  const { sectionId } = req.params;
  console.log(sectionId);


  const sql = `
    SELECT s.id, s.roll, s.name, s.profile_photo, sec.section_name, s.section_id, 
           u.name AS mentor_name, m.roll AS mentor_roll
    FROM Students s
    JOIN sections sec ON s.section_id = sec.id
    LEFT JOIN Mentors m ON s.section_id = m.section_id
    LEFT JOIN Users u ON m.phone = u.phone
    WHERE s.section_id = ?
    ORDER BY s.name
  `;

  db.query(sql, [sectionId], (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
    console.log(results);


    res.json({ success: true, students: results });
  });
};

// Search students by name or ID
exports.searchStudents = (req, res) => {
  const { gradeId } = req.params;
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  const sql = `
    SELECT s.id, s.roll, s.name, s.profile_photo, sec.section_name, 
           g.grade_name, m.name AS mentor_name
    FROM Students s
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    LEFT JOIN Mentors m ON sec.id = m.section_id
    WHERE (s.name LIKE ? OR s.roll LIKE ?) AND g.id = ?
    ORDER BY s.name
  `;

  db.query(sql, [searchTerm, searchTerm, gradeId], (err, results) => {
    if (err) {
      console.error('Error searching students:', err);
      return res.status(500).json({ success: false, message: 'Failed to search students' });
    }

    res.json({ success: true, students: results });
  });
};

// Get student details
exports.getStudentDetails = (req, res) => {
  const { studentId } = req.params;

  const studentSql = `
    SELECT s.*, sec.section_name, g.grade_name, 
           u.name AS mentor_name, m.roll AS mentor_roll
    FROM Students s
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    LEFT JOIN Mentors m ON sec.id = m.section_id
    LEFT JOIN Users u ON m.phone = u.phone
    WHERE s.id = ?
  `;

  // const performanceSql = `
  //   SELECT p.subject_id, sub.subject_name, p.level, p.score, p.recorded_at,
  //          (SELECT COUNT(*) FROM Backlogs WHERE student_id = ? AND subject_id = p.subject_id) AS backlog_count
  //   FROM Performance p
  //   JOIN Subjects sub ON p.subject_id = sub.id
  //   WHERE p.student_id = ?
  //   ORDER BY p.recorded_at DESC
  // `;


  db.query(studentSql, [studentId], (err, studentResults) => {
    if (err) {
      console.error('Error fetching student details:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch student details' });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = studentResults[0];

    // db.query(performanceSql, [studentId, studentId], (err, performanceResults) => {
    //   if (err) {
    //     console.error('Error fetching performance data:', err);
    //     return res.status(500).json({ success: false, message: 'Failed to fetch performance data' });
    //   }

    // db.query(issuesSql, [studentId], (err, issuesResults) => {
    //   if (err) {
    //     console.error('Error fetching issue logs:', err);
    //     return res.status(500).json({ success: false, message: 'Failed to fetch issue logs' });
    //   }

    res.json({
      success: true,
      student,
    });
  });
  //   });
  // });
};

exports.getSubjectMentors = (req, res) => {
  const { sectionID } = req.body;

  const sql = `
    SELECT 
      sub.id AS subject_id, 
      sub.subject_name,
      GROUP_CONCAT(DISTINCT CONCAT(u.name, ' (', m.roll, ')') 
        ORDER BY 
          CASE WHEN sms.section_id = ? THEN 0 ELSE 1 END,
          u.name
        SEPARATOR ', '
      ) AS assigned_mentors,
      GROUP_CONCAT(DISTINCT 
        CASE WHEN sms.section_id = ? THEN CONCAT(u.name, '|', m.roll, '|', up.file_path) ELSE NULL END
        SEPARATOR '|'
      ) AS section_mentor_info
    FROM section_subject_activities ss
    JOIN subjects sub ON ss.subject_id = sub.id
    LEFT JOIN mentor_section_assignments msa ON sub.id = msa.subject_id 
      AND (SELECT grade_id FROM sections WHERE id = ?) = msa.grade_id
    LEFT JOIN mentors m ON msa.mentor_id = m.id
    LEFT JOIN users u ON m.phone = u.phone
    LEFT JOIN user_photos up ON m.phone = up.phone
    LEFT JOIN section_mentor_subject sms ON msa.id = sms.msa_id AND sms.section_id = ?
    WHERE ss.section_id = ?
    GROUP BY sub.id, sub.subject_name;
  `;

  db.query(sql, [sectionID, sectionID, sectionID, sectionID, sectionID], (err, results) => {
    if (err) {
      console.error("Error fetching subject mentors data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({
      success: true,
      message: "Subject and mentors data fetched successfully",
      subjectMentors: results.map(subject => ({
        ...subject,
        // Extract the first mentor assigned to this specific section
        sectionMentorName: subject.section_mentor_info ? subject.section_mentor_info.split('|')[0] : null,
        sectionMentorRoll: subject.section_mentor_info ? subject.section_mentor_info.split('|')[1] : null,
        sectionMentorPhoto: subject.section_mentor_info ? subject.section_mentor_info.split('|')[2] : null
      }))
    });
  });
};

exports.getAttendance = (req, res) => {
  const { roll } = req.params;
  console.log(roll);


  const sql = `
    SELECT sa.id, sa.roll,sa.total_days, sa.present_days, sa.leave_days, 
           sa.attendance_percentage
    FROM StudentAttendance sa
    WHERE sa.roll = ?
  `;

  db.query(sql, [roll], (err, results) => {
    if (err) {
      console.error('Error fetching students attendance:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
    console.log(results);


    res.json({ success: true, studentAttendance: results });
  });
};

exports.getStudentIssueLogs = (req, res) => {
  const { roll } = req.params;
  console.log(roll);


  const sql = `
    SELECT COUNT(*) as count
    FROM student_dicipline il
    WHERE il.roll = ?
  `;

  db.query(sql, [roll], (err, results) => {
    if (err) {
      console.error('Error fetching students attendance:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch no of issues' });
    }
    console.log(results);


    res.json({ success: true, studentIssueCount: results });
  });
};

// Get discipline issues by grade and section
exports.getStudentDisciplineLogs = async (req, res) => {
  const {sectionId} = req.params;
  console.log(sectionId);
  
  try {
    const issues = await db.promise().query(`
      SELECT sd.*, s.name as student_name, s.profile_photo, sd.roll as student_roll
      FROM student_dicipline sd
      JOIN Students s ON sd.roll = s.roll
      WHERE s.section_id = ?
      ORDER BY sd.registered_at DESC;
    `,[sectionId]);

    res.status(200).json({ success: true, issues });
  } catch (error) {
    console.error("Error fetching discipline logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs." });
  }
};

// Search discipline issues
exports.searchDisciplineIssues = (req, res) => {
  const { gradeId } = req.params;
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  const sql = `
    SELECT il.id, s.name AS student_name, s.roll AS student_roll,
           il.dc_reason AS reason, il.dc_logged_at AS date,
           m.name AS registered_by, m.roll AS mentor_roll
    FROM Issue_Log il
    JOIN Students s ON il.student_id = s.id
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    LEFT JOIN Mentors m ON il.mentor_id = m.id
    WHERE (s.name LIKE ? OR s.roll LIKE ?) AND g.id = ? AND il.issue_dc > 0
    ORDER BY il.dc_logged_at DESC
  `;

  db.query(sql, [searchTerm, searchTerm, gradeId], (err, results) => {
    if (err) {
      console.error('Error searching discipline issues:', err);
      return res.status(500).json({ success: false, message: 'Failed to search discipline issues' });
    }

    res.json({ success: true, issues: results });
  });
};

// Get student backlogs by grade and section
exports.getStudentBacklogs = (req, res) => {
  const { gradeId, section } = req.params;

  const sql = `
    SELECT b.id, s.name AS student_name, s.roll AS student_roll,
           sub.subject_name, b.level, b.material_id,
           b.due_date, b.days_overdue,
           DATEDIFF(CURRENT_DATE, b.due_date) AS days_late
    FROM Backlogs b
    JOIN Students s ON b.student_id = s.id
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    JOIN Subjects sub ON b.subject_id = sub.id
    WHERE g.id = ? AND sec.section_name = ?
    ORDER BY b.due_date ASC
  `;

  db.query(sql, [gradeId, section], (err, results) => {
    if (err) {
      console.error('Error fetching student backlogs:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch student backlogs' });
    }

    res.json({ success: true, backlogs: results });
  });
};

// Search student backlogs
exports.searchStudentBacklogs = (req, res) => {
  const { gradeId } = req.params;
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  const sql = `
    SELECT b.id, s.name AS student_name, s.roll AS student_roll,
           sub.subject_name, b.level, b.material_id,
           b.due_date, b.days_overdue,
           DATEDIFF(CURRENT_DATE, b.due_date) AS days_late
    FROM Backlogs b
    JOIN Students s ON b.student_id = s.id
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    JOIN Subjects sub ON b.subject_id = sub.id
    WHERE (s.name LIKE ? OR s.roll LIKE ?) AND g.id = ?
    ORDER BY b.due_date ASC
  `;

  db.query(sql, [searchTerm, searchTerm, gradeId], (err, results) => {
    if (err) {
      console.error('Error searching student backlogs:', err);
      return res.status(500).json({ success: false, message: 'Failed to search student backlogs' });
    }

    res.json({ success: true, backlogs: results });
  });
};