const db = require('../../config/db');

exports.mentorStudents = (req, res) => {
  const { mentorId } = req.body;
  const query = `
    SELECT s.id, s.name, s.roll, sec.section_name, sub.subject_name
    FROM Students s
    INNER JOIN Mentors m ON s.section_id = m.section_id
    INNER JOIN Sections sec ON s.section_id = sec.id
    INNER JOIN Subjects sub ON m.subject_id = sub.id
    WHERE m.id = ?;
  `;
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, mentorStudents: results });
  });
};

exports.getMentorData = (req, res) => {
  const { phoneNumber } = req.body;
  const query = `
    SELECT m.id, u.name, m.roll, m.grade_id, sec.section_name, sub.subject_name, m.section_id, m.phone, up.file_path
    FROM Mentors m
    JOIN Users u ON m.phone = u.phone
    JOIN Sections sec ON m.section_id = sec.id
    LEFT JOIN mentor_section_assignments msa ON m.id = msa.mentor_id
    LEFT JOIN Subjects sub ON msa.subject_id = sub.id
    LEFT JOIN User_photos up ON m.phone = up.phone
    WHERE m.phone = ?;
  `;
  db.query(query, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, mentorData: results });
  });
};

exports.getGrades = (req, res) => {

  const sql = `SELECT * FROM Grades`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching grades data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Grades data fetched successfully", grades: results });
  });
};

//Profile
// Get mentor attendance data
exports.getMentorAttendance = (req, res) => {
  const { phone } = req.body;

  const query = `
    SELECT total_days, present_days, leave_days, on_duty_days, attendance_percentage
    FROM facultyattendance
    WHERE phone = ?
  `;

  db.query(query, [phone], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Attendance data not found' });

    res.json({
      success: true,
      attendanceData: results[0]
    });
  });
};


// Get mentor's subject and grade assignments
exports.getMentorAssignments = (req, res) => {
  const { mentorId } = req.body;

  const query = `
    SELECT DISTINCT 
      sub.id AS subject_id, 
      sub.subject_name,
      msa.grade_id
    FROM mentor_section_assignments msa
    JOIN subjects sub ON msa.subject_id = sub.id
    WHERE msa.mentor_id = ?
  `;

  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Extract unique subjects and grades
    const subjects = [];
    const grades = [];
    const seenSubjects = new Set();
    const seenGrades = new Set();

    results.forEach(row => {
      if (!seenSubjects.has(row.subject_id)) {
        subjects.push({
          subject_id: row.subject_id,
          subject_name: row.subject_name
        });
        seenSubjects.add(row.subject_id);
      }

      if (row.grade_id && !seenGrades.has(row.grade_id)) {
        grades.push({
          grade_id: row.grade_id
        });
        seenGrades.add(row.grade_id);
      }
    });

    res.json({
      success: true,
      subjects,
      grades
    });
  });
};

// Get mentor's section information
exports.getMentorSection = (req, res) => {
  const { mentorId } = req.body;

  const query = `
    SELECT s.section_name
    FROM mentors m
    JOIN sections s ON m.section_id = s.id
    WHERE m.id = ?
  `;

  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      section: results[0]?.section_name || 'Not assigned'
    });
  });
};

// Get mentor's issues count
exports.getMentorIssues = (req, res) => {
  const { mentorId } = req.body;

  const query = `
    SELECT COUNT(*) AS count
    FROM issue_log
    WHERE student_id IN (
      SELECT id FROM students WHERE section_id = (
        SELECT section_id FROM mentors WHERE id = ?
      )
    )
  `;

  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      count: results[0]?.count || 0
    });
  });
};

// Submit leave request
exports.submitLeaveRequest = (req, res) => {
  const {
    phone, name, totalLeaveDays,
    leaveType, startDate, endDate, startTime, endTime, description
  } = req.body;

  if (!phone || !name || !leaveType || !startDate || !endDate || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const values = [phone, name, totalLeaveDays, leaveType, startDate, endDate, startTime, endTime, description];

  const insertLeaveSql = `
    INSERT INTO facultyleaverequests (
      phone, name, total_leave_days,
      leave_type, start_date, end_date, start_time, end_time, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertLeaveSql, values, (err, result) => {
    if (err) {
      console.error('Error applying leave for mentor:', phone, err);
      return res.status(500).json({ success: false, message: 'Database error while submitting leave request' });
    }

    res.json({
      success: true,
      message: 'Leave request submitted successfully',
      leaveId: result.insertId
    });

  });
};

// Get leave history
exports.getLeaveHistory = (req, res) => {
  const { phone } = req.body;

  const query = `
    SELECT flr.id, flr.name, flr.phone, flr.leave_type, flr.start_date, flr.end_date, 
           flr.start_time, flr.end_time, flr.description, flr.status,
           flr.requested_at, flr.approved_at, flr.rejected_at, flr.total_leave_days,
           up.file_path
    FROM facultyleaverequests flr
    LEFT JOIN user_photos up ON flr.phone = up.phone
    WHERE flr.phone = ?
    ORDER BY requested_at DESC
  `;

  db.query(query, [phone], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      leaveRequests: results
    });

    console.log(results);
  });
};

//Materials
exports.getGradeSubject = (req, res) => {
  const { gradeID } = req.body;
  console.log("Received gradeID:", (req.body.sectionID || gradeID));
  const sql = `
    SELECT DISTINCT sub.id AS subject_id, sub.subject_name
    FROM section_subject_activities ss
    JOIN sections sec ON ss.section_id = sec.id
    JOIN subjects sub ON ss.subject_id = sub.id
    WHERE sec.grade_id = ?;
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject data fetched successfully", gradeSubjects: results });
  });
};

exports.getMaterials = async (req, res) => {
  const { gradeID, subjectID } = req.query;
  console.log(`[GET] /api/mentor/getMaterials?gradeID=${gradeID}&subjectID=${subjectID}`);

  if (!gradeID || !subjectID) {
    return res.status(400).json({ error: 'Missing gradeID or subjectID' });
  }

  const sql = `
    SELECT * FROM materials 
      WHERE grade_id = ? AND subject_id = ?
      ORDER BY level
  `;
  db.query(sql, [gradeID, subjectID], (err, results) => {
    if (err) {
      console.error("Error fetching subjects materials data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject materials data fetched successfully", materials: results });
    console.log(results);

  });
};
exports.updateExpectedDate = (req, res) => {
  const { level, grade_id, subject_id, expected_date } = req.body;

  const sql = `
    UPDATE Materials
    SET expected_date = ?
    WHERE level = ? AND grade_id = ? AND subject_id = ?
  `;

  db.query(sql, [expected_date, level, grade_id, subject_id], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, message: "Expected date updated successfully" });
  });
};

//LeaveApproval
// Get pending leave requests for mentor's section
exports.getPendingLeaveRequests = (req, res) => {
  const { sectionId } = req.body;
  console.log(sectionId);

  const query = `
    SELECT slr.* , s.profile_photo
    FROM studentleaverequests slr
    JOIN students s ON slr.student_roll = s.roll
    WHERE slr.section_id = ? AND slr.status = 'Pending'
    ORDER BY slr.requested_at DESC
  `;

  db.query(query, [sectionId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, leaveRequests: results });
  });
};

// Get leave request history for mentor's section
exports.getLeaveRequestHistory = (req, res) => {
  const { sectionId } = req.body;

  const query = `
    SELECT slr.* , s.profile_photo
    FROM studentleaverequests slr
    JOIN students s ON slr.student_roll = s.roll
    WHERE slr.section_id = ? AND slr.status IN ('Approved', 'Rejected')
    ORDER BY slr.requested_at DESC
  `;

  db.query(query, [sectionId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, leaveRequests: results });
  });
};

// Update leave request status
// exports.updateLeaveRequestStatus = (req, res) => {
//   const { requestId, status, rejectionReason } = req.body;

//   let query, params;

//   if (status === 'Rejected') {
//     query = `
//       UPDATE studentleaverequests 
//       SET status = ?, rejected_at = NOW(), reason = COALESCE(?, reason)
//       WHERE id = ?
//     `;
//     params = [status, rejectionReason, requestId];
//   } else {
//     query = `
//       UPDATE studentleaverequests 
//       SET status = ?, approved_at = NOW()
//       WHERE id = ?
//     `;
//     params = [status, requestId];
//   }

//   db.query(query, params, (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Leave request not found' });
//     }

//     res.json({ success: true, message: 'Leave request updated successfully' });
//   });
// };

exports.updateLeaveRequestStatus = (req, res) => {
  const { requestId, status, rejectionReason, student_roll, noOfDays } = req.body;

  let query, params;

  if (status === 'Rejected') {
    query = `
      UPDATE studentleaverequests 
      SET status = ?, rejected_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `;
    params = [status, rejectionReason, requestId];
  } else {
    query = `
      UPDATE studentleaverequests 
      SET status = ?, approved_at = NOW()
      WHERE id = ?
    `;
    params = [status, requestId];
  }

  // Start transaction
  db.beginTransaction((err, transaction) => {
    if (err) return res.status(500).json({ error: err.message });

    // First update the leave request status
    transaction.query(query, params, (err, result) => {
      if (err) {
        return transaction.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      if (result.affectedRows === 0) {
        return transaction.rollback(() => {
          res.status(404).json({ error: 'Leave request not found' });
        });
      }

      // If the leave was approved, update the student's attendance
      if (status === 'Approved') {
        // Get the leave request details
        transaction.query(
          `SELECT leave_days FROM studentattendance WHERE roll = ?`,
          [student_roll],
          (err, results) => {
            if (err || results.length === 0) {
              return transaction.rollback(() => {
                res.status(500).json({
                  error: err ? err.message : 'Could not find student details'
                });
              });
            }

            const { leave_days } = results[0];

            // Update the student's attendance record
            transaction.query(
              `UPDATE studentattendance 
               SET leave_days = leave_days + ?
               WHERE roll = ?`,
              [noOfDays, student_roll],
              (err, result) => {
                if (err) {
                  return transaction.rollback(() => {
                    res.status(500).json({ error: err.message });
                  });
                }

                // Commit the transaction
                transaction.commit(err => {
                  if (err) {
                    return transaction.rollback(() => {
                      res.status(500).json({ error: err.message });
                    });
                  }

                  res.json({
                    success: true,
                    message: 'Leave request updated and attendance record adjusted successfully'
                  });
                });
              }
            );
          }
        );
      } else {
        // For rejections, just commit
        transaction.commit(err => {
          if (err) {
            return transaction.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          res.json({
            success: true,
            message: 'Leave request updated successfully'
          });
        });
      }
    });
  });
};

//BufferActivity
// Get all grades
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

// Get sections by grade
exports.getSectionsByGrade = (req, res) => {
  const gradeId = req.params.gradeId;
  const sql = `SELECT * FROM Sections WHERE grade_id = ?`;
  db.query(sql, [gradeId], (err, results) => {
    if (err) {
      console.error("Error fetching sections:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, sections: results });
  });
};

// Get activity types
exports.getActivityTypes = (req, res) => {
  const sql = `SELECT * FROM activity_types`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching activity types:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, activityTypes: results });
  });
};

// Create buffer activity
exports.createBufferActivity = (req, res) => {
  const { mentor_id, activity_type_id, grade_id, section_ids, from_time, to_time } = req.body;

  if (!Array.isArray(section_ids)) {
    return res.status(400).json({ error: "section_ids must be an array" });
  }

  const sectionIdsString = section_ids.join(',');

  const sql = `
    INSERT INTO buffer_activity 
      (mentor_id, activity_type_id, grade_id, section_ids, from_time, to_time, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'Active')
  `;

  db.query(sql, [
    mentor_id,
    activity_type_id,
    grade_id,
    sectionIdsString,
    from_time,
    to_time
  ], (err, result) => {
    if (err) {
      console.error("Error creating buffer activity:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      success: true,
      message: "Buffer activity created successfully",
      id: result.insertId
    });
  });
};

// Get buffer activities for mentor
exports.getBufferActivities = (req, res) => {
  const { mentor_id } = req.body;


  const sql = `
    SELECT 
      ba.id, 
      at.activity_type as activity_name,
      g.grade_name, 
      GROUP_CONCAT(DISTINCT s.section_name ORDER BY s.section_name SEPARATOR ', ') as sections,
      ba.from_time, 
      ba.to_time, 
      ba.status,
      ba.ended_at,
      CONCAT(
        TIME_FORMAT(ba.from_time, '%h:%i %p'), 
        ' - ', 
        TIME_FORMAT(ba.to_time, '%h:%i %p')
      ) as time_range,
      CASE 
        WHEN ba.status = 'Active' THEN 
          CONCAT('Ends in ', TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(CURDATE(), ' ', ba.to_time)), 'min')
        ELSE 'Ended'
      END as time_left
    FROM buffer_activity ba
    JOIN activity_types at ON ba.activity_type_id = at.id
    JOIN Grades g ON ba.grade_id = g.id
    JOIN Sections s ON FIND_IN_SET(s.id, ba.section_ids)
    WHERE ba.mentor_id = ?
    GROUP BY ba.id
    ORDER BY ba.status DESC, ba.from_time ASC
  `;

  db.query(sql, [mentor_id], (err, results) => {
    if (err) {
      console.error("Error fetching buffer activities:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Format the results
    const formattedResults = results.map(activity => ({
      ...activity,
      time_left: activity.status === 'Active' ?
        `${Math.max(0, activity.time_left)}min` :
        'Ended'
    }));

    res.json({ success: true, activities: formattedResults });
  });
};

// End buffer activity
// End buffer activity
exports.endBufferActivity = (req, res) => {
  const { activity_id, ended_time } = req.body;
  const endTime = ended_time || new Date().toTimeString().substr(0, 8);

  const sql = `
    UPDATE buffer_activity 
    SET status = 'Ended', 
        ended_at = ? 
    WHERE id = ? AND status = 'Active'
  `;

  db.query(sql, [endTime, activity_id], (err, result) => {
    if (err) {
      console.error("Error ending buffer activity:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      success: true,
      message: "Buffer activity ended successfully",
      ended_at: endTime
    });
  });
};

//GeneralActivity
// Get students under mentor
exports.getMentorStudents = (req, res) => {
  const { mentorId } = req.body;

  const query = `
    SELECT s.id, s.name, s.roll 
    FROM Students s
    WHERE s.mentor_id = ?
  `;

  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, students: results });
  });
};

// Create General Activity
exports.createGeneralActivity = (req, res) => {
  const { student_id, mentor_id, activity_type, fee_type, amount, notes, other_type, description } = req.body;

  // Validation
  let error;
  switch (activity_type) {
    case 'Fee Payment':
      if (!fee_type || !amount) error = 'Fee type and amount are required';
      break;
    case 'Stationery Collection':
      if (!notes) error = 'Number of notes/items is required';
      break;
    case 'Other':
      if (!other_type) error = 'Activity type description is required';
      break;
  }
  if (error) return res.status(400).json({ error });

  if (activity_type === 'Fee Payment') {
    const query = `
    INSERT INTO General_Activity 
    (student_id, mentor_id, activity_type, fee_type, amount, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    db.query(query,
      [student_id, mentor_id, activity_type, fee_type, amount, description],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to log activity' });
        }

        res.status(201).json({
          message: 'Activity logged successfully',
          activity_id: result.insertId
        });
      }
    );
  }
  else if (activity_type === 'Stationery Collection') {
    const query = `
    INSERT INTO General_Activity 
    (student_id, mentor_id, activity_type, notes, description)
    VALUES (?, ?, ?, ?, ?)
  `;
    db.query(query,
      [student_id, mentor_id, activity_type, notes, description],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to log activity' });
        }

        res.status(201).json({
          message: 'Activity logged successfully',
          activity_id: result.insertId
        });
      }
    );
  }
  else {
    const query = `
    INSERT INTO General_Activity 
    (student_id, mentor_id, activity_type, description)
    VALUES (?, ?, ?, ?)
  `;
    db.query(query,
      [student_id, mentor_id, activity_type, description],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to log activity' });
        }

        res.status(201).json({
          message: 'Activity logged successfully',
          activity_id: result.insertId
        });
      }
    );
  }
};

// Get All General Activities
exports.getGeneralActivities = (req, res) => {

  const { mentorId } = req.query;

  const query = `
    SELECT 
      ga.*, 
      s.roll AS student_roll,
      s.name AS student_name,
      s.profile_photo,
      u.name AS mentor_name
    FROM General_Activity ga
    JOIN Students s ON ga.student_id = s.id
    JOIN Mentors m ON ga.mentor_id = m.id
    JOIN Users u ON m.phone = u.phone
    WHERE ga.mentor_id = ?
    ORDER BY ga.created_at DESC
  `;

  db.query(query, [mentorId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }

    res.status(200).json(results);
  });
};

//EmergencyLeave
// Emergency Leave
// Get students under mentor for emergency leave
exports.getMentorStudentsForLeave = (req, res) => {
  const { mentorId } = req.body;
  
  const query = `
    SELECT s.id, s.name, s.roll, s.profile_photo
    FROM Students s
    WHERE s.mentor_id = ?
  `;
  
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, students: results });
  });
};

// Create Emergency Leave
exports.createEmergencyLeave = async (req, res) => {
  const { mentor_id, student_id, student_roll, description } = req.body;

  if (!mentor_id || !student_id || !student_roll || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const leaveTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:00`;

    const isBefore1230 = (currentHour < 12 || (currentHour === 12 && currentMinutes < 30));
    const leaveDays = isBefore1230 ? 0.5 : 1;

    const trx = await db.promise().beginTransaction();

    // Insert into emergency_leaves
    await trx.query(
      `INSERT INTO emergency_leaves 
       (mentor_id, student_id, student_roll, description, leave_time) 
       VALUES (?, ?, ?, ?, ?)`,
      [mentor_id, student_id, student_roll, description, leaveTime]
    );

    // Update student attendance
    await trx.query(
      `UPDATE studentattendance 
       SET leave_days = leave_days + ? 
       WHERE roll = ?`,
      [leaveDays, student_roll]
    );

    await trx.commit();

    res.json({
      success: true,
      message: 'Emergency leave created successfully',
      leaveDays: leaveDays
    });

  } catch (err) {
    console.error('Transaction error:', err);
    try {
      await trx?.rollback(); // safe rollback
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }

    res.status(500).json({ error: 'Failed to create emergency leave' });
  }
};


// Get Emergency Leave History
exports.getEmergencyLeaveHistory = (req, res) => {
  const { mentorId } = req.query;
  
  const query = `
    SELECT 
      el.*,
      s.name AS student_name,
      s.profile_photo,
      s.father_mob,
      TIME_FORMAT(el.leave_time, '%h:%i %p') AS formatted_time
    FROM emergency_leaves el
    JOIN Students s ON el.student_id = s.id
    WHERE el.mentor_id = ?
    ORDER BY el.created_at DESC
  `;
  
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, leaves: results });
  });
};