const db = require('../../config/db');

//✅
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
//✅
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

//✅
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
//✅
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
//✅
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
//✅
exports.getStudentDetails = (req, res) => {
  const { studentId } = req.params;

  const studentSql = `
    SELECT s.*, sec.section_name, g.grade_name, g.id AS grade_id,
           u.name AS mentor_name, m.roll AS mentor_roll
    FROM Students s
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    LEFT JOIN Mentors m ON s.mentor_id = m.id
    LEFT JOIN Users u ON m.phone = u.phone
    WHERE s.id = ?
  `;

  db.query(studentSql, [studentId], (err, studentResults) => {
    if (err) {
      console.error('Error fetching student details:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch student details' });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = studentResults[0];

    res.json({
      success: true,
      student,
    });
  });
};

//✅
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

//✅
exports.getAttendance = (req, res) => {
  const { roll } = req.params;
  // console.log(roll);

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
    // console.log(results);

    res.json({ success: true, studentAttendance: results });
  });
};

//✅
exports.getStudentIssueLogs = (req, res) => {
  const { roll } = req.params;

  const sql = `
    SELECT COUNT(*) as count
    FROM student_dicipline
    WHERE roll = ?
  `;

  const sql2 = `
    SELECT 
      COALESCE(SUM(redo_count), 0) AS total_redo_count
    FROM 
      student_homework
    WHERE 
      student_roll = ? AND (status = 'Done' OR status = 'Redo')
  `;

  db.query(sql, [roll], (err, results) => {
    if (err) {
      console.error('Error fetching student issue count:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch issue count' });
    }

    db.query(sql2, [roll], (err, results2) => {
      if (err) {
        console.error('Error fetching student homework count:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch homework data' });
      }

      const issueCount = results[0]?.count || 0;
      const redoCount = results2[0]?.total_redo_count || 0;

      res.json({
        success: true,
        studentIssueCount: issueCount,
        studentRedoCount: redoCount
      });
      console.log(issueCount, redoCount);

    });
  });
};

//✅
// Get discipline issues by grade and section
exports.getStudentDisciplineLogs = async (req, res) => {
  const { sectionId } = req.params;
  console.log(sectionId);

  try {
    const [rows] = await db.promise().query(`
      SELECT sd.*,
       s.name as student_name,
       s.id as student_id,
       s.profile_photo,
       sd.roll as student_roll,
       COALESCE(ad.id, c.id, mn.id) as registered_by_id,
       up.file_path as registered_by_profile
FROM student_dicipline sd
JOIN Students s ON sd.roll = s.roll
LEFT JOIN Admins ad ON sd.registered_by_phone = ad.phone
LEFT JOIN Coordinators c ON sd.registered_by_phone = c.phone
LEFT JOIN Mentors mn ON sd.registered_by_phone = mn.phone
LEFT JOIN User_photos up ON sd.registered_by_phone = up.phone
WHERE s.section_id = ?
ORDER BY sd.registered_at DESC;
    `, [sectionId]);

    res.status(200).json({ success: true, issues: rows });
  } catch (error) {
    console.error("Error fetching discipline logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs." });
  }
};

//✅
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
// exports.getStudentBacklogs = (req, res) => {
//   const { gradeId, section } = req.params;

//   const sql = `
//     SELECT b.id, s.name AS student_name, s.roll AS student_roll,
//            sub.subject_name, b.level, b.material_id,
//            b.due_date, b.days_overdue,
//            DATEDIFF(CURRENT_DATE, b.due_date) AS days_late
//     FROM Backlogs b
//     JOIN Students s ON b.student_id = s.id
//     JOIN Sections sec ON s.section_id = sec.id
//     JOIN Grades g ON sec.grade_id = g.id
//     JOIN Subjects sub ON b.subject_id = sub.id
//     WHERE g.id = ? AND sec.section_name = ?
//     ORDER BY b.due_date ASC
//   `;

//   db.query(sql, [gradeId, section], (err, results) => {
//     if (err) {
//       console.error('Error fetching student backlogs:', err);
//       return res.status(500).json({ success: false, message: 'Failed to fetch student backlogs' });
//     }

//     res.json({ success: true, backlogs: results });
//   });
// };

exports.getStudentBacklogs = async (req, res) => {
  const { sectionId } = req.params;
  // console.log(sectionId);

  try {

    const [rows] = await db.promise().query(`
      SELECT DISTINCT
        s.roll AS student_roll,
        s.name AS student_name,
        s.profile_photo,
        sub.subject_name,
        sl.level,
        m.expected_date,
        DATEDIFF(CURDATE(), m.expected_date) AS days_overdue
      FROM student_levels sl
      JOIN students s ON sl.student_roll = s.roll
      JOIN sections sec ON s.section_id = sec.id
      JOIN materials m ON sl.level = m.level 
        AND sl.subject_id = m.subject_id 
        AND sec.grade_id = m.grade_id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sl.status = 'OnGoing' 
        AND m.expected_date <= CURDATE()
        AND s.section_id = ?
    `, [sectionId]);

    res.json({ success: true, overdueStudents: rows });
    // console.log(overdueStudents);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

// Search mentors by name or roll
exports.searchMentors = (req, res) => {
  const { gradeId } = req.query;
  console.log(gradeId);

  if (!gradeId) {
    return res.status(400).json({ success: false, message: 'Missing gradeId' });
  }

  const sql = `
    SELECT m.id, m.roll, u.name, u.phone, up.file_path AS profile_photo
    FROM Mentors m
    JOIN Users u ON m.phone = u.phone
    LEFT JOIN User_Photos up ON u.phone = up.phone
    WHERE m.grade_id = ?
    ORDER BY u.name
  `;

  db.query(sql, [gradeId], (err, results) => {
    if (err) {
      console.error('Error fetching mentors:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch mentors' });
    }

    res.json({ success: true, mentors: results });
    console.log(results);

  });
};


// Update student's mentor
exports.updateStudentMentor = (req, res) => {
  const { studentId, mentorId } = req.body;

  // First validate that both student and mentor exist
  const validateSql = `
    SELECT s.id AS student_id, m.id AS mentor_id
    FROM Students s, Mentors m
    WHERE s.id = ? AND m.id = ?
  `;

  db.query(validateSql, [studentId, mentorId], (err, results) => {
    if (err) {
      console.error('Error validating student/mentor:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Student or mentor not found' });
    }

    // Update the student's mentor
    const updateSql = `
      UPDATE Students 
      SET mentor_id = ?
      WHERE id = ?
    `;

    db.query(updateSql, [mentorId, studentId], (err, updateResults) => {
      if (err) {
        console.error('Error updating mentor:', err);
        return res.status(500).json({ success: false, message: 'Failed to update mentor' });
      }

      console.log('Mentor updated successfully:', updateResults);

      res.json({
        success: true,
        message: 'Mentor updated successfully',
        studentId,
        mentorId
      });
    });
  });
};

//Schedule delete
exports.deleteSchedulesByGradeAndDate = (req, res) => {
  const { grade_id, date } = req.body;

  if (!grade_id || !date) {
    return res.status(400).json({ success: false, message: "Missing gradeId or date" });
  }

  const getSectionsSql = `SELECT id FROM sections WHERE grade_id = ?`;
  db.query(getSectionsSql, [grade_id], (err, sections) => {
    if (err) return res.status(500).json({ success: false, message: "DB error on fetching sections" });

    if (sections.length === 0) return res.status(404).json({ success: false, message: "No sections found for grade" });

    const sectionIds = sections.map(s => s.id);

    // Step 1: Get matching daily_schedules
    const getSchedulesSql = `
      SELECT id FROM daily_schedule
      WHERE section_id IN (?) AND date = ?
    `;
    db.query(getSchedulesSql, [sectionIds, date], (err, schedules) => {
      if (err) return res.status(500).json({ success: false, message: "DB error fetching schedules" });

      if (schedules.length === 0) return res.status(404).json({ success: false, message: "No schedules found for this date" });

      const scheduleIds = schedules.map(s => s.id);

      // Step 2: Delete related records
      // const deleteAcademicSessions = `DELETE FROM academic_sessions WHERE dsa_id IN (?)`;
      // const deleteAssessmentSessions = `DELETE FROM assessment_sessions WHERE dsa_id IN (?)`;
      // const deleteDailySchedule = `DELETE FROM daily_schedule WHERE id IN (?)`;

      const deleteAcademicSessions = `UPDATE academic_sessions SET status = 'Cancelled' WHERE dsa_id IN (?)`;
      const deleteAssessmentSessions = `UPDATE assessment_sessions SET status = 'Cancelled' WHERE dsa_id IN (?)`;
      const deleteDailySchedule = `UPDATE daily_schedule SET status = 'Cancelled' WHERE id IN (?)`;

      db.query(deleteAcademicSessions, [scheduleIds], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to delete academic_sessions" });

        db.query(deleteAssessmentSessions, [scheduleIds], (err) => {
          if (err) return res.status(500).json({ success: false, message: "Failed to delete assessment_sessions" });

          db.query(deleteDailySchedule, [scheduleIds], (err) => {
            if (err) return res.status(500).json({ success: false, message: "Failed to delete daily_schedule" });

            return res.json({
              success: true,
              message: `Deleted schedules and related data for ${scheduleIds.length} sessions.`,
              deletedScheduleIds: scheduleIds
            });
          });
        });
      });
    });
  });
};

//Get all coordinators
exports.getAllCoordinators = (req, res) => {
  const sql = `
    SELECT u.name, c.phone, c.roll, up.file_path
    FROM Coordinators c
    JOIN Users u ON c.phone = u.phone
    LEFT JOIN user_photos up ON c.phone = up.phone
    ORDER BY c.roll
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching coordinators:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, coordinators: results });
  });
};

//GetSelectedCoordinatorRoles
exports.getRoles = (req, res) => {
  const { phoneNumber } = req.body;

  const query = `
    SELECT u.name, u.roles, cga.grade_id
    FROM Users u
    JOIN Coordinators c ON u.phone = c.phone 
    JOIN coordinator_grade_assignments cga ON c.id = cga.coordinator_id
    WHERE u.phone = ?
  `;

  db.query(query, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Invalid phone number' });

    console.log('Coordinator Roles:', results);

    try {
      // Group results
      const grouped = {};
      results.forEach(row => {
        const key = `${row.name}-${row.roles}`;
        if (!grouped[key]) {
          grouped[key] = {
            name: row.name,
            roles: row.roles.split(',').map(role => role.trim()),
            grades: []
          };
        }
        grouped[key].grades.push(row.grade_id);
      });

      const userData = Object.values(grouped);

      res.json({ success: true, data: userData });
    } catch (error) {
      console.error('Unable to process roles:', error);
      return res.status(500).json({ success: false, message: 'Roles fetch error' });
    }
  });
};

//Coordinator Leave Approval
exports.getPendingLeaveRequests = (req, res) => {

  const query = `
    SELECT flr.*, up.file_path, c.roll
FROM facultyleaverequests flr
JOIN Users u ON flr.phone = u.phone
JOIN User_photos up ON u.phone = up.phone
JOIN Coordinators c ON u.phone = c.phone
WHERE u.roles LIKE '%Coordinator%'
  AND flr.status = 'Pending'
ORDER BY flr.requested_at DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, leaveRequests: results });
  });
};

// Get leave request history for mentor's section
exports.getLeaveRequestHistory = (req, res) => {

  const query = `
    SELECT flr.*, up.file_path, c.roll
FROM facultyleaverequests flr
JOIN Users u ON flr.phone = u.phone
JOIN User_photos up ON u.phone = up.phone
JOIN Coordinators c ON u.phone = c.phone
WHERE u.roles LIKE '%Coordinator%'
  AND flr.status IN ('Approved', 'Rejected')
ORDER BY flr.requested_at DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, leaveRequests: results });
  });
};

exports.updateLeaveRequestStatus = (req, res) => {
  const { requestId, status, rejectionReason, phone, noOfDays } = req.body;
  console.log(requestId, status, rejectionReason, phone, noOfDays);

  let query, params;

  if (status === 'Rejected') {
    query = `
      UPDATE facultyleaverequests 
      SET status = ?, rejected_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `;
    params = [status, rejectionReason, requestId];
  } else {
    query = `
      UPDATE facultyleaverequests 
      SET status = ?, approved_at = NOW()
      WHERE id = ?
    `;
    params = [status, requestId];
  }

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: err.message });

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: err.message });
      }

      connection.query(query, params, (err, result) => {
        if (err || result.affectedRows === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: err ? err.message : 'Leave request not found' });
          });
        }

        if (status === 'Approved') {
          connection.query(
            `SELECT leave_days FROM facultyattendance WHERE phone = ?`,
            [phone],
            (err, results) => {
              if (err || results.length === 0) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    error: err ? err.message : 'Could not find faculty attendance record'
                  });
                });
              }

              connection.query(
                `UPDATE facultyattendance 
                 SET leave_days = leave_days + ?
                 WHERE phone = ?`,
                [noOfDays, phone],
                (err, result) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({ error: err.message });
                    });
                  }

                  connection.commit(err => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: err.message });
                      });
                    }

                    connection.release();
                    res.json({
                      success: true,
                      message: 'Leave approved and attendance updated'
                    });
                  });
                }
              );
            }
          );
        } else {
          // Rejection: just commit
          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: err.message });
              });
            }

            connection.release();
            res.json({
              success: true,
              message: 'Leave request rejected successfully'
            });
          });
        }
      });
    });
  });
};

//Logs
// Get requested venues (status = 'Requested' and is_approved = 0)
exports.getRequestedVenues = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT v.*, c.roll, u.name AS created_by_name, up.file_path
      FROM venues v
      JOIN Coordinators c ON v.created_by = c.phone
      JOIN Users u ON v.created_by = u.phone
      JOIN User_photos up ON v.created_by = up.phone
      WHERE venue_status = 'Requested' AND is_accepted = 0
      ORDER BY created_at DESC
    `);
    res.json({ success: true, venues: rows });
  } catch (e) {
    console.error('Error fetching requested venues:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch venue requests' });
  }
};

// Update venue status (approve/reject)
exports.updateVenueStatus = async (req, res) => {
  const { venueId, action } = req.body;

  if (!venueId || !action) {
    return res.status(400).json({ success: false, message: 'Missing venueId or action' });
  }

  let status, approved;
  if (action === 'approve') {
    status = 'Approved';
    approved = 1;
  } else if (action === 'reject') {
    status = 'Rejected';
    approved = 0;
  } else {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  try {
    await db.promise().query(
      `UPDATE venues SET venue_status = ?, is_accepted = ? WHERE id = ?`,
      [status, approved, venueId]
    );
    res.json({ success: true, message: `Venue ${status.toLowerCase()} successfully` });
  } catch (e) {
    console.error('Error updating venue status:', e);
    res.status(500).json({ success: false, message: 'Failed to update venue status' });
  }
};

// Get unstarted classes (where status is not 'In Progress' after start time)
exports.getUnstartedClassesAdmin = async (req, res) => {
  try {

    const query = `
          SELECT 
  ds.id,
  ds.date,
  ds.start_time,
  ds.end_time,
  s.subject_name,
  sec.section_name,
  g.grade_name,
  u.name AS mentor_name,
  m.roll AS mentor_roll,
  m.phone AS mentor_phone
FROM daily_schedule ds
JOIN sections sec ON ds.section_id = sec.id
JOIN grades g ON sec.grade_id = g.id
JOIN subjects s ON ds.subject_id = s.id
JOIN mentors m ON ds.mentors_id = m.id
JOIN users u ON m.phone = u.phone
LEFT JOIN academic_sessions ac ON ac.dsa_id = ds.id
WHERE (
    u.roles LIKE '%Mentor%' AND
    u.roles LIKE '%Coordinator%'
  )
  AND ds.date = '2025-06-03'
  AND ds.start_time < '09:54:00'
  AND (ac.status IS NULL OR ac.status != 'In Progress')
ORDER BY ds.start_time;
        `;

    const [results] = await db.promise().query(query);
    res.json({ success: true, classes: results });
  } catch (e) {
    console.error('Error fetching unstarted classes:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch unstarted classes' });
  }
};

// Get assessment requests (same as coordinator's endpoint)
exports.getAssessmentRequestsAdmin = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
  ar.id,
  ar.date,
  ar.start_time,
  ar.end_time,
  ar.status,
  g.grade_name,
  sec.section_name,
  sub.subject_name,
  ar.mentor_id,
  u.name AS mentor_name,
  m.roll AS mentor_roll,
  up.file_path,
  COUNT(asr.student_id) AS student_count,
  GROUP_CONCAT(DISTINCT asr.level ORDER BY asr.level) AS levels,
  CONCAT(
    TIME_FORMAT(ar.start_time, '%h:%i %p'), 
    ' - ', 
    TIME_FORMAT(ar.end_time, '%h:%i %p')
  ) AS time_range
FROM assessment_requests ar
JOIN grades g ON ar.grade_id = g.id
JOIN sections sec ON ar.section_id = sec.id
JOIN subjects sub ON ar.subject_id = sub.id
LEFT JOIN assessment_students asr ON ar.id = asr.assessment_id
LEFT JOIN Mentors m ON ar.mentor_id = m.id
JOIN users u ON m.phone = u.phone
LEFT JOIN user_photos up ON m.phone = up.phone
WHERE (
    u.roles LIKE '%Mentor%' AND
    u.roles LIKE '%Coordinator%'
  )
        AND ar.status = 'Pending'
        GROUP BY 
  ar.id,
  ar.date,
  ar.start_time,
  ar.end_time,
  ar.status,
  g.grade_name,
  sec.section_name,
  sub.subject_name,
  up.file_path
ORDER BY ar.date DESC, ar.start_time DESC;
    `);

    res.json({ success: true, requestedAssessments: rows });
  } catch (e) {
    console.error('Error fetching assessment requests:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch assessment requests' });
  }
};

// Process assessment request (approve/reject)
exports.processAssessmentRequestAdmin = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (action === 'cancel') {
      await db.promise().query(
        `UPDATE assessment_requests SET status = 'Rejected' WHERE id = ?`,
        [requestId]
      );
      return res.json({ success: true, message: 'Assessment request cancelled' });
    }

    const [request] = await db.promise().query(
      `SELECT * FROM assessment_requests WHERE id = ?`,
      [requestId]
    );

    if (!request.length) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const assessment = request[0];

    // ✅ Get a promise-compatible connection
    const conn = await db.promise().getConnection();

    try {
      await conn.query('START TRANSACTION');

      // 0. Delete from assessment_sessions by dsa_id
      await conn.query(
        `DELETE FROM assessment_sessions 
     WHERE dsa_id IN (
       SELECT id FROM daily_schedule 
       WHERE section_id = ? 
         AND date = ? 
         AND (
           (start_time < ? AND end_time > ?) OR
           (start_time >= ? AND start_time < ?) OR
           (end_time > ? AND end_time <= ?)
         )
     )`,
        [
          assessment.section_id,
          assessment.date,
          assessment.end_time, assessment.start_time,
          assessment.start_time, assessment.end_time,
          assessment.start_time, assessment.end_time
        ]
      );

      // 0b. Optionally delete from acadamic_sessions if used
      await conn.query(
        `DELETE FROM academic_sessions 
     WHERE dsa_id IN (
       SELECT id FROM daily_schedule 
       WHERE section_id = ? 
         AND date = ? 
         AND (
           (start_time < ? AND end_time > ?) OR
           (start_time >= ? AND start_time < ?) OR
           (end_time > ? AND end_time <= ?)
         )
     )`,
        [
          assessment.section_id,
          assessment.date,
          assessment.end_time, assessment.start_time,
          assessment.start_time, assessment.end_time,
          assessment.start_time, assessment.end_time
        ]
      );

      // 1. Delete existing sessions in time slot
      await conn.query(
        `DELETE FROM daily_schedule 
           WHERE section_id = ? 
           AND date = ? 
           AND (
             (start_time < ? AND end_time > ?) OR
             (start_time >= ? AND start_time < ?) OR
             (end_time > ? AND end_time <= ?)
           )`,
        [
          assessment.section_id,
          assessment.date,
          assessment.end_time, assessment.start_time,
          assessment.start_time, assessment.end_time,
          assessment.start_time, assessment.end_time
        ]
      );

      // 2. Insert into daily_schedule
      const insertResult = await conn.query(
        `INSERT INTO daily_schedule 
           (section_id, date, start_time, end_time, subject_id, mentors_id, activity)
           VALUES (?, ?, ?, ?, ?, ?, 5)`,
        [
          assessment.section_id,
          assessment.date,
          assessment.start_time,
          assessment.end_time,
          assessment.subject_id,
          assessment.mentor_id
        ]
      );

      const newScheduleId = insertResult.insertId || insertResult[0]?.insertId;

      function toLocalDateOnly(utcString) {
        const localDate = new Date(utcString); // converts to local timezone
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // 0-indexed
        const day = String(localDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // 3. Insert into assessment_sessions
      await conn.query(
        `INSERT INTO assessment_sessions 
           (dsa_id, section_id, date, subject_id, mentor_id, start_time, end_time)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newScheduleId,
          assessment.section_id,
          toLocalDateOnly(assessment.date),
          assessment.subject_id,
          assessment.mentor_id,
          assessment.start_time,
          assessment.end_time,
          assessment.levels
        ]
      );

      // 4. Update request status
      await conn.query(
        `UPDATE assessment_requests SET status = 'Approved' WHERE id = ?`,
        [requestId]
      );

      await conn.query('COMMIT');
      await conn.release();
      res.json({ success: true, message: 'Assessment scheduled successfully' });
    } catch (error) {
      await conn.query('ROLLBACK');
      await conn.release();
      throw error;
    }
  } catch (error) {
    console.error("Error processing assessment request:", error);
    res.status(500).json({ success: false, message: "Failed to process assessment request" });
  }
};

// Get all logs (combined endpoint)
exports.getAllAdminLogs = async (req, res) => {
  try {
    const [venues] = await db.promise().query(`
      SELECT * FROM venues
      WHERE venue_status = 'Requested' AND is_approved = 0
      ORDER BY created_at DESC
    `);

    const today = new Date().toISOString().slice(0, 10);
    const [classes] = await db.promise().query(`
      SELECT 
        ds.id,
        ds.date,
        ds.start_time,
        ds.end_time,
        s.subject_name,
        sec.section_name,
        g.grade_name,
        u.name as mentor_name,
        m.roll as mentor_roll,
        u.phone as mentor_phone,
        ds.activity
      FROM daily_schedule ds
      JOIN subjects s ON ds.subject_id = s.id
      JOIN sections sec ON ds.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN mentors m ON ds.mentors_id = m.id
      JOIN users u ON m.phone = u.phone
      LEFT JOIN academic_sessions ac ON ac.dsa_id = ds.id
      LEFT JOIN assessment_sessions ass ON ass.dsa_id = ds.id
      WHERE ds.date = ?
        AND ds.start_time < CURTIME()
        AND (
          (ds.activity = 1 AND (ac.status IS NULL OR ac.status != 'In Progress'))
          OR
          (ds.activity = 5 AND (ass.status IS NULL OR ass.status != 'In Progress'))
        )
      ORDER BY ds.start_time
    `, [today]);

    const [assessments] = await db.promise().query(`
      SELECT 
        ar.id,
        ar.date,
        ar.start_time,
        ar.end_time,
        ar.levels,
        s.subject_name,
        sec.section_name,
        g.grade_name,
        u.name as mentor_name,
        m.roll as mentor_roll,
        u.phone as mentor_phone,
        COUNT(DISTINCT ars.student_roll) as student_count
      FROM assessment_requests ar
      JOIN subjects s ON ar.subject_id = s.id
      JOIN sections sec ON ar.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN mentors m ON ar.mentor_id = m.id
      JOIN users u ON m.phone = u.phone
      LEFT JOIN assessment_request_students ars ON ar.id = ars.assessment_request_id
      WHERE ar.status = 'Pending'
      GROUP BY ar.id
      ORDER BY ar.created_at DESC
    `);

    res.json({
      success: true,
      venues: venues || [],
      classes: classes || [],
      requestedAssessments: assessments || []
    });
  } catch (e) {
    console.error('Error fetching all admin logs:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch admin logs' });
  }
};