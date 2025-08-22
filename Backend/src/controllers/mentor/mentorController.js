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
    LEFT JOIN Sections sec ON m.section_id = sec.id
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
  console.log("Received gradeID:", (req.body.gradeID));
  const sql = `
   SELECT 
      ssa.id as section_subject_activity_id,
      sub.id AS subject_id, 
      sub.subject_name,
      at.id as activity_id,
      at.activity_type as activity_name
    FROM section_subject_activities ssa
    JOIN sections sec ON ssa.section_id = sec.id
    JOIN subjects sub ON ssa.subject_id = sub.id
    LEFT JOIN activity_types at ON ssa.activity_type = at.id
    WHERE sec.grade_id = ?
    ORDER BY sub.subject_name, at.activity_type;
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Group activities by subject
    const groupedData = {};
    results.forEach(row => {
      if (!groupedData[row.subject_id]) {
        groupedData[row.subject_id] = {
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          activities: []
        };
      }
      groupedData[row.subject_id].activities.push({
        activity_id: row.activity_id,
        activity_name: row.activity_name,
        section_subject_activity_id: row.section_subject_activity_id
      });
    });

    const subjectsWithActivities = Object.values(groupedData);
    res.json({ success: true, message: "Subject data fetched successfully", gradeSubjects: subjectsWithActivities });
  });
};

exports.getMaterials = async (req, res) => {
  const { section_subject_activity_id } = req.query;
  console.log(`[GET] /api/mentor/getMaterials?section_subject_activity_id=${section_subject_activity_id}`);

  if (!section_subject_activity_id) {
    return res.status(400).json({ error: 'Missing section_subject_activity_id' });
  }

  const sql = `
    SELECT 
      id,
      level,
      material_type,
      file_name,
      file_url,
      COALESCE(title, file_name) as title,
      section_subject_activity_id,
      expected_date
    FROM materials 
    WHERE section_subject_activity_id = ?
    ORDER BY level ASC, material_type ASC, title ASC
  `;
  db.query(sql, [section_subject_activity_id], (err, results) => {
    if (err) {
      console.error("Error fetching materials data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Materials data fetched successfully", materials: results });
    console.log(results);
  });
};
exports.updateExpectedDate = (req, res) => {
  const { level, section_subject_activity_id, expected_date } = req.body;

  const sql = `
    UPDATE Materials
    SET expected_date = ?
    WHERE level = ? AND section_subject_activity_id = ?
  `;

  db.query(sql, [expected_date, level, section_subject_activity_id], (err, result) => {
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
  GROUP BY ba.id, at.activity_type, g.grade_name, ba.from_time, ba.to_time, ba.status, ba.ended_at
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


//AssessmentRequest
// Get available time slots for assessment
exports.getAvailableTimeSlots = (req, res) => {
  const { gradeId, sectionId, date } = req.body;

  const query = `
    SELECT start_time, end_time 
    FROM weekly_schedule
    WHERE section_id = ? 
    AND day = DAYNAME(?)
    AND subject_id IN (SELECT id FROM subjects WHERE subject_name IN ('PET', 'Free period'))
    ORDER BY start_time
  `;

  db.query(query, [sectionId, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, timeSlots: results });
  });
};

// Get subjects for grade and section
exports.getSubjectsForGradeSection = (req, res) => {
  const { gradeId, sectionId } = req.body;

  const query = `
    SELECT DISTINCT s.id, s.subject_name
    FROM section_subject_activities ssa
    JOIN subjects s ON ssa.subject_id = s.id
    WHERE ssa.section_id = ?
    AND ssa.is_active = 1
  `;

  db.query(query, [sectionId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, subjects: results });
  });
};

// Get students for grade and section
exports.getStudentsForGradeSection = (req, res) => {
  const { gradeId, sectionId } = req.body;

  const query = `
    SELECT 
  stu.id, 
  stu.name, 
  stu.roll, 
  sl.level
FROM students stu
LEFT JOIN student_levels sl 
  ON stu.roll = sl.student_roll AND sl.status = 'OnGoing'
WHERE stu.section_id = ?
ORDER BY stu.name;
  `;

  db.query(query, [sectionId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, students: results });
  });
};

// Create assessment request
exports.createAssessmentRequest = (req, res) => {
  const { mentorId, gradeId, sectionId, subjectId, date, startTime, endTime, studentIds, studentLevels } = req.body;

  db.beginTransaction((err, trx) => {
    if (err) return res.status(500).json({ error: err.message });

    const assessmentQuery = `
      INSERT INTO assessment_requests 
      (mentor_id, grade_id, section_id, subject_id, date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    trx.query(assessmentQuery, [mentorId, gradeId, sectionId, subjectId, date, startTime, endTime], (err, result) => {
      if (err) {
        return trx.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      const assessmentId = result.insertId;
      const studentValues = studentIds.map(studentId => [assessmentId, studentId]);
      const studentLevelsValues = studentLevels.map((level, index) => [assessmentId, studentIds[index], level]);

      const studentsQuery = `
        INSERT INTO assessment_students (assessment_id, student_id, level)
        VALUES ?
      `;

      trx.query(studentsQuery, [studentLevelsValues], (err) => {
        if (err) {
          return trx.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        trx.commit(err => {
          if (err) {
            return trx.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          res.json({
            success: true,
            message: 'Assessment request created successfully',
            assessmentId
          });
        });
      });
    });
  });
};


// Get assessment requests for mentor
exports.getAssessmentRequests = (req, res) => {
  const { mentorId } = req.body;

  const query = `
    SELECT 
  ar.id,
  ar.date,
  ar.start_time,
  ar.end_time,
  ar.status,
  g.grade_name,
  sec.section_name,
  sub.subject_name,
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
LEFT JOIN user_photos up ON m.phone = up.phone AND up.is_profile_photo = 1
WHERE ar.mentor_id = ?
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

  `;

  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Parse levels string to array
    results.forEach(r => {
      r.levels = r.levels ? r.levels.split(',').map(Number) : [];
    });

    res.json({ success: true, assessments: results });
  });
};

// Get assessment students
exports.getAssessmentRequestStudents = (req, res) => {
  const { assessmentId, level } = req.body;
  // console.log(assessmentId, level);

  const query = `
    SELECT 
      s.id,
      s.name,
      s.roll,
      s.profile_photo,
      asr.level
    FROM assessment_students asr
    JOIN students s ON asr.student_id = s.id
    WHERE asr.assessment_id = ? AND asr.level = ?
  `;

  db.query(query, [assessmentId, level].filter(Boolean), (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, students: results });
    // console.log(results);

  });
};

//Homework
// Get levels for a grade and subject
exports.getLevels = (req, res) => {
  const { gradeId, subjectId } = req.query;

  if (!gradeId || !subjectId) {
    return res.status(400).json({ error: 'Missing gradeId or subjectId' });
  }

  const sql = `
    SELECT DISTINCT m.level 
    FROM materials m
    JOIN section_subject_activities ssa ON m.section_subject_activity_id = ssa.id
    JOIN sections s ON ssa.section_id = s.id
    WHERE s.grade_id = ? AND ssa.subject_id = ?
    ORDER BY m.level
  `;

  db.query(sql, [gradeId, subjectId], (err, results) => {
    if (err) {
      console.error("Error fetching levels:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const levels = results.map(r => r.level);
    res.json({ success: true, levels });
  });
};

// Add homework
exports.addHomework = async (req, res) => {
  const { date, grade_id, section_id, subject_id, level, mentor_id } = req.body;

  if (!date || !grade_id || !section_id || !subject_id || !level || !mentor_id) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Start transaction using promise-based wrapper
    const trx = await db.promise().beginTransaction();

    // Insert homework
    const homeworkResult = await trx.query(
      `INSERT INTO homework 
       (date, grade_id, section_id, subject_id, level, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, grade_id, section_id, subject_id, level, mentor_id]
    );

    const homeworkId = homeworkResult.insertId;

    // Get all students in the section
    const students = await trx.query(
      `SELECT roll FROM students WHERE section_id = ?`,
      [section_id]
    );

    // Insert student homework records
    if (students.length > 0) {
      const studentHomeworkValues = students.map(student => [homeworkId, student.roll]);

      await trx.query(
        `INSERT INTO student_homework 
         (homework_id, student_roll) 
         VALUES ?`,
        [studentHomeworkValues]
      );
    }

    // Commit transaction
    await trx.commit();

    res.json({
      success: true,
      message: 'Homework added successfully',
      homeworkId
    });
  } catch (err) {
    console.error("Error adding homework:", err);
    if (typeof trx?.rollback === 'function') {
      await trx.rollback();
    }
    res.status(500).json({ success: false, message: 'Database error' });
  }
};


// Get homework list for mentor
exports.getHomeworkList = (req, res) => {
  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ success: false, message: 'Missing mentorId' });
  }

  const sql = `
    SELECT 
      h.id,
      DATE_FORMAT(h.date, '%d/%m/%Y') AS formatted_date,
      g.grade_name,
      s.section_name,
      sub.subject_name,
      h.level,
      COUNT(sh.id) AS total_students,
      SUM(CASE WHEN sh.status = 'Done' THEN 1 ELSE 0 END) AS done_count,
      SUM(CASE WHEN sh.status = 'Redo' THEN 1 ELSE 0 END) AS redo_count,
      SUM(CASE WHEN sh.status = 'Not completed' THEN 1 ELSE 0 END) AS notCom_count
    FROM homework h
    JOIN grades g ON h.grade_id = g.id
    JOIN sections s ON h.section_id = s.id
    JOIN subjects sub ON h.subject_id = sub.id
    LEFT JOIN student_homework sh ON h.id = sh.homework_id
    WHERE h.created_by = ?
    GROUP BY h.id, h.date, g.grade_name, s.section_name, sub.subject_name, h.level
    ORDER BY h.date DESC
  `;

  db.query(sql, [mentorId], (err, results) => {
    if (err) {
      console.error("Error fetching homework list:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, homeworkList: results });
  });
};

exports.getSectionSubjects = (req, res) => {
  const { sectionId } = req.body;

  if (!sectionId) {
    return res.status(400).json({ success: false, message: 'Missing sectionId' });
  }

  const sql = `
    SELECT 
      DISTINCT s.id AS subject_id,
      s.subject_name
    FROM section_subject_activities ssa
    JOIN subjects s ON ssa.subject_id = s.id
    WHERE ssa.section_id = ?
    AND ssa.is_active = 1
  `;

  db.query(sql, [sectionId], (err, results) => {
    if (err) {
      console.error("Error fetching subject list:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, subjects: results });
  });
};

// Get subject
exports.forSchedule = (req, res) => {
  const { sectionId } = req.body;

  if (!sectionId) {
    return res.status(400).json({ success: false, message: 'Missing sectionId' });
  }

  const sql = `
    SELECT 
      DISTINCT s.id AS subject_id,
      s.subject_name
    FROM section_subject_activities ssa
    JOIN subjects s ON ssa.subject_id = s.id
    WHERE ssa.section_id = ?
    AND ssa.is_active = 1
  `;

  db.query(sql, [sectionId], (err, results) => {
    if (err) {
      console.error("Error fetching subject list:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, subjects: results });
  });
};

// Get homework details with student submissions
exports.getHomeworkDetails = (req, res) => {
  const { homeworkId } = req.query;

  if (!homeworkId) {
    return res.status(400).json({ success: false, message: 'Missing homeworkId' });
  }

  const sql = `
    SELECT 
      h.id,
      h.date,
      g.grade_name,
      s.section_name,
      sub.subject_name,
      h.level,
      sh.student_roll,
      st.name AS student_name,
      st.profile_photo,
      sh.status,
      sh.redo_count,
      sh.checked_date,
      sh.completed_date
    FROM homework h
    JOIN grades g ON h.grade_id = g.id
    JOIN sections s ON h.section_id = s.id
    JOIN subjects sub ON h.subject_id = sub.id
    JOIN student_homework sh ON h.id = sh.homework_id
    JOIN students st ON sh.student_roll = st.roll
    WHERE h.id = ?
    ORDER BY sh.status, st.name
  `;

  db.query(sql, [homeworkId], (err, results) => {
    if (err) {
      console.error("Error fetching homework details:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const homeworkInfo = {
      id: results[0].id,
      date: results[0].date,
      grade_name: results[0].grade_name,
      section_name: results[0].section_name,
      subject_name: results[0].subject_name,
      level: results[0].level,
      submissions: results.map(r => ({
        student_roll: r.student_roll,
        student_name: r.student_name,
        profile_photo: r.profile_photo,
        status: r.status,
        redo_count: r.redo_count,
        checked_date: r.checked_date,
        completed_date: r.completed_date
      }))
    };

    res.json({ success: true, homework: homeworkInfo });
  });
};

// Update student homework status
// exports.updateHomeworkStatus = async (req, res) => {
//   const { homeworkId, studentRoll, status } = req.body;
//   console.log(status);
//   if (!homeworkId || !studentRoll || !status) {
//     return res.status(400).json({ success: false, message: 'Missing required fields' });
//   }

//   try {
//     const completedDate = status === 'Done' ? new Date().toISOString().split('T')[0] : null;

//     if (status === 'redo') {
//       const redoDate = new Date();

//       const [redoCount] = await db.promise().query(
//         `SELECT redo_count 
//          FROM student_homework 
//          WHERE homework_id = ? AND student_roll = ?`,
//         [homeworkId, studentRoll]
//       );
//       const redoCountValue = redoCount[0]?.redo_count + 1 || 1;
//       console.log(redoCount);

//       await db.promise().query(
//         `UPDATE student_homework 
//        SET status = ?, completed_date = ?, redo_count = ?, checked_date = ?
//        WHERE homework_id = ? AND student_roll = ?`,
//         [status, completedDate, redoCountValue, redoDate, homeworkId, studentRoll]
//       );
//     }
//     else if (status === 'done') {
//       await db.promise().query(
//         `UPDATE student_homework 
//        SET status = ?, completed_date = ?, checked_date = ?
//        WHERE homework_id = ? AND student_roll = ?`,
//         [status, completedDate, completedDate, homeworkId, studentRoll]
//       );
//     }

//     res.json({ success: true, message: 'Homework status updated successfully' });
//   } catch (err) {
//     console.error("Error updating homework status:", err);
//     res.status(500).json({ success: false, message: 'Database error' });
//   }
// };

// Bulk update homework status
exports.bulkUpdateHomeworkStatus = async (req, res) => {
  const { homeworkId, studentRolls, status } = req.body;
  let trx;

  if (!homeworkId || !studentRolls || !Array.isArray(studentRolls) || !status) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    trx = await db.promise().beginTransaction(); // get transaction object

    const completedDate = status === 'Done'
      ? new Date().toISOString().split('T')[0]
      : null;

    for (const studentRoll of studentRolls) {
      // await trx.query(
      //   `UPDATE student_homework 
      //    SET status = ?, completed_date = ?
      //    WHERE homework_id = ? AND student_roll = ?`,
      //   [status, completedDate, homeworkId, studentRoll]
      // );
      if (status === 'Redo') {
        const redoDate = new Date();

        const [redoCount] = await db.promise().query(
          `SELECT redo_count 
         FROM student_homework 
         WHERE homework_id = ? AND student_roll = ?`,
          [homeworkId, studentRoll]
        );
        const redoCountValue = redoCount[0]?.redo_count + 1 || 1;
        console.log(redoCount);

        await db.promise().query(
          `UPDATE student_homework 
       SET status = ?, completed_date = ?, redo_count = ?, checked_date = ?
       WHERE homework_id = ? AND student_roll = ?`,
          [status, completedDate, redoCountValue, redoDate, homeworkId, studentRoll]
        );
      }
      else {
        await db.promise().query(
          `UPDATE student_homework 
       SET status = ?, completed_date = ?, checked_date = ?
       WHERE homework_id = ? AND student_roll = ?`,
          [status, completedDate, completedDate, homeworkId, studentRoll]
        );
      }
    }

    await trx.commit();

    res.json({ success: true, message: 'Homework status updated successfully' });
  } catch (err) {
    if (trx && typeof trx.rollback === 'function') {
      await trx.rollback();
    }
    console.error("Error bulk updating homework status:", err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};


//Dashboard

//Update Daily Schedule
// Get subjects and activities for a section
exports.getSectionSubjectsforSchedule = async (req, res) => {
  try {
    const { section_id } = req.body;

    const query = `
      SELECT ssa.subject_id, sub.subject_name, ssa.activity_type, at.activity_type as activity_name
      FROM section_subject_activities ssa
      JOIN subjects sub ON ssa.subject_id = sub.id
      JOIN activity_types at ON ssa.activity_type = at.id
      WHERE ssa.section_id = ? AND ssa.is_active = 1
      ORDER BY sub.subject_name
    `;

    const [results] = await db.promise().query(query, [section_id]);

    // Group by subject
    const subjectsMap = {};
    results.forEach(row => {
      if (!subjectsMap[row.subject_id]) {
        subjectsMap[row.subject_id] = {
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          activities: []
        };
      }
      subjectsMap[row.subject_id].activities.push({
        activity_type: row.activity_type,
        activity_name: row.activity_name
      });
    });

    const subjects = Object.values(subjectsMap);

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Error fetching section subjects:', error);
    res.status(500).json({ success: false, message: 'Error fetching section subjects' });
  }
};

// Get mentor for a subject and section
exports.getMentorForSubject = async (req, res) => {
  try {
    const { subject_id, section_id } = req.body;

    const query = `
      SELECT m.id as mentor_id, m.roll as mentor_roll, m.phone as mentor_phone
      FROM mentor_section_assignments msa
      JOIN section_mentor_subject sms ON msa.id = sms.msa_id
      JOIN mentors m ON msa.mentor_id = m.id
      WHERE sms.section_id = ? AND msa.subject_id = ?
    `;

    const [results] = await db.promise().query(query, [section_id, subject_id]);

    if (results.length > 0) {
      res.json({ success: true, mentor: results[0] });
    } else {
      res.json({ success: false, message: 'No mentor assigned for this subject' });
    }
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ success: false, message: 'Error fetching mentor' });
  }
};

// Update daily schedule
exports.updateDailySchedule = async (req, res) => {
  try {
    const { daily_schedule_id, date, mentor_id, subject_id, activity_type } = req.body;
    console.log(daily_schedule_id, date, mentor_id, subject_id, activity_type);


    const updateQuery = `
      UPDATE daily_schedule 
      SET mentors_id = ?, subject_id = ?, activity = ?
      WHERE id = ? AND date = ?
    `;

    await db.promise().query(updateQuery, [
      mentor_id,
      subject_id,
      activity_type,
      daily_schedule_id,
      date
    ]);

    res.json({ success: true, message: 'Schedule updated successfully' });
    const today = new Date().toISOString().split('T')[0];
    await createAcademicSessionsByDate(today);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Error updating schedule' });
  }
};

// Update daily schedule activity only
exports.updateDailyScheduleActivity = async (req, res) => {
  try {
    const { daily_schedule_id, date, activity_type } = req.body;

    const updateQuery = `
      UPDATE daily_schedule 
      SET activity = ?
      WHERE id = ? AND date = ?
    `;

    await db.promise().query(updateQuery, [
      activity_type,
      daily_schedule_id,
      date
    ]);

    res.json({ success: true, message: 'Activity updated successfully' });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ success: false, message: 'Error updating activity' });
  }
};

// Add this to mentorController.js
exports.getMentorDailySchedule = (req, res) => {
  const { mentorId, date } = req.body;

  if (!mentorId || !date) {
    return res.status(400).json({ error: 'Missing mentorId or date' });
  }

  const query = `
    SELECT
      pa.id,
      ds.date,
      pa.activity_name,
      pa.start_time,
      pa.end_time,
      ds.grade_id,
      sub.subject_name,
      s.section_name,
      ds.section_id,
      v.name AS venue
    FROM period_activities pa
    JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
    JOIN sections s ON ds.section_id = s.id
    JOIN subjects sub ON ds.subject_id = sub.id
    LEFT JOIN venues v ON ds.venue_id = v.id
    WHERE pa.assigned_mentor_id = '1'
    AND ds.date = '2025-08-25'
    ORDER BY pa.start_time ASC;
    
    SELECT
      pa.id,
      ds.date,
      pa.start_time,
      pa.end_time,
      sub.subject_name AS subject,
      ds.subject_id,
      sec.section_name,
      ds.section_id,
      sec.grade_id,
      pa.activity_name AS activity,
      v.name AS venue,
      TIMEDIFF(pa.end_time, pa.start_time) AS duration,
      CASE
          WHEN pa.activity_name LIKE '%Academic%' THEN '#F8ECD2A8'
          WHEN pa.activity_name LIKE '%Assessment%' THEN '#9BD6EE3B'
          ELSE '#F8ECD2A8'
      END AS bgColor,
      CASE
          WHEN pa.activity_name LIKE '%Academic%' THEN '#EF7B0E'
          WHEN pa.activity_name LIKE '%Assessment%' THEN '#1857C0'
          ELSE '#EF7B0E'
      END AS sideColor,
      CASE
          WHEN pa.activity_name LIKE '%Academic%' THEN '#EF7B0E'
          WHEN pa.activity_name LIKE '%Assessment%' THEN '#1857C0'
          ELSE '#EF7B0E'
      END AS fontColor
    FROM period_activities pa
    JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
    JOIN subjects sub ON ds.subject_id = sub.id
    JOIN sections sec ON ds.section_id = sec.id
    LEFT JOIN venues v ON ds.venue_id = v.id
    WHERE pa.assigned_mentor_id = ? AND ds.date = ?
    ORDER BY pa.start_time;
  `;

  db.query(query, [mentorId, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Format the results to match the expected frontend structure
    const formattedResults = results.map(item => ({
      id: item.id.toString(),
      subject: item.subject,
      grade: `${item.grade_id}`,
      section: `${item.section_name}`,
      section_id: item.section_id,
      subject_id: item.subject_id,
      dsa_id: item.id,
      activity: item.activity || '',
      starttime: formatTime(item.start_time),
      endtime: formatTime(item.end_time),
      duration: formatDuration(item.duration),
      bgColor: item.bgColor,
      sideColor: item.sideColor,
      fontColor: item.fontColor
    }));
    // console.log('formattedResults', formattedResults);
    res.json({ success: true, scheduleData: formattedResults });
  });
};

// Helper functions
function formatTime(time) {
  const [hourStr, minuteStr] = time.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minuteStr.padStart(2, '0')} ${ampm}`;
}

function formatDuration(duration) {
  const [hourStr, minuteStr] = duration.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

//Dashboard Acadamics

async function createAcademicSessionsByDate(date) {

  const [schedules] = await db.promise().query(`
    SELECT ds.* FROM daily_schedule ds
    JOIN activity_types at ON ds.activity = at.id
    WHERE ds.date >= ? AND ds.date < DATE_ADD(?, INTERVAL 1 DAY) 
    AND ds.mentors_id IS NOT NULL 
    AND at.activity_type = 'Academics'
  `, [date, date]);

  // console.log('Schedules:', schedules, Array.isArray(schedules), schedules.length);
  let created = 0;

  for (const s of schedules) {
    console.log(s.id);
    console.log(s.section_id, s.subject_id, `${date} ${s.start_time}`, s.mentors_id);
    const [exists] = await db.promise().query(`
      SELECT id FROM academic_sessions 
      WHERE dsa_id = ?
    `, [s.id]);
    // section_id = ? AND subject_id = ? AND start_time = ? AND mentor_id = ? s.section_id, s.subject_id, `${date} ${s.start_time}`, s.mentors_id
    if (exists.length === 0) {
      // Get previous completed session for same section and subject
      const [previousSessions] = await db.promise().query(`
    SELECT next_level FROM academic_sessions
    WHERE section_id = ? AND subject_id = ? AND dsa_id != ? AND status = 'Completed'
    ORDER BY end_time DESC LIMIT 1
  `, [s.section_id, s.subject_id, s.id]);

      const prevLevel = previousSessions.length > 0 ? previousSessions[0].next_level : 1;
      const currentLevel = prevLevel;
      const nextLevel = currentLevel + 1;

      await db.promise().query(`
    INSERT INTO academic_sessions 
    (mentor_id, section_id, subject_id, start_time, end_time, status, current_level, next_level, dsa_id)
    VALUES (?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?)
  `, [
        s.mentors_id,
        s.section_id,
        s.subject_id,
        `${date} ${s.start_time}`,
        `${date} ${s.end_time}`,
        currentLevel,
        nextLevel,
        s.id
      ]);
      created++;
    }

    else {
      console.log('Session already exists:', exists[0].id);
      //  const [nextLevel] = await db.promise().query(`
      //   SELECT next_level FROM academic_sessions
      //   WHERE section_id = ? AND subject_id = ? AND dsa_id != ? AND status = 'Completed'
      //   ORDER BY end_time DESC LIMIT 1
      // `, [s.section_id, s.subject_id, s.id]);

      const prevLevel = exists.length > 0 ? exists[0].next_level : 1;
      const currentLevel = prevLevel;
      await db.promise().query(`
        UPDATE academic_sessions 
        SET mentor_id = ?, subject_id = ?, start_time = ?, end_time = ?
        WHERE id=?
      `, [
        s.mentors_id,
        s.subject_id,
        `${date} ${s.start_time}`,
        `${date} ${s.end_time}`,
        exists[0].id
      ]);
      created++;
    }
  }

  return created;


}
exports.createAcademicSessionsByDate = createAcademicSessionsByDate;
exports.createTodayAcademicSessions = async (req, res) => {
  try {
    // const today = '2025-05-19'; // For testing purposes
    let totalCreated = 0;
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      const created = await createAcademicSessionsByDate(formattedDate);
      totalCreated += created;
    }
    res.json({ success: true, created: totalCreated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get academic session details
exports.getAcademicSession = async (req, res) => {
  try {
    const query = `
      SELECT 
        acs.id,
        acs.status,
        sub.subject_name AS subject,
        sec.section_name AS section,
        sec.grade_id AS grade,
        DATE_FORMAT(acs.start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
        DATE_FORMAT(acs.end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
        TIMEDIFF(acs.end_time, acs.start_time) AS duration,
        acs.current_level,
        acs.next_level,
        acs.material_status
      FROM academic_sessions acs
      JOIN subjects sub ON acs.subject_id = sub.id
      JOIN sections sec ON acs.section_id = sec.id
      WHERE acs.dsa_id = ?
    `;

    const rows = await db.promise().query(query, [req.params.sessionId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const session = rows[0];

    // Format times for frontend
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    console.log('session', session);


    res.json({
      success: true,
      session: {
        ...session,
        formattedStartTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formattedEndTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: startTime.toLocaleDateString()
      }
    });
  } catch (error) {
    console.error('Error getting academic session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session details',
      error: error.message
    });
  }
};

// Start an academic session
exports.academicSessionStart = async (req, res) => {
  try {
    const [session] = await db.promise().query(`
      SELECT * FROM academic_sessions WHERE dsa_id = ?
    `, [req.params.sessionId]);
    console.log(session);

    if (!session || session.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await db.promise().query(`
      UPDATE academic_sessions 
      SET status = 'In Progress', actual_start_time = NOW()
      WHERE dsa_id = ?
    `, [req.params.sessionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error starting academic session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
};

// Update student attendance and performance
exports.academicSessionAttendance = async (req, res) => {
  const { updates } = req.body;
  const sessionId = req.params.sessionId;

  try {
    // Verify session exists
    const rows = await db.promise().query(`
      SELECT id FROM academic_sessions WHERE id = ?
    `, [sessionId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Start transaction, capture the transaction object
    const transaction = await db.promise().beginTransaction();

    try {
      for (const update of updates) {
        // Use transaction.query() inside transaction

        const existing = await transaction.query(`
          SELECT id FROM academic_session_attendance 
          WHERE session_id = ? AND student_id = ?
        `, [sessionId, update.studentId]);

        if (existing.length > 0) {
          await transaction.query(`
            UPDATE academic_session_attendance
            SET attendance_status = ?, performance = ?
            WHERE id = ?
          `, [
            update.performance === 'Absent' ? 'Absent' : 'Present',
            update.performance === 'Absent' ? null : update.performance,
            existing[0].id
          ]);
        } else {
          await transaction.query(`
            INSERT INTO academic_session_attendance
            (session_id, student_id, attendance_status, performance)
            VALUES (?, ?, ?, ?)
          `, [
            sessionId,
            update.studentId,
            update.performance === 'Absent' ? 'Absent' : 'Present',
            update.performance === 'Absent' ? null : update.performance
          ]);
        }
      }

      // Commit transaction
      await transaction.commit();

      res.json({ success: true });
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance',
      error: error.message,
    });
  }
};


// Complete an academic session
exports.academicSessionComplete = async (req, res) => {
  try {
    const { action } = req.body;
    const sessionId = req.params.sessionId;

    // Verify session exists
    const [session] = await db.promise().query(`
      SELECT id, section_id, subject_id, current_level FROM academic_sessions WHERE dsa_id = ?
    `, [sessionId]);

    if (!session || session.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    console.log(session[0].section_id, session[0].subject_id, sessionId);

    const [forNextLevelSessions] = await db.promise().query(`
        SELECT next_level FROM academic_sessions
        WHERE section_id = ? AND subject_id = ? AND dsa_id != ? AND status = 'Completed'
        ORDER BY end_time DESC LIMIT 1
      `, [session[0].section_id, session[0].subject_id, sessionId]);

    console.log(forNextLevelSessions);
    const nextLevel = forNextLevelSessions.length > 0 ? forNextLevelSessions[0].next_level : 2;
    const futureNextLevel = nextLevel;

    await db.promise().query(`
      UPDATE academic_sessions 
      SET 
        status = 'Completed',
        actual_end_time = NOW(),
        next_level = ?,
        material_status = ?
      WHERE dsa_id = ?
    `, [
      action === 'Complete material' ? futureNextLevel : session[0].current_level,
      action === 'Complete material' ? 'Complete' : 'Continue',
      sessionId
    ]);

    const [nextSessions] = await db.promise().query(`
      SELECT next_level FROM academic_sessions
      WHERE section_id = ? AND subject_id = ? AND status = 'Completed'
      ORDER BY end_time DESC LIMIT 1
    `, [session[0].section_id, session[0].subject_id, sessionId]);
    // console.log('nextSessions', nextSessions);

    const prevLevel = nextSessions.length > 0 ? (nextSessions[0].next_level) : 1;
    const currentLevel = prevLevel;

    const [toUpdateSessions] = await db.promise().query(`
      SELECT id FROM academic_sessions
      WHERE section_id = ? AND subject_id = ? AND dsa_id != ? AND status = 'Scheduled'
      ORDER BY end_time DESC
    `, [session[0].section_id, session[0].subject_id, sessionId]);

    // console.log('toUpdateSessions', toUpdateSessions);

    for (const s of toUpdateSessions) {

      await db.promise().query(`
        UPDATE academic_sessions 
        SET current_level = ?, next_level = ?
        WHERE id=?
      `, [
        currentLevel,
        currentLevel + 1,
        s.id
      ]);
    }

    res.json({ success: true });
    // await generateAcademicSessionsForNextNDays();
  } catch (error) {
    console.error('Error completing academic session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
};

async function generateAcademicSessionsForNextNDays(days = 20) {
  let totalCreated = 0;
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const formattedDate = date.toISOString().split('T')[0];
    const created = await createAcademicSessionsByDate(formattedDate);
    totalCreated += created;
  }
  return totalCreated;
}

exports.getSectionStudents = (req, res) => {
  const { sectionId, subjectId } = req.query;


  const query = `
    SELECT 
  MIN(sl.id) AS student_level_id,
  s.id,
  sl.status,
  s.profile_photo,
  s.name,
  sl.student_roll,
  GROUP_CONCAT(DISTINCT sl.level ORDER BY sl.level) AS levels
FROM student_levels sl
LEFT JOIN Students s ON sl.student_roll = s.roll
WHERE sl.section_id = ? AND sl.subject_id = ? AND sl.status = 'OnGoing'
GROUP BY sl.student_roll, sl.status, s.profile_photo, s.name
ORDER BY sl.student_roll DESC;

  `;

  db.query(query, [sectionId, subjectId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Parse levels string to array
    results.forEach(r => {
      r.levels = r.levels ? r.levels.split(',').map(Number) : [];
    });
    // console.log(results);


    res.json({ success: true, assessments: results });
  });
};

exports.checkApprovedLeaves = (req, res) => {
  const { date } = req.query;
  const today = date || new Date().toISOString().split('T')[0];

  const query = `
    SELECT student_roll 
    FROM studentleaverequests 
    WHERE status = 'Approved' 
    AND ? BETWEEN start_date AND end_date
  `;

  db.query(query, [today], (err, results) => {
    if (err) {
      console.error('Error checking approved leaves:', err);
      return res.status(500).json({
        success: false,
        message: 'Error checking approved leaves'
      });
    }

    res.json({
      success: true,
      leaves: results
    });
    console.log(today, "hi", results);

  });
};

exports.updateLeaveDays = (req, res) => {
  const { studentRolls, date, isMorningSession } = req.body;

  if (!studentRolls || !Array.isArray(studentRolls) || studentRolls.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student rolls provided'
    });
  }

  // First check if the date exists in studentattendance for each student
  const checkQuery = `
    SELECT roll FROM studentattendance 
    WHERE roll IN (?) 
    AND total_days = (
      SELECT COUNT(DISTINCT date) 
      FROM daily_schedule 
      WHERE date <= ?
    )
  `;

  db.query(checkQuery, [studentRolls, date], (err, existingRecords) => {
    if (err) {
      console.error('Error checking existing attendance records:', err);
      return res.status(500).json({
        success: false,
        message: 'Error checking attendance records'
      });
    }

    const existingRolls = existingRecords.map(r => r.roll);
    const newRolls = studentRolls.filter(roll => !existingRolls.includes(roll));

    // Process updates in a transaction
    db.beginTransaction(err => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({
          success: false,
          message: 'Error starting transaction'
        });
      }

      // Update existing records
      const updateQuery = `
        UPDATE studentattendance 
        SET leave_days = leave_days + ?
        WHERE roll IN (?)
      `;

      const incrementValue = isMorningSession ? 0.5 : 1;

      db.query(updateQuery, [incrementValue, existingRolls], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error updating leave days:', err);
            res.status(500).json({
              success: false,
              message: 'Error updating leave days'
            });
          });
        }

        // Insert new records for students not found
        if (newRolls.length > 0) {
          const insertValues = newRolls.map(roll => [roll, 1, incrementValue]);

          const insertQuery = `
            INSERT INTO studentattendance 
            (roll, total_days, leave_days) 
            VALUES ?
          `;

          db.query(insertQuery, [insertValues], (err, result) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error inserting new attendance records:', err);
                res.status(500).json({
                  success: false,
                  message: 'Error creating attendance records'
                });
              });
            }

            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error committing transaction:', err);
                  res.status(500).json({
                    success: false,
                    message: 'Error committing changes'
                  });
                });
              }

              res.json({
                success: true,
                updated: existingRolls.length,
                created: newRolls.length
              });
            });
          });
        } else {
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).json({
                  success: false,
                  message: 'Error committing changes'
                });
              });
            }

            res.json({
              success: true,
              updated: existingRolls.length,
              created: 0
            });
          });
        }
      });
    });
  });
};

//Dashboard Assessment
// Create assessment sessions for a date
async function createAssessmentSessionsByDate(date) {
  console.log(date);

  const [schedules] = await db.promise().query(`
    SELECT * FROM daily_schedule ds
    JOIN activity_types at ON ds.activity = at.id
    WHERE ds.date = ? AND at.activity_type = 'Assessment' AND ds.mentors_id IS NOT NULL
  `, [date]);

  let created = 0;

  for (const s of schedules) {
    const [exists] = await db.promise().query(`
      SELECT id FROM assessment_sessions 
      WHERE dsa_id = ?
    `, [s.id]);

    if (exists.length === 0) {
      await db.promise().query(`
        INSERT INTO assessment_sessions 
        (mentor_id, section_id, subject_id, dsa_id, date, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled')
      `, [
        s.mentors_id,
        s.section_id,
        s.subject_id,
        s.id,
        date,
        s.start_time,
        s.end_time
      ]);
      created++;
    } else {
      await db.promise().query(`
        UPDATE assessment_sessions 
        SET mentor_id = ?, subject_id = ?, start_time = ?, end_time = ?
        WHERE id=?
      `, [
        s.mentors_id,
        s.subject_id,
        s.start_time,
        s.end_time,
        exists[0].id
      ]);
      created++;
    }
  }

  return created;
}
exports.createAssessmentSessionsByDate = createAssessmentSessionsByDate;
// Get assessment session details
exports.getAssessmentSession = async (req, res) => {
  try {
    const query = `
      SELECT 
        asess.id,
        asess.status,
        sub.subject_name AS subject,
        sec.section_name AS section,
        sec.grade_id AS grade,
        DATE_FORMAT(asess.start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
        DATE_FORMAT(asess.end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
        TIMEDIFF(asess.end_time, asess.start_time) AS duration
        -- asess.total_marks,
        -- asess.material_id,
        -- m.file_name,
        -- m.file_url
      FROM assessment_sessions asess
      JOIN subjects sub ON asess.subject_id = sub.id
      JOIN sections sec ON asess.section_id = sec.id
      -- LEFT JOIN materials m ON asess.material_id = m.id
      WHERE asess.dsa_id = ?
    `;

    const [rows] = await db.promise().query(query, [req.body.sessionId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const session = rows[0];

    // Format times for frontend
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    res.json({
      success: true,
      session: {
        ...session,
        formattedStartTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formattedEndTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: startTime.toLocaleDateString()
      }
    });
    console.log('session', session);

  } catch (error) {
    console.error('Error getting assessment session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session details',
      error: error.message
    });
  }
};

// Start an assessment session
exports.assessmentSessionStart = async (req, res) => {
  try {
    const [session] = await db.promise().query(`
      SELECT * FROM assessment_sessions WHERE dsa_id = ?
    `, [req.body.sessionId]);

    if (!session || session.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await db.promise().query(`
      UPDATE assessment_sessions 
      SET status = 'In Progress', actual_start_time = NOW()
      WHERE dsa_id = ?
    `, [req.body.sessionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error starting assessment session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
};

// Get students for assessment
exports.getAssessmentStudents = async (req, res) => {
  const { sectionId, subjectId, sessionId } = req.body;
  try {
    let originalLevels = {};
    let studentMarks = {};
    let totalMarks = 0;

    // Check if this is for a completed session
    if (sessionId) {
      const [sessionCheck] = await db.promise().query(
        `SELECT status, total_marks FROM assessment_sessions WHERE id = ?`,
        [sessionId]
      );

      if (sessionCheck.length > 0 && sessionCheck[0].status === 'Completed') {
        totalMarks = sessionCheck[0].total_marks || 0;

        // Get original levels and marks from assessment_session_marks
        const [markResults] = await db.promise().query(
          `SELECT 
            student_roll, 
            current_level,
            mark,
            status,
            passed_status
           FROM assessment_session_marks
           WHERE as_id = ?`,
          [sessionId]
        );

        // Create maps of original levels and marks
        markResults.forEach(row => {
          originalLevels[row.student_roll] = row.current_level;
          studentMarks[row.student_roll] = {
            mark: row.mark,
            status: row.status,
            percentage: totalMarks > 0 ? Math.round((row.mark / totalMarks) * 100) : 0,
            passed_status: row.passed_status
          };
        });
      }
    }

    // Get all students for the section and subject
    const [results] = await db.promise().query(
      `SELECT 
        s.id,
        s.profile_photo,
        s.name,
        s.roll as student_roll,
        sl.level
      FROM student_levels sl
      JOIN students s ON sl.student_roll = s.roll
      WHERE sl.section_id = ? AND sl.subject_id = ? AND sl.status = 'OnGoing'
      ORDER BY sl.level DESC, s.name ASC`,
      [sectionId, subjectId]
    );

    // Group students by level - use original levels if available
    const studentsByLevel = {};
    if (Object.keys(originalLevels).length > 0) {
      // For completed sessions, use original levels
      results.forEach(student => {
        const level = originalLevels[student.student_roll] || student.level;
        if (!studentsByLevel[level]) {
          studentsByLevel[level] = [];
        }

        // Add mark information if available
        const studentWithMarks = {
          ...student,
          mark: studentMarks[student.student_roll]?.mark,
          status: studentMarks[student.student_roll]?.status || 'Present',
          percentage: studentMarks[student.student_roll]?.percentage,
          passed_status: studentMarks[student.student_roll]?.passed_status || 'Not Evaluated'
        };

        studentsByLevel[level].push(studentWithMarks);
      });
    } else {
      // For new sessions, use current levels
      results.forEach(student => {
        if (!studentsByLevel[student.level]) {
          studentsByLevel[student.level] = [];
        }
        studentsByLevel[student.level].push(student);
      });
    }

    res.json({
      success: true,
      studentsByLevel,
      originalLevels: Object.keys(originalLevels).length > 0 ? originalLevels : null,
      studentMarks: Object.keys(studentMarks).length > 0 ? studentMarks : null,

      totalMarks: totalMarks > 0 ? totalMarks : null
    });
    console.log(studentsByLevel, originalLevels, totalMarks, studentMarks);

  } catch (err) {
    console.error('Error getting assessment students:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update assessment marks
exports.updateAssessmentMarks = async (req, res) => {
  const { sessionId, students, student_levels } = req.body;

  if (!sessionId || !Array.isArray(students) || !student_levels) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters'
    });
  }

  try {
    // Use the promise-based transaction approach
    const [sessionDetails] = await db.promise().query(`
      SELECT subject_id, section_id FROM assessment_sessions WHERE id = ?
    `, [sessionId]);

    if (sessionDetails.length === 0) {
      throw new Error('Session not found');
    }

    const { subject_id, section_id } = sessionDetails[0];

    // Update session status only (no total marks at session level now)
    await db.promise().query(`
      UPDATE assessment_sessions
      SET status = 'Completed', actual_end_time = NOW()
      WHERE id = ?
    `, [sessionId]);

    // Get pass percentage
    const [passPercentRows] = await db.promise().query(`
      SELECT ap.percent
      FROM level_pass_percent ap
      JOIN sections s ON ap.grade_id = s.grade_id
      JOIN assessment_sessions ass ON s.id = ass.section_id
      WHERE ass.id = ? AND ap.subject_id = ass.subject_id
    `, [sessionId]);

    const passPercent = passPercentRows.length > 0 ? passPercentRows[0].percent : 35;

    const studentsToPromote = [];

    for (const student of students) {
      const mark = typeof student.mark === 'number' ? student.mark : Number(student.mark) || 0;
      const totalMarks = student.total_marks || 0;
      const percentage = totalMarks > 0 ? Math.round((mark / totalMarks) * 100) : 0;
      const passedStatus = percentage >= passPercent ? 'Passed' : 'Failed';
      const materialIds = student.material_ids || '[]';

      const [currentLevelInfo] = await db.promise().query(`
        SELECT * FROM student_levels
        WHERE student_roll = ? AND subject_id = ? AND section_id = ?
      `, [student.student_roll, subject_id, section_id]);

      const currentLevel = currentLevelInfo.length > 0 ? currentLevelInfo[0].level : 1;

      const [existing] = await db.promise().query(`
        SELECT id FROM assessment_session_marks WHERE as_id = ? AND student_roll = ?
      `, [sessionId, student.student_roll]);

      if (existing.length > 0) {
        await db.promise().query(`
          UPDATE assessment_session_marks
          SET 
            mark = ?, 
            status = ?, 
            total_marks = ?, 
            percentage = ?, 
            passed_status = ?, 
            current_level = ?,
            material_id = ?
          WHERE id = ?
        `, [
          mark,
          student.status || 'Present',
          totalMarks,
          percentage,
          passedStatus,
          currentLevel,
          materialIds,
          existing[0].id
        ]);
      } else {
        await db.promise().query(`
          INSERT INTO assessment_session_marks
          (as_id, student_roll, mark, status, total_marks, percentage, passed_status, current_level, material_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sessionId,
          student.student_roll,
          mark,
          student.status || 'Present',
          totalMarks,
          percentage,
          passedStatus,
          currentLevel,
          materialIds
        ]);
      }

      if (passedStatus === 'Passed' && student.status !== 'Absent') {
        studentsToPromote.push({
          student_roll: student.student_roll,
          current_level: parseInt(student.current_level, 10) || 1
        });
      }
    }

    // Promote passed students
    for (const student of studentsToPromote) {
      const [currentLevelInfo] = await db.promise().query(`
        SELECT * FROM student_levels
        WHERE student_roll = ? AND subject_id = ? AND section_id = ?
      `, [student.student_roll, subject_id, section_id]);

      if (currentLevelInfo.length > 0) {
        const currentLevel = currentLevelInfo[0].level;
        const nextLevel = currentLevel + 1;

        await db.promise().query(`
          UPDATE student_levels
          SET level = ?, status = 'OnGoing', updated_at = NOW()
          WHERE student_roll = ? AND subject_id = ? AND section_id = ?
        `, [nextLevel, student.student_roll, subject_id, section_id]);

        await db.promise().query(`
          INSERT INTO student_level_updates
          (student_roll, subject_id, level, completed_at)
          VALUES (?, ?, ?, NOW())
        `, [student.student_roll, subject_id, currentLevel]);
      } else {
        await db.promise().query(`
          INSERT INTO student_levels
          (student_roll, level, subject_id, section_id, status)
          VALUES (?, 1, ?, ?, 'OnGoing')
        `, [student.student_roll, subject_id, section_id]);
      }
    }

    res.json({
      success: true,
      message: 'Assessment marks updated successfully',
      promotedStudents: studentsToPromote.length
    });

  } catch (error) {
    console.error('Error updating assessment marks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assessment marks',
      error: error.message,
    });
  }
};


// Get materials for assessment subject
exports.getAssessmentMaterials = (req, res) => {
  const { subjectId, sectionId, level } = req.body;
  console.log(subjectId, sectionId);

  const query = `
    SELECT 
      m.id, 
      m.file_name, 
      m.level, 
      COALESCE(m.title, m.file_name) as title,
      m.material_type,
      m.file_url
    FROM materials m
    WHERE m.section_subject_activity_id IN (
      SELECT ssa.id 
      FROM section_subject_activities ssa 
      JOIN activity_types at ON ssa.activity_type = at.id
      WHERE ssa.subject_id = ? 
        AND ssa.section_id = ? 
        AND at.activity_type = 'Assessment'
    )
    AND m.level = ?
    AND m.material_type IN ('PDF', 'Document')
    ORDER BY m.title ASC
  `;

  db.query(query, [subjectId, sectionId, level], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, materials: results });
    console.log("materials", results);
  });
};

// Cron job to create assessment sessions (run daily at 11:59 PM)
exports.createTodayAssessmentSessions = async (req, res) => {
  try {
    let totalCreated = 0;
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      const created = await createAssessmentSessionsByDate(formattedDate);
      totalCreated += created;
    }
    res.json({ success: true, created: totalCreated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAbsentees = (req, res) => {
  const date = req.body.date;

  db.query(`
    SELECT student_roll FROM studentleaverequests
    WHERE status = 'Approved' AND ? BETWEEN start_date AND end_date
  `, [date], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    const absentees = results.map(r => r.student_roll);
    console.log(results);

    res.json({ success: true, results });
  });
};

exports.getPassPercentage = (req, res) => {
  const subjectId = req.body.subjectId;
  const grade = req.body.grade;

  db.query(`
    SELECT percent FROM level_pass_percent
    WHERE subject_id = ? AND grade_id = ?;
  `, [subjectId, grade], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    console.log("hi", results);

    res.json({ success: true, passPercent: results });
  });
};

//Dashboard Attentions
// Get overdue students (<10 days)
exports.getOverdueStudents = async (req, res) => {
  try {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

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
JOIN section_subject_activities ssa ON sl.subject_id = ssa.subject_id AND sec.id = ssa.section_id
JOIN materials m ON sl.level = m.level AND m.section_subject_activity_id = ssa.id
JOIN subjects sub ON ssa.subject_id = sub.id
WHERE sl.status = 'OnGoing' 
  AND m.expected_date <= CURDATE()
  AND DATEDIFF(CURDATE(), m.expected_date) <= 10
  AND s.section_id IN (
    SELECT DISTINCT section_id FROM mentor_section_assignments msa
    JOIN section_mentor_subject sms ON msa.id = sms.msa_id
    WHERE msa.mentor_id = ?
  )

    `, [req.query.mentorId]);

    res.json({ success: true, overdueStudents: rows });
    // console.log(overdueStudents);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get coordinator tasks (≥10 days overdue)
exports.getCoordinatorTasks = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT ol.*, s.name AS student_name, s.profile_photo, sub.subject_name, DATEDIFF(CURDATE(), ol.expected_date) AS days_overdue 
      FROM overdue_levels ol
      JOIN students s ON ol.student_roll = s.roll
      JOIN subjects sub ON ol.subject_id = sub.id
      WHERE ol.mentor_id = ? 
      AND ol.status IN ('Assigned Task', 'Accepted')
    `, [req.query.mentorId]);

    res.json({ success: true, tasks: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Accept task
exports.acceptTask = async (req, res) => {
  try {
    const { taskId, acceptedDate } = req.body;

    await db.promise().query(`
      UPDATE overdue_levels 
      SET status = 'Accepted', accepted_on = ?
      WHERE id = ? AND mentor_id = ?
    `, [acceptedDate, taskId, req.user.id]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//Daily check cron
// Daily job to check for 10+ days overdue
const checkOverdueLevels = async () => {
  try {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    const [overdueStudents] = await db.promise().query(`
      SELECT DISTINCT s.roll, s.name, s.section_id, 
                      msa.subject_id, sl.level, m.expected_date,
                      msa.mentor_id
      FROM student_levels sl
      JOIN students s ON sl.student_roll = s.roll
      JOIN sections sec ON s.section_id = sec.id
      JOIN section_subject_activities ssa ON sl.subject_id = ssa.subject_id AND sec.id = ssa.section_id
      JOIN materials m ON sl.level = m.level AND m.section_subject_activity_id = ssa.id
      JOIN section_mentor_subject sms ON sms.section_id = s.section_id
      JOIN mentor_section_assignments msa ON sms.msa_id = msa.id
      WHERE sl.status = 'OnGoing'
        AND m.expected_date <= ?
        AND NOT EXISTS (
          SELECT 1 FROM overdue_levels ol
          WHERE ol.student_roll = s.roll
            AND ol.subject_id = msa.subject_id
            AND ol.level = sl.level
        )
    `, [tenDaysAgo]);

    for (const student of overdueStudents) {
      await db.promise().query(`
        INSERT INTO overdue_levels 
        (student_roll, student_name, subject_id, mentor_id, section_id, 
         level, expected_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Requested')
      `, [
        student.roll,
        student.name,
        student.subject_id,
        student.mentor_id,
        student.section_id,
        student.level,
        student.expected_date
      ]);
    }

    console.log(`✅ Inserted ${overdueStudents.length} overdue records.`);
  } catch (error) {
    console.error('❌ Error in overdue levels check:', error.message);
  }
};
exports.checkOverdueLevels = checkOverdueLevels;
