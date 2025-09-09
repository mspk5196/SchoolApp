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
    // await createAcademicSessionsByDate(today);
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

  // Simplified query that focuses on core tables that are likely to exist
  const query = `
    SELECT 
        'Academic' AS session_type,
        a.id,
        COALESCE(a.pa_id, a.id) AS pa_id,
        a.student_roll,
        COALESCE(s.profile_photo, '') AS profile_photo,
        COALESCE(s.name, '') AS student_name,
        COALESCE(sb.batch_name, 'Default Batch') AS batch_name,
        COALESCE(sb.batch_level, 1) AS batch_level,
        a.section_id,
        a.mentor_id,
        a.subject_id,
        COALESCE(a.topic_id, 0) AS topic_id,
        a.date,
        a.start_time,
        a.end_time,
        COALESCE(a.venue_id, 0) AS venue_id,
        COALESCE(a.status, 'Schedule Created') AS status,
        COALESCE(a.remarks, '') AS remarks,
        COALESCE(sub.subject_name, 'Unknown Subject') AS subject_name,
        COALESCE(sec.section_name, 'Unknown Section') AS section_name,
        COALESCE(sec.grade_id, 0) AS grade_id,
        COALESCE(v.name) AS venue_name,
        COALESCE(act.activity_type, 'Academic') AS activity_name,
        COALESCE(sa.sub_act_name, '') AS sub_activity_name,
        COALESCE(t.topic_name, '') AS topic_name,
        COALESCE(ssa.id, 0) AS section_subject_activity_id
    FROM academic_sessions a
    LEFT JOIN subjects sub ON a.subject_id = sub.id
    LEFT JOIN sections sec ON a.section_id = sec.id
    LEFT JOIN students s ON a.student_roll = s.roll
    LEFT JOIN section_batches sb ON a.batch_id = sb.id
    LEFT JOIN venues v ON a.venue_id = v.id
    LEFT JOIN topic_hierarchy t ON a.topic_id = t.id
    LEFT JOIN ssa_sub_activities sssa ON t.ssa_sub_activity_id = sssa.id
    LEFT JOIN sub_activities sa ON sssa.sub_act_id = sa.id
    LEFT JOIN section_subject_activities ssa ON sssa.ssa_id = ssa.id
    LEFT JOIN activity_types act ON ssa.activity_type = act.id
    WHERE a.mentor_id = ? AND DATE(a.date) = DATE(?)

    UNION ALL

    SELECT 
        'Assessment' AS session_type,
        asess.id,
        COALESCE(asess.pa_id, asess.id) AS pa_id,
        asess.student_roll,
        COALESCE(s.profile_photo, '') AS profile_photo,
        COALESCE(s.name, '') AS student_name,
        COALESCE(sb.batch_name, 'Default Batch') AS batch_name,
        COALESCE(sb.batch_level, 1) AS batch_level,
        asess.section_id,
        asess.mentor_id,
        asess.subject_id,
        COALESCE(asess.topic_id, 0) AS topic_id,
        asess.date,
        asess.start_time,
        asess.end_time,
        COALESCE(asess.venue_id, 0) AS venue_id,
        COALESCE(asess.status, 'Schedule Created') AS status,
        COALESCE(asess.remarks, '') AS remarks,
        COALESCE(sub.subject_name, 'Unknown Subject') AS subject_name,
        COALESCE(sec.section_name, 'Unknown Section') AS section_name,
        COALESCE(sec.grade_id, 0) AS grade_id,
        COALESCE(v.name) AS venue_name,
        COALESCE(act.activity_type, 'Academic') AS activity_name,
        COALESCE(sa.sub_act_name, '') AS sub_activity_name,
        COALESCE(t.topic_name, '') AS topic_name,
        COALESCE(ssa.id, 0) AS section_subject_activity_id
    FROM assessment_sessions asess
    LEFT JOIN subjects sub ON asess.subject_id = sub.id
    LEFT JOIN sections sec ON asess.section_id = sec.id
    LEFT JOIN students s ON asess.student_roll = s.roll
    LEFT JOIN section_batches sb ON asess.batch_id = sb.id
    LEFT JOIN venues v ON asess.venue_id = v.id
    LEFT JOIN topic_hierarchy t ON asess.topic_id = t.id
    LEFT JOIN ssa_sub_activities sssa ON t.ssa_sub_activity_id = sssa.id
    LEFT JOIN sub_activities sa ON sssa.sub_act_id = sa.id
    LEFT JOIN section_subject_activities ssa ON sssa.ssa_id = ssa.id
    LEFT JOIN activity_types act ON ssa.activity_type = act.id
    WHERE asess.mentor_id = ? AND DATE(asess.date) = DATE(?)

    ORDER BY date, start_time;
  `;

  console.log('Executing query with params:', { mentorId, date });

  db.query(query, [mentorId, date, mentorId, date], (err, results) => {
    if (err) {
      console.error('Database error in getMentorDailySchedule:', err);
      return res.status(500).json({
        error: 'Database error',
        details: err.message,
        success: false
      });
    }

    console.log('Query results count:', results.length);
    if (results.length > 0) {
      console.log('Sample result:', results[0]);
    }

    // If no results found, try a simpler fallback query
    if (results.length === 0) {
      console.log('No results from main query, trying fallback...');
      const fallbackQuery = `
        SELECT 
          'Academic' AS session_type,
          pa.id,
          pa.id AS pa_id,
          '' AS student_roll,
          '' AS profile_photo,
          'Student' AS student_name,
          'Default Batch' AS batch_name,
          1 AS batch_level,
          ds.section_id,
          ds.mentors_id AS mentor_id,
          ds.subject_id,
          0 AS topic_id,
          ds.date,
          ds.start_time,
          ds.end_time,
          0 AS venue_id,
          'Schedule Created' AS status,
          'Generated from daily schedule' AS remarks,
          COALESCE(sub.subject_name, 'Unknown Subject') AS subject_name,
          COALESCE(sec.section_name, 'Unknown Section') AS section_name,
          COALESCE(sec.grade_id, 0) AS grade_id,
          'Unknown Venue' AS venue_name,
          'Academic' AS activity_name,
          '' AS sub_activity_name,
          '' AS topic_name,
          0 AS section_subject_activity_id
        FROM period_activities pa
        LEFT JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
        LEFT JOIN subjects sub ON ds.subject_id = sub.id
        LEFT JOIN sections sec ON ds.section_id = sec.id
        WHERE ds.mentors_id = ? AND DATE(ds.date) = DATE(?)
        ORDER BY ds.start_time
      `;

      db.query(fallbackQuery, [mentorId, date], (fallbackErr, fallbackResults) => {
        if (fallbackErr) {
          console.error('Fallback query error:', fallbackErr);
          // Return empty result but with success true
          return res.json({ success: true, scheduleData: [] });
        }

        console.log('Fallback results count:', fallbackResults.length);

        if (fallbackResults.length === 0) {
          return res.json({ success: true, scheduleData: [] });
        }

        // Process fallback results with simplified grouping
        const consolidatedSchedule = fallbackResults.map(schedule => ({
          id: schedule.id.toString(),
          session_type: schedule.session_type,
          pa_id: schedule.pa_id,
          section_id: schedule.section_id,
          mentor_id: schedule.mentor_id,
          subject_id: schedule.subject_id,
          topic_id: schedule.topic_id,
          subject: schedule.subject_name,
          section: schedule.section_name,
          section_name: schedule.section_name,
          grade: schedule.grade_id ? schedule.grade_id.toString() : '',
          venue_name: schedule.venue_name,
          date: schedule.date,
          starttime: formatTime(schedule.start_time),
          endtime: formatTime(schedule.end_time),
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          venue_id: schedule.venue_id,
          status: schedule.status,
          remarks: schedule.remarks,
          student_count: 1,
          students: [{
            student_roll: 'UNKNOWN',
            schedule_id: schedule.id,
            profile_photo: '',
            student_name: 'No Students Found',
            batch_name: 'Default Batch',
            batch_level: 1
          }],
          batches: {
            'Default Batch': {
              batch_name: 'Default Batch',
              batch_level: 1,
              students: [{
                student_roll: 'UNKNOWN',
                schedule_id: schedule.id,
                profile_photo: '',
                student_name: 'No Students Found',
                batch_name: 'Default Batch',
                batch_level: 1
              }]
            }
          },
          duration: calculateDuration(schedule.start_time, schedule.end_time),
          activity: schedule.session_type,
          bgColor: '#F8ECD2A8',
          sideColor: '#EF7B0E',
          fontColor: '#EF7B0E',
          is_assessment: 0,
          activity_name: schedule.activity_name,
          sub_activity_name: schedule.sub_activity_name,
          topic_name: schedule.topic_name,
          topic_hierarchy: buildTopicHierarchy(
            schedule.activity_name,
            schedule.sub_activity_name,
            schedule.topic_name
          ),
          section_subject_activity_id: schedule.section_subject_activity_id
        }));

        res.json({ success: true, scheduleData: consolidatedSchedule });
      });
      return;
    }

    // Group schedules by time, section_id, date, subject, and venue
    const groupedSchedules = {};

    results.forEach(schedule => {
      // Create a unique key for grouping
      const groupKey = `${schedule.date}_${schedule.start_time}_${schedule.end_time}_${schedule.section_id}_${schedule.subject_id}_${schedule.venue_id}_${schedule.topic_id}`;

      if (!groupedSchedules[groupKey]) {
        groupedSchedules[groupKey] = {
          id: schedule.id.toString(),
          session_type: schedule.session_type,
          pa_id: schedule.pa_id,
          section_id: schedule.section_id,
          mentor_id: schedule.mentor_id,
          subject_id: schedule.subject_id,
          topic_id: schedule.topic_id,
          subject: schedule.subject_name || '',
          section: schedule.section_name || '',
          section_name: schedule.section_name || '',
          grade: schedule.grade_id ? schedule.grade_id.toString() : '',
          venue_name: schedule.venue_name || '',
          date: schedule.date,
          starttime: formatTime(schedule.start_time),
          endtime: formatTime(schedule.end_time),
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          venue_id: schedule.venue_id,
          status: schedule.status,
          remarks: schedule.remarks,
          student_count: 0,
          students: [],
          batches: {},
          duration: calculateDuration(schedule.start_time, schedule.end_time),
          activity: schedule.session_type,
          bgColor: schedule.session_type === 'Assessment' ? '#9BD6EE3B' : '#F8ECD2A8',
          sideColor: schedule.session_type === 'Assessment' ? '#1857C0' : '#EF7B0E',
          fontColor: schedule.session_type === 'Assessment' ? '#1857C0' : '#EF7B0E',
          is_assessment: schedule.session_type === 'Assessment' ? 1 : 0,
          // Topic hierarchy
          activity_name: schedule.activity_name || '',
          sub_activity_name: schedule.sub_activity_name || '',
          topic_name: schedule.topic_name || '',
          topic_hierarchy: buildTopicHierarchy(
            schedule.activity_name,
            schedule.sub_activity_name,
            schedule.topic_name
          ),
          section_subject_activity_id: schedule.section_subject_activity_id || 0
        };
      }

      // Add student to the group and organize by batches
      groupedSchedules[groupKey].student_count++;

      // Group students by batch
      const batchKey = schedule.batch_name || 'No Batch';
      if (!groupedSchedules[groupKey].batches[batchKey]) {
        groupedSchedules[groupKey].batches[batchKey] = {
          batch_name: schedule.batch_name,
          batch_level: schedule.batch_level,
          students: []
        };
      }

      groupedSchedules[groupKey].batches[batchKey].students.push({
        student_roll: schedule.student_roll,
        schedule_id: schedule.id,
        profile_photo: schedule.profile_photo,
        student_name: schedule.student_name,
        batch_name: schedule.batch_name,
        batch_level: schedule.batch_level
      });

      // Also maintain the flat students array for compatibility
      groupedSchedules[groupKey].students.push({
        student_roll: schedule.student_roll,
        schedule_id: schedule.id,
        profile_photo: schedule.profile_photo,
        student_name: schedule.student_name,
        batch_name: schedule.batch_name,
        batch_level: schedule.batch_level
      });
    });

    // Convert grouped object back to array
    const consolidatedSchedule = Object.values(groupedSchedules);

    console.log('Consolidated mentor schedule:', consolidatedSchedule);
    res.json({ success: true, scheduleData: consolidatedSchedule });
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

function calculateDuration(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  const diffMin = endTotalMin - startTotalMin;

  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function buildTopicHierarchy(activity, subActivity, topic) {
  const parts = [];

  if (activity && activity.trim() && activity !== 'Unknown') {
    parts.push(activity.trim());
  }

  if (subActivity && subActivity.trim()) {
    parts.push(subActivity.trim());
  }

  if (topic && topic.trim()) {
    parts.push(topic.trim());
  }

  return parts.length > 0 ? parts.join(' > ') : '';
}

/**
 * HELPER: Get students for a given activity based on batch number.
 */
async function getStudentsForActivity(activityId) {
  const [activityDetails] = await db.promise().query(
    `SELECT pa.activity_date, pa.batch_number, ds.subject_id, ds.section_id
         FROM period_activities pa
         JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
         WHERE pa.id = ?`,
    [activityId]
  );

  if (!activityDetails.length) return [];
  const { activity_date, batch_number, subject_id, section_id } = activityDetails[0];

  const [students] = await db.promise().query(
    `SELECT s.id, s.name, s.roll, s.profile_photo
         FROM students s
         JOIN student_batch_assignments sba ON s.roll = sba.student_roll
         JOIN section_batches sb ON sba.batch_id = sb.id
         WHERE sb.batch_level = ? AND sb.subject_id = ? AND sb.section_id = ? AND sba.is_current = 1
         ORDER BY s.name ASC`,
    [batch_number, subject_id, section_id]
  );

  if (!students.length) return [];

  const studentRolls = students.map(s => s.roll);
  const [leaves] = await db.promise().query(
    `SELECT student_roll FROM studentleaverequests
         WHERE status = 'Approved' AND student_roll IN (?) AND ? BETWEEN start_date AND end_date`,
    [studentRolls, activity_date]
  );

  const studentsOnLeave = new Set(leaves.map(l => l.student_roll));

  return students.map(student => ({
    ...student,
    has_approved_leave: studentsOnLeave.has(student.roll)
  }));
}

/**
 * API: Start an activity session
 */
exports.startActivity = async (req, res) => {
  const { activityId, activityType } = req.params;
  if (activityType === 'Assessment') {
    const [result] = await db.promise().query(
      "UPDATE assessment_sessions SET status = 'In Progress', start_time = NOW() WHERE id = ? AND status = 'Not Started'",
      [activityId]
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Activity could not be started.' });
    }
    res.json({ success: true, message: 'Activity started.' });
  }
  else {
    const [result] = await db.promise().query(
      "UPDATE academic_sessions SET status = 'In Progress', start_time = NOW() WHERE id = ? AND status = 'Not Started'",
      [activityId]
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Activity could not be started.' });
    }
    res.json({ success: true, message: 'Activity started.' });
  }
};


/**
 * API: Get details for an academic activity (students & status)
 */
exports.getAcademicActivityDetails = async (req, res) => {
  try {
    const { activityId } = req.params;
    const [activity] = await db.promise().query("SELECT * FROM period_activities WHERE id = ?", [activityId]);
    if (!activity.length) return res.status(404).json({ success: false, message: 'Activity not found' });

    const students = await getStudentsForActivity(activityId);
    res.json({ success: true, activity: activity[0], students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Complete an academic activity by submitting student performances
 */
exports.completeAcademicActivity = async (req, res) => {
  const { activityId } = req.params;
  const { studentPerformances, feedback } = req.body; // Expecting [{ student_roll, performance }]
  console.log(feedback);

  let trx;
  try {
    trx = await db.promise().beginTransaction(); // get transaction object

    for (const item of studentPerformances) {
      await trx.query(
        `INSERT INTO academic_session_attendance (session_id, student_roll, attendance_status, performance) VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE performance = VALUES(performance)`,
        [activityId, item.student_roll, (item.performance === 'Absent' ? 'Absent' : 'Present'), item.performance]
      );
    }
    if (feedback === 'Completed normally') {
      await trx.query("UPDATE academic_sessions SET status = 'Completed', remarks = ? WHERE id = ?", [feedback, activityId]);
    }
    else {
      await trx.query("UPDATE academic_sessions SET status = 'Completed', remarks = ?, actual_end_time = NOW() WHERE id = ?", [feedback, activityId]);
    }
    await trx.commit();
    res.json({ success: true, message: 'Academic activity completed.' });
  } catch (error) {
    if (trx && typeof trx.rollback === 'function') {
      await trx.rollback();
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.finishAcademicActivity = async (req, res) => {
  const { activityId } = req.params;
  console.log(" Activity ID:", activityId);
  const { studentPerformances, feedback } = req.body;

  let trx;
  try {
    trx = await db.promise().beginTransaction(); // get transaction object

    for (const item of studentPerformances) {
      const result = await trx.query(
        `INSERT INTO academic_session_attendance (session_id, student_roll, attendance_status, performance) VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE performance = VALUES(performance)`,
        [activityId, item.student_roll, (item.performance === 'Absent' ? 'Absent' : 'Present'), item.performance]
      );
      console.log(result);
    }
    if (feedback === 'Completed normally') {
      await trx.query("UPDATE academic_sessions SET status = 'Completed', remarks = ? WHERE id = ?", [feedback, activityId]);
    } else {
      await trx.query("UPDATE academic_sessions SET status = 'Completed', remarks = ?, actual_end_time = NOW() WHERE id = ?", [feedback, activityId]);
    }
    await trx.commit();
    res.json({ success: true, message: 'Academic activity completed.' });
  } catch (error) {
    if (trx && typeof trx.rollback === 'function') {
      await trx.rollback();
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Get details for an assessment activity (students & leave status)
 */
exports.getAssessmentActivityDetails = async (req, res) => {
  try {
    const { activityId } = req.params;
    const [activity] = await db.promise().query("SELECT * FROM period_activities WHERE id = ?", [activityId]);
    if (!activity.length) return res.status(404).json({ success: false, message: 'Activity not found' });

    const students = await getStudentsForActivity(activityId);
    res.json({ success: true, activity: activity[0], students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Complete an assessment activity, updating marks and student progress
 */
exports.completeAssessmentActivity = async (req, res) => {
  const { activityId } = req.params;
  // Expecting [{ student_roll, marks_obtained, total_marks, is_absent }]
  const { studentSubmissions } = req.body;

  const connection = await db.promise().getConnection();
  await connection.beginTransaction();

  try {
    const [actDetails] = await connection.query(
      `SELECT pa.topic_id, th.pass_percentage, ds.subject_id FROM period_activities pa
             JOIN daily_schedule ds ON pa.daily_schedule_id = ds.id
             JOIN topic_hierarchy th ON pa.topic_id = th.id WHERE pa.id = ?`,
      [activityId]
    );
    const { topic_id, pass_percentage, subject_id } = actDetails[0];

    for (const sub of studentSubmissions) {
      const status = sub.is_absent
        ? 'Absent'
        : (((sub.marks_obtained / sub.total_marks) * 100) >= pass_percentage ? 'Passed' : 'Failed');

      await connection.query(
        `INSERT INTO period_activities_submissions (period_activity_id, student_roll, marks_obtained, total_marks, status)
                 VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE marks_obtained=VALUES(marks_obtained), total_marks=VALUES(total_marks), status=VALUES(status)`,
        [activityId, sub.student_roll, status === 'Absent' ? null : sub.marks_obtained, sub.total_marks, status]
      );

      if (status === 'Passed') {
        await connection.query(
          `INSERT INTO student_topic_progress (student_roll, topic_id, subject_id, status, completed_at) VALUES (?, ?, ?, 'Completed', NOW())
                     ON DUPLICATE KEY UPDATE status = 'Completed', completed_at = NOW()`,
          [sub.student_roll, topic_id, subject_id]
        );
        await connection.query(
          `INSERT INTO student_topic_completion_history (student_roll, topic_id, subject_id, actual_completion_date, final_score)
                     VALUES (?, ?, ?, CURDATE(), ?)`,
          [sub.student_roll, topic_id, subject_id, sub.marks_obtained]
        );
      }
    }
    await connection.query("UPDATE period_activities SET status = 'Completed' WHERE id = ?", [activityId]);
    await connection.commit();
    res.json({ success: true, message: "Assessment completed." });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * API: Manual trigger for cron job (for testing)
 */
exports.triggerActivityStatusUpdate = async (req, res) => {
  // This is essentially the same logic as the cron job for manual triggering
  try {
    const query = `UPDATE period_activities SET status = 'Not Started' WHERE status = 'Schedule Created' AND activity_date = CURDATE() AND start_time <= CURTIME()`;
    const [result] = await db.promise().query(query);
    res.json({ success: true, updated: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

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

// Get materials for a topic
exports.getTopicMaterials = async (req, res) => {
  try {
    const { section_subject_activity_id, topic_id } = req.query;

    if (!section_subject_activity_id) {
      return res.status(400).json({
        success: false,
        message: 'Section subject activity ID is required'
      });
    }

    const query = `
      SELECT 
        m.id,
        m.file_type,
        m.file_name,
        m.file_url,
        m.activity_name as title,
        m.expected_date,
        m.created_at AS uploaded_at,
        t.topic_name,
        sa.sub_act_name AS sub_activity,
        act.activity_type
      FROM topic_materials m
      LEFT JOIN topic_hierarchy t ON m.topic_id = t.id
      LEFT JOIN ssa_sub_activities sssa ON t.ssa_sub_activity_id = sssa.id
    LEFT JOIN sub_activities sa ON sssa.sub_act_id = sa.id
    LEFT JOIN section_subject_activities ssa ON sssa.ssa_id = ssa.id
    LEFT JOIN activity_types act ON ssa.activity_type = act.id
      WHERE m.topic_id = ?
      ORDER BY m.file_type ASC, m.activity_name ASC
    `;

    const params = topic_id ? [section_subject_activity_id, topic_id] : [section_subject_activity_id];

    db.query(query, [topic_id], (err, results) => {
      if (err) {
        console.error('Error fetching topic materials:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error while fetching materials'
        });
      }

      console.log(results);
      

      // Group materials by level and type
      const groupedMaterials = {};
      results.forEach(material => {
        const levelKey = `Level ${material.level}`;
        if (!groupedMaterials[levelKey]) {
          groupedMaterials[levelKey] = {
            level: material.level,
            materials: []
          };
        }
        groupedMaterials[levelKey].materials.push({
          id: material.id,
          title: material.title,
          file_name: material.file_name,
          file_url: material.file_url,
          material_type: material.material_type,
          expected_date: material.expected_date,
          uploaded_at: material.uploaded_at,
          topic_name: material.topic_name,
          hierarchy: material.topic_name ?
            `${material.activity_type || ''} > ${material.sub_activity || ''} > ${material.topic_name}` : ''
        });
      });

      res.json({
        success: true,
        materials: Object.values(groupedMaterials),
        total_count: results.length
      });
    });
  } catch (error) {
    console.error('Error in getTopicMaterials:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
