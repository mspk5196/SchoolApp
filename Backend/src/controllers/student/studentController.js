const db = require('../../config/db');

exports.getStudentData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT s.id AS student_id, s.name, s.roll, s.section_id, s.aadhar_no, s.emis_no, s.blood_grp, s.profile_photo,
           s.father_name, s.mother_name, s.father_mob, s.mother_mob, s.address,
           s.pincode, sec.section_name, g.grade_name,sec.grade_id, sa.leave_days, sa.attendance_percentage
    FROM Students s
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    LEFT JOIN StudentAttendance sa ON s.roll = sa.roll
    WHERE s.father_mob = ? OR s.mother_mob = ?;
  `;
  db.query(sql, [phoneNumber, phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, student: results });
  });
};

exports.getStudentDetails = (req, res) => {
  const { studentId } = req.body;
  const query = `
    SELECT s.name AS student_name, m.name AS mentor_name, c.name AS coordinator_name 
    FROM Students s
    LEFT JOIN Mentors m ON s.section_id = m.section_id
    LEFT JOIN Coordinators c ON s.section_id = c.section_id
    WHERE s.id = ?;
  `;
  db.query(query, [studentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: result[0] });
  });
};

// Apply for student leave
exports.applyStudentLeave = (req, res) => {
  const {
    roll, name, sectionId, totalLeaveDays,
    leaveType, fromDate, toDate, fromTime, toTime, reason
  } = req.body;

  if (!roll || !name || !sectionId || !leaveType || !fromDate || !toDate || !reason) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const values = [roll, name, sectionId, totalLeaveDays, leaveType, fromDate, toDate, fromTime, toTime, reason];

  const insertLeaveSql = `
    INSERT INTO StudentLeaveRequests (
      student_roll, student_name, section_id, no_of_days,
      leave_type, start_date, end_date, start_time, end_time, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertLeaveSql, values, (err, result) => {
    if (err) {
      console.error('Error applying leave for student:', roll, err);
      return res.status(500).json({ success: false, message: 'Database error while submitting leave request' });
    }

    res.json({
      success: true,
      message: 'Leave request submitted successfully',
      leaveId: result.insertId
    });

  });
};

exports.getStudentLeaves = (req, res) => {

  const { roll } = req.body;

  const sql = `
    SELECT 
      * FROM StudentLeaveRequests sl
    WHERE sl.student_roll = ?
    ORDER BY sl.id DESC
  `;

  db.query(sql, [roll], (err, results) => {
    if (err) {
      console.error('Error fetching leave details:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, leaves: results });
  });
};

exports.cancelStudentLeave = (req, res) => {
  const { leaveId } = req.body;

  if (!leaveId) {
    return res.status(400).json({ success: false, message: 'Leave ID is required' });
  }

  const sql = `UPDATE StudentLeaveRequests SET status = 'Cancelled' WHERE id = ?`;

  db.query(sql, [leaveId], (err, result) => {
    if (err) {
      console.error('Error cancelling leave:', err);
      return res.status(500).json({ success: false, message: 'Database error while cancelling leave' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    res.json({ success: true, message: 'Leave cancelled successfully' });
  });
};

exports.createStudentRequest = (req, res) => {
  const { roll, grade, requestID, docTypes, purpose, status } = req.body;

  if (!roll || !docTypes || !purpose) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const sql = `
      INSERT INTO Document_Requests (student_roll, grade_id, requestID, document_type, purpose, status)
      VALUES (?, ?, ?, ?, ?, ?)`;

  const typesJson = JSON.stringify(docTypes);
  const purposeJson = JSON.stringify(purpose);

  db.query(sql, [roll, grade, requestID, typesJson, purposeJson, status], (err, result) => {
    if (err) {
      console.error("Error creating student request:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Request submitted successfully", requestId: result.insertId });
  });
};

exports.fetchStudentRequests = (req, res) => {
  const { roll } = req.body;

  const sql = `
      SELECT * FROM Document_Requests WHERE student_roll = ?`;

  db.query(sql, [roll], (err, result) => {
    if (err) {
      console.error("Error fetching student request:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student Request fetched successfully", studentRequests: result });
  });
};

exports.fetchStudentDocument = (req, res) => {

  const { request_id } = req.body;

  const sql = `
      SELECT * FROM Student_Document WHERE request_id = ?`;

  db.query(sql, [request_id], (err, result) => {
    if (err) {
      console.error("Error fetching student document:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student Requested document fetched successfully", studentDocument: result });
  });
};

exports.fetchDocumentTypes = (req, res) => {

  const sql = `
      SELECT * FROM Document_Types;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching document types:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Document Types fetched successfully", docTypes: result });
  });
};
exports.fetchDocumentPurpose = (req, res) => {

  const sql = `
      SELECT * FROM Request_Purposes ORDER BY ID;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching document types:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Document Types fetched successfully", docPurpose: result });
  });
};


//SessionAttendance
exports.getSessionAttendance = async (req, res) => {
  const { studentId, date, sectionId } = req.body;
  // console.log(studentId, date, sectionId);

  if (!studentId || !date) {
    return res.status(400).json({ success: false, message: 'Student ID and date are required' });
  }

  try {
    // First get student's roll number
    const [student] = await db.promise().query('SELECT roll FROM Students WHERE id = ?', [studentId]);
    if (!student || student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const roll = student[0].roll;
    // console.log(roll);

    // Get total sessions for the day from daily_schedule
    const [dailySessions] = await db.promise().query(
      `SELECT COUNT(*) as total_sessions 
       FROM daily_schedule 
       WHERE date = ? AND section_id = ?`,
      [date, sectionId]
    );


    const totalSessions = dailySessions[0].total_sessions || 0;
    // console.log(totalSessions);

    if (totalSessions === 0) {
      return res.json({
        success: true,
        attendance: '0/0',
        message: 'No sessions scheduled for this date'
      });
    }

    // console.log(date);

    // Get present academic sessions
    const [academicPresent] = await db.promise().query(
      `SELECT COUNT(*) AS present_count
FROM academic_session_attendance asa
JOIN daily_schedule ds ON asa.session_id = ds.id
JOIN academic_sessions ass ON asa.session_id = ass.dsa_id
WHERE asa.student_id = ?
  AND ds.date = ?
  AND ass.status = 'Completed'
  AND asa.attendance_status != 'Absent';`,
      [studentId, date]
    );

    console.log(academicPresent);


    // Get present assessment sessions
    const [assessmentPresent] = await db.promise().query(
      `SELECT COUNT(*) as present_count 
       FROM assessment_session_marks asa
       JOIN assessment_sessions a ON asa.as_id = a.id
       WHERE asa.student_roll = ? 
       AND a.date = ? 
       AND a.status = 'Completed'
       AND asa.status != 'Absent'`,
      [roll, date]
    );

    const presentSessions =
      (academicPresent[0].present_count || 0) +
      (assessmentPresent[0].present_count || 0);

    // console.log(academicPresent[0].present_count, assessmentPresent[0].present_count);

    // Return the session attendance for display
    res.json({
      success: true,
      attendance: `${presentSessions}/${totalSessions}`,
      presentSessions: presentSessions,
      totalSessions: totalSessions
      // presentDaysAdded: presentDaysToAdd
    });

  } catch (err) {
    console.error('Error in getSessionAttendance:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};


// Get performance breakdown

// exports.getStudentPerformance = (req, res) => {
//   const studentId = req.params.studentId;

//   // Get current date and calculate date ranges
//   const currentDate = new Date();
//   // const currentMonth = currentDate.getMonth() + 1;
//   // const currentYear = currentDate.getFullYear();

//   // Calculate date for last 7 days
//   const last7Days = new Date();
//   last7Days.setDate(last7Days.getDate() - 7);

//   // 1. Get academic performance data (80%)
//   const academicQuery = `
//    SELECT 
//   s.subject_name,
//   ds.date,
//   asa.performance,
//   asa.attendance_status
// FROM academic_session_attendance asa
// JOIN daily_schedule ds ON asa.session_id = ds.id
// JOIN subjects s ON ds.subject_id = s.id
// WHERE asa.student_id = ?
// AND ds.date >= ?
// ORDER BY ds.date DESC;
//   `;

//   const assessmentQuery = `
//   SELECT 
//     s.subject_name,
//     a.date,
//     asm.percentage
//   FROM assessment_session_marks asm
//   JOIN assessment_sessions a ON asm.as_id = a.id
//   JOIN subjects s ON a.subject_id = s.id
//   WHERE asm.student_roll = (
//     SELECT roll FROM students WHERE id = ?
//   )
//   AND a.date >= ?
//   AND asm.status = 'Present'
//   ORDER BY a.date DESC
// `;

//   // 2. Get homework data (10%)
//   const homeworkQuery = `
//     SELECT 
//       s.subject_name,
//       h.date,
//       sh.status,
//       sh.redo_count
//     FROM student_homework sh
//     JOIN homework h ON sh.homework_id = h.id
//     JOIN subjects s ON h.subject_id = s.id
//     WHERE sh.student_roll = (
//       SELECT roll FROM students WHERE id = ?
//     )
//     AND h.date >= ?
//     ORDER BY h.date DESC
//   `;

//   // 3. Get discipline issues (10%)
//   const disciplineQuery = `
//     SELECT 
//       DATE_FORMAT(registered_at, '%Y-%m-%d') AS date,
//       complaint
//     FROM student_dicipline
//     WHERE roll = (
//       SELECT roll FROM students WHERE id = ?
//     )
//     AND registered_at >= ?
//     ORDER BY registered_at DESC
//   `;

//   // Execute all queries
//   db.query(academicQuery, [studentId, last7Days], (err, academicResults) => {
//     if (err) return res.status(500).json({ error: err.message });

//     db.query(homeworkQuery, [studentId, last7Days], (err, homeworkResults) => {
//       if (err) return res.status(500).json({ error: err.message });

//       db.query(disciplineQuery, [studentId, last7Days], (err, disciplineResults) => {
//         if (err) return res.status(500).json({ error: err.message });

//         db.query(assessmentQuery, [studentId, last7Days], (err, assessmentResults) => {
//           if (err) return res.status(500).json({ error: err.message });

//           // Now pass assessmentResults to calculatePerformance
//           const performanceData = calculatePerformance(
//             academicResults,
//             homeworkResults,
//             disciplineResults,
//             assessmentResults
//           );
//           // console.log(performanceData);

//           res.json(performanceData);
//         });
//       });
//     });
//   });
// };

// Function to calculate performance metrics

// function calculatePerformance(academicData, homeworkData, disciplineData, assessmentData) {
//   // Group data by subject and date
//   const performanceBySubject = {};
//   const assessmentBySubject = {};
//   const dates = new Set();

//   // console.log("Academic Data:", academicData);
//   // Process academic data (80% of score)
//   academicData.forEach(session => {
//     const date = session.date instanceof Date
//       ? session.date.toLocaleDateString('en-CA')
//       : String(session.date).slice(0, 10);
//     const subject = session.subject_name;
//     dates.add(date);
//     // console.log(date);


//     if (!performanceBySubject[subject]) performanceBySubject[subject] = {};
//     if (!performanceBySubject[subject][date]) {
//       performanceBySubject[subject][date] = {
//         academicScore: 0,
//         homeworkScore: 0,
//         totalSessions: 0
//       };
//     }

//     // Calculate score based on attendance and performance
//     let sessionScore = 0;
//     if (session.attendance_status === 'Present') {
//       switch (session.performance) {
//         case 'Highly Attentive': sessionScore = 100; break;
//         case 'Moderately Attentive': sessionScore = 70; break;
//         case 'Not Attentive': sessionScore = 40; break;
//         default: sessionScore = 0;
//       }
//     }
//     performanceBySubject[subject][date].academicScore += sessionScore;
//     performanceBySubject[subject][date].totalSessions++;
//   });

//   // Process assessment data (if available)
//   assessmentData.forEach(asmt => {
//     const date = asmt.date instanceof Date
//       ? asmt.date.toLocaleDateString('en-CA')
//       : String(asmt.date).slice(0, 10);
//     const subject = asmt.subject_name;
//     dates.add(date);

//     if (!assessmentBySubject[subject]) assessmentBySubject[subject] = {};
//     assessmentBySubject[subject][date] = Number(asmt.percentage) || 0;
//   });

//   // Process homework data (10% of score)
//   homeworkData.forEach(hw => {
//     // const date = hw.date.toISOString().split('T')[0];
//     const date = hw.date instanceof Date
//       ? hw.date.toLocaleDateString('en-CA')
//       : String(hw.date).slice(0, 10);
//     const subject = hw.subject_name;
//     dates.add(date);

//     if (!performanceBySubject[subject]) performanceBySubject[subject] = {};
//     if (!performanceBySubject[subject][date]) {
//       performanceBySubject[subject][date] = {
//         academicScore: 0,
//         homeworkScore: 0,
//         totalSessions: 0
//       };
//     }

//     let hwScore = 0;
//     if (hw.status === 'Done') {
//       hwScore = 100 - (hw.redo_count * 10);
//       if (hwScore < 0) hwScore = 0;
//     }
//     performanceBySubject[subject][date].homeworkScore = hwScore;
//   });

//   // Process discipline data (count issues per date)
//   const disciplineByDate = {};
//   disciplineData.forEach(issue => {
//     // const date = issue.date;
//     const date = issue.date instanceof Date
//       ? issue.date.toLocaleDateString('en-CA')
//       : String(issue.date).slice(0, 10);
//     dates.add(date);
//     if (!disciplineByDate[date]) disciplineByDate[date] = 0;
//     disciplineByDate[date] += 1;
//   });

//   // Calculate final scores for each subject and date
//   const result = {
//     daily: {},
//     monthly: {},
//     overall: {},
//     subjects: {}
//   };

//   // Convert dates to array and sort
//   const sortedDates = Array.from(dates).sort();
//   // console.log("Sorted Dates:", sortedDates);


//   // Calculate daily performance
//   sortedDates.forEach(date => {
//     result.daily[date] = {};

//     // Use all subjects from both academic and assessment data
//     const allSubjects = Array.from(new Set([
//       ...Object.keys(performanceBySubject),
//       ...Object.keys(assessmentBySubject)
//     ]));

//     allSubjects.forEach(subject => {
//       // Use academic or assessment for 80%
//       let academicAvg = 0;
//       if (performanceBySubject[subject]?.[date] && performanceBySubject[subject][date].totalSessions > 0) {
//         academicAvg = performanceBySubject[subject][date].academicScore / performanceBySubject[subject][date].totalSessions;
//       } else if (assessmentBySubject[subject] && assessmentBySubject[subject][date] !== undefined) {
//         academicAvg = assessmentBySubject[subject][date];
//       }

//       const homeworkScore = performanceBySubject[subject]?.[date]?.homeworkScore || 0;

//       // Discipline calculation (20%)
//       let disciplineScore = 20;
//       const issueCount = disciplineByDate[date] || 0;
//       if (issueCount === 1) disciplineScore = 10;
//       else if (issueCount >= 2) disciplineScore = 0;

//       // Compose total
//       const totalScore = (academicAvg * 0.8) + (homeworkScore * 0.1) + disciplineScore;

//       // Only add if there is assessment or academic data for this subject/date
//       if (
//         (performanceBySubject[subject]?.[date] && performanceBySubject[subject][date].totalSessions > 0) ||
//         (assessmentBySubject[subject] && assessmentBySubject[subject][date] !== undefined)
//       ) {
//         result.daily[date][subject] = Math.round(totalScore);
//       }
//     });

//     // Calculate overall daily performance
//     const subjects = Object.keys(result.daily[date]).filter(s => s !== 'Overall');
//     if (subjects.length > 0) {
//       let dailyTotal = 0;
//       let count = 0;
//       subjects.forEach(subject => {
//         if (result.daily[date][subject] !== undefined) {
//           dailyTotal += result.daily[date][subject];
//           count++;
//         }
//       });
//       result.daily[date].Overall = count > 0 ? Math.round(dailyTotal / count) : 0;
//     }
//   });

//   // Calculate monthly performance (group by month)
//   const monthlyTemp = {};
//   Object.keys(result.daily).forEach(date => {
//     const month = date.slice(0, 7); // 'YYYY-MM'
//     if (!monthlyTemp[month]) monthlyTemp[month] = {};
//     Object.keys(result.daily[date]).forEach(subject => {
//       if (!monthlyTemp[month][subject]) monthlyTemp[month][subject] = [];
//       const val = result.daily[date][subject];
//       if (typeof val === 'number' && !isNaN(val)) {
//         monthlyTemp[month][subject].push(val);
//       }
//     });
//   });

//   // Calculate monthly averages
//   Object.keys(monthlyTemp).forEach(month => {
//     result.monthly[month] = {};
//     Object.keys(monthlyTemp[month]).forEach(subject => {
//       const arr = monthlyTemp[month][subject];
//       result.monthly[month][subject] = arr.length > 0
//         ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
//         : 0;
//     });
//     // Calculate overall monthly performance
//     const subjectKeys = Object.keys(monthlyTemp[month]).filter(s => s !== 'Overall');
//     if (subjectKeys.length > 0) {
//       let sum = 0;
//       subjectKeys.forEach(subject => {
//         sum += result.monthly[month][subject];
//       });
//       result.monthly[month].Overall = Math.round(sum / subjectKeys.length);
//     }
//   });

//   // Add subjectList for frontend subject graph fallback
//   const allSubjectsSet = new Set([
//     ...Object.keys(performanceBySubject),
//     ...Object.keys(assessmentBySubject)
//   ]);
//   result.subjectList = Array.from(allSubjectsSet);

//   result.subjectList.forEach(subject => {
//     result.subjects[subject] = {};
//     // Fill daily scores for this subject
//     Object.keys(result.daily).forEach(date => {
//       if (result.daily[date][subject] !== undefined) {
//         result.subjects[subject][date] = result.daily[date][subject];
//       }
//     });
//     // Fill overall score for this subject (from result.overall)
//     if (result.overall && result.overall[subject] !== undefined) {
//       result.subjects[subject].Overall = result.overall[subject];
//     }
//   });

//   return result;
// }

exports.getStudentPerformance = (req, res) => {
  const studentId = req.params.studentId;

  // 1. Get academic performance data (80%) - REMOVED date filter
  const academicQuery = `
    SELECT 
      s.subject_name,
      ds.date,
      asa.performance,
      asa.attendance_status
    FROM academic_session_attendance asa
    JOIN daily_schedule ds ON asa.session_id = ds.id
    JOIN subjects s ON ds.subject_id = s.id
    WHERE asa.student_id = ?
    ORDER BY ds.date DESC;
  `;

  // 2. Get assessment data - REMOVED date filter
  const assessmentQuery = `
    SELECT 
      s.subject_name,
      a.date,
      asm.percentage
    FROM assessment_session_marks asm
    JOIN assessment_sessions a ON asm.as_id = a.id
    JOIN subjects s ON a.subject_id = s.id
    WHERE asm.student_roll = (SELECT roll FROM students WHERE id = ?)
      AND asm.status = 'Present'
    ORDER BY a.date DESC
  `;

  // 3. Get homework data (10%) - REMOVED date filter
  const homeworkQuery = `
    SELECT 
      s.subject_name,
      h.date,
      sh.status,
      sh.redo_count
    FROM student_homework sh
    JOIN homework h ON sh.homework_id = h.id
    JOIN subjects s ON h.subject_id = s.id
    WHERE sh.student_roll = (SELECT roll FROM students WHERE id = ?)
    ORDER BY h.date DESC
  `;

  // 4. Get discipline issues (10%) - REMOVED date filter
  const disciplineQuery = `
    SELECT 
      DATE_FORMAT(registered_at, '%Y-%m-%d') AS date,
      complaint
    FROM student_dicipline
    WHERE roll = (SELECT roll FROM students WHERE id = ?)
    ORDER BY registered_at DESC
  `;

  // Execute all queries without the 'last7Days' parameter
  db.query(academicQuery, [studentId], (err, academicResults) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(homeworkQuery, [studentId], (err, homeworkResults) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(disciplineQuery, [studentId], (err, disciplineResults) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(assessmentQuery, [studentId], (err, assessmentResults) => {
          if (err) return res.status(500).json({ error: err.message });

          const performanceData = calculatePerformance(
            academicResults,
            homeworkResults,
            disciplineResults,
            assessmentResults
          );
          res.json(performanceData);
        });
      });
    });
  });
};

// Function to calculate performance metrics (NO CHANGES NEEDED HERE, it already groups by month)
function calculatePerformance(academicData, homeworkData, disciplineData, assessmentData) {
  // Group data by subject and date
  const performanceBySubject = {};
  const assessmentBySubject = {};
  const dates = new Set();

  // Process academic data (80% of score)
  academicData.forEach(session => {
    const date = session.date instanceof Date
      ? session.date.toLocaleDateString('en-CA')
      : String(session.date).slice(0, 10);
    const subject = session.subject_name;
    dates.add(date);


    if (!performanceBySubject[subject]) performanceBySubject[subject] = {};
    if (!performanceBySubject[subject][date]) {
      performanceBySubject[subject][date] = {
        academicScore: 0,
        homeworkScore: 0,
        totalSessions: 0
      };
    }

    // Calculate score based on attendance and performance
    let sessionScore = 0;
    if (session.attendance_status === 'Present') {
      switch (session.performance) {
        case 'Highly Attentive': sessionScore = 100; break;
        case 'Moderately Attentive': sessionScore = 70; break;
        case 'Not Attentive': sessionScore = 40; break;
        default: sessionScore = 0;
      }
    }
    performanceBySubject[subject][date].academicScore += sessionScore;
    performanceBySubject[subject][date].totalSessions++;
  });

  // Process assessment data (if available)
  assessmentData.forEach(asmt => {
    const date = asmt.date instanceof Date
      ? asmt.date.toLocaleDateString('en-CA')
      : String(asmt.date).slice(0, 10);
    const subject = asmt.subject_name;
    dates.add(date);

    if (!assessmentBySubject[subject]) assessmentBySubject[subject] = {};
    assessmentBySubject[subject][date] = Number(asmt.percentage) || 0;
  });

  // Process homework data (10% of score)
  homeworkData.forEach(hw => {
    const date = hw.date instanceof Date
      ? hw.date.toLocaleDateString('en-CA')
      : String(hw.date).slice(0, 10);
    const subject = hw.subject_name;
    dates.add(date);

    if (!performanceBySubject[subject]) performanceBySubject[subject] = {};
    if (!performanceBySubject[subject][date]) {
      performanceBySubject[subject][date] = {
        academicScore: 0,
        homeworkScore: 0,
        totalSessions: 0
      };
    }

    let hwScore = 0;
    if (hw.status === 'Done') {
      hwScore = 100 - (hw.redo_count * 10);
      if (hwScore < 0) hwScore = 0;
    }
    performanceBySubject[subject][date].homeworkScore = hwScore;
  });

  // Process discipline data (count issues per date)
  const disciplineByDate = {};
  disciplineData.forEach(issue => {
    const date = issue.date instanceof Date
      ? issue.date.toLocaleDateString('en-CA')
      : String(issue.date).slice(0, 10);
    dates.add(date);
    if (!disciplineByDate[date]) disciplineByDate[date] = 0;
    disciplineByDate[date] += 1;
  });

  // Calculate final scores for each subject and date
  const result = {
    daily: {},
    monthly: {},
    overall: {},
    subjects: {}
  };

  // Convert dates to array and sort
  const sortedDates = Array.from(dates).sort();


  // Calculate daily performance
  sortedDates.forEach(date => {
    result.daily[date] = {};

    // Use all subjects from both academic and assessment data
    const allSubjects = Array.from(new Set([
      ...Object.keys(performanceBySubject),
      ...Object.keys(assessmentBySubject)
    ]));

    allSubjects.forEach(subject => {
      // Use academic or assessment for 80%
      let academicAvg = 0;
      if (performanceBySubject[subject]?.[date] && performanceBySubject[subject][date].totalSessions > 0) {
        academicAvg = performanceBySubject[subject][date].academicScore / performanceBySubject[subject][date].totalSessions;
      } else if (assessmentBySubject[subject] && assessmentBySubject[subject][date] !== undefined) {
        academicAvg = assessmentBySubject[subject][date];
      }

      const homeworkScore = performanceBySubject[subject]?.[date]?.homeworkScore || 0;

      // Discipline calculation (20%)
      let disciplineScore = 20;
      const issueCount = disciplineByDate[date] || 0;
      if (issueCount === 1) disciplineScore = 10;
      else if (issueCount >= 2) disciplineScore = 0;

      // Compose total
      const totalScore = (academicAvg * 0.8) + (homeworkScore * 0.1) + disciplineScore;

      // Only add if there is assessment or academic data for this subject/date
      if (
        (performanceBySubject[subject]?.[date] && performanceBySubject[subject][date].totalSessions > 0) ||
        (assessmentBySubject[subject] && assessmentBySubject[subject][date] !== undefined)
      ) {
        result.daily[date][subject] = Math.round(totalScore);
      }
    });

    // Calculate overall daily performance
    const subjects = Object.keys(result.daily[date]).filter(s => s !== 'Overall');
    if (subjects.length > 0) {
      let dailyTotal = 0;
      let count = 0;
      subjects.forEach(subject => {
        if (result.daily[date][subject] !== undefined) {
          dailyTotal += result.daily[date][subject];
          count++;
        }
      });
      result.daily[date].Overall = count > 0 ? Math.round(dailyTotal / count) : 0;
    }
  });

  // Calculate monthly performance (group by month)
  const monthlyTemp = {};
  Object.keys(result.daily).forEach(date => {
    const month = date.slice(0, 7); // 'YYYY-MM'
    if (!monthlyTemp[month]) monthlyTemp[month] = {};
    Object.keys(result.daily[date]).forEach(subject => {
      if (!monthlyTemp[month][subject]) monthlyTemp[month][subject] = [];
      const val = result.daily[date][subject];
      if (typeof val === 'number' && !isNaN(val)) {
        monthlyTemp[month][subject].push(val);
      }
    });
  });

  // Calculate monthly averages
  Object.keys(monthlyTemp).forEach(month => {
    result.monthly[month] = {};
    Object.keys(monthlyTemp[month]).forEach(subject => {
      const arr = monthlyTemp[month][subject];
      result.monthly[month][subject] = arr.length > 0
        ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
        : 0;
    });
    // Calculate overall monthly performance
    const subjectKeys = Object.keys(monthlyTemp[month]).filter(s => s !== 'Overall');
    if (subjectKeys.length > 0) {
      let sum = 0;
      subjectKeys.forEach(subject => {
        sum += result.monthly[month][subject];
      });
      result.monthly[month].Overall = Math.round(sum / subjectKeys.length);
    }
  });

  // Add subjectList for frontend subject graph fallback
  const allSubjectsSet = new Set([
    ...Object.keys(performanceBySubject),
    ...Object.keys(assessmentBySubject)
  ]);
  result.subjectList = Array.from(allSubjectsSet);

  result.subjectList.forEach(subject => {
    result.subjects[subject] = {};
    // Fill daily scores for this subject
    Object.keys(result.daily).forEach(date => {
      if (result.daily[date][subject] !== undefined) {
        result.subjects[subject][date] = result.daily[date][subject];
      }
    });
    // Fill overall score for this subject (from result.overall)
    if (result.overall && result.overall[subject] !== undefined) {
      result.subjects[subject].Overall = result.overall[subject];
    }
  });

  return result;
}

//get section subjects
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

const moment = require('moment');

exports.getStudentScheduleByMonth = (req, res) => {
  const { sectionId, month, year } = req.body;

  if (!sectionId || !month || !year) {
    return res.status(400).json({ success: false, message: 'Missing required parameters' });
  }

  // Get start and end dates of the month
  const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
  const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

  const query = `
    SELECT 
      ds.id, ds.date, ds.session_no, ds.start_time, ds.end_time, 
      sub.subject_name, u.name AS mentor_name, act.activity_type, up.file_path,
      sec.section_name, sec.grade_id
    FROM daily_schedule ds
    LEFT JOIN subjects sub ON ds.subject_id = sub.id
    LEFT JOIN mentors m ON ds.mentors_id = m.id
    JOIN Users u ON m.phone = u.phone
    JOIN Activity_Types act ON ds.activity = act.id
    JOIN User_photos up ON m.phone = up.phone
    JOIN Sections sec ON ds.section_id = sec.id
    WHERE ds.section_id = ? 
      AND ds.date BETWEEN ? AND ?
    ORDER BY ds.date, ds.session_no
  `;

  db.query(query, [sectionId, startDate, endDate], (err, results) => {
    if (err) {
      console.error('Error fetching schedules:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Group by day (1-31)
    const scheduleByDay = {};
    results.forEach(item => {
      const day = moment(item.date).date(); // 1-31
      if (!scheduleByDay[day]) scheduleByDay[day] = [];

      let color = '#FFF3E0'; // default orange
      if (item.activity_type === 'Academic') color = '#E8F5E9'; // greenish
      else if (item.activity_type === 'Assessment') color = '#FFEBEE'; // reddish

      scheduleByDay[day].push({
        sessionNo: item.session_no,
        startTime: item.start_time,
        endTime: item.end_time,
        subject: item.subject_name,
        mentor: item.mentor_name,
        activity: item.activity_type,
        time: `${item.start_time} - ${item.end_time}`,
        filePath: item.file_path,
        color: color,
        sectionName: item.section_name,
        gradeId: item.grade_id
      });
    });
    console.log("Schedule", scheduleByDay);


    res.json({ success: true, schedule: scheduleByDay });
  });
};

// Get student performance details for a specific date and subject
exports.getAssessmentDetails = async (req, res) => {
  const { sectionId, subject, date, studentRoll, studentId } = req.body;
  console.log("Assessment Details Request:", sectionId, subject, date, studentRoll);
  if (!sectionId || !subject || !date) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Get subject_id
    const [[subjectRow]] = await db.promise().query(
      `SELECT id FROM subjects WHERE subject_name = ?`, [subject]
    );
    if (!subjectRow) return res.json({ hasAssessment: false });

    // Find assessment session for this section, subject, and date
    const [[asmtSession]] = await db.promise().query(
      `SELECT id FROM assessment_sessions WHERE section_id = ? AND subject_id = ? AND date = ? LIMIT 1`,
      [sectionId, subjectRow.id, date]
    );
    if (!asmtSession) return res.json({ hasAssessment: false });

    // Get all marks and materials for this assessment session
    const [marks] = await db.promise().query(
      `SELECT 
        asm.student_roll,
        ANY_VALUE(asm.mark) AS mark,
        ANY_VALUE(asm.percentage) AS percentage,
        ANY_VALUE(asm.current_level) AS current_level,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'file_name', m.file_name,
            'file_url', m.file_url
          )
        ) AS materials
      FROM assessment_session_marks asm
      JOIN JSON_TABLE(
        asm.material_id,
        '$[*]' COLUMNS(material_id INT PATH '$')
      ) jt ON 1=1
      JOIN Materials m ON m.id = jt.material_id
      WHERE asm.as_id = ? AND asm.status = 'Present'
      GROUP BY asm.student_roll;`,
      [asmtSession.id]
    );

    if (!marks || marks.length === 0) return res.json({ hasAssessment: false });

    // Find this student
    const student = marks.find(m => m.student_roll === studentRoll);

    // Calculate rank
    const sortedMarks = marks
      .map(m => ({ roll: m.student_roll, mark: m.mark || 0 }))
      .sort((a, b) => b.mark - a.mark);
    let rank = null;
    if (student) {
      rank = sortedMarks.findIndex(m => m.roll === studentRoll) + 1;
    }

    //Mark percentage to 80%

    if (student) {
      student.percentage = Math.round((student.mark / 100) * 80);
    }

    // Level
    const level = student ? student.current_level : null;

    // Discipline (10%)
    let disciplinePercent = 10;
    if (studentId) {
      const [[disciplineRow]] = await db.promise().query(
        `SELECT COUNT(*) as count FROM student_dicipline WHERE roll = ? AND DATE(registered_at) = ?`,
        [studentRoll, date]
      );
      disciplinePercent = (disciplineRow.count > 0) ? 0 : 10;
    }

    // Homework (20%)
    let homeworkPercent = 0;
    if (studentId && subjectRow) {
      const [[hwRow]] = await db.promise().query(
        `SELECT sh.status, sh.redo_count FROM student_homework sh
         JOIN homework h ON sh.homework_id = h.id
         WHERE sh.student_roll = ? AND h.subject_id = ? AND h.date = ? LIMIT 1`,
        [studentRoll, subjectRow.id, date]
      );
      if (hwRow && hwRow.status === 'Done') {
        homeworkPercent = 10 - (hwRow.redo_count * 2);
        if (homeworkPercent < 0) homeworkPercent = 0;
      }
    }

    // Class-level stats
    const highestScore = sortedMarks[0]?.mark || 0;
    const classAverage = Math.round(sortedMarks.reduce((a, b) => a + b.mark, 0) / sortedMarks.length);

    res.json({
      hasAssessment: true,
      assessmentSessionId: asmtSession.id,
      subject: subject,
      date: date,
      highestScore,
      classAverage,
      score: student ? student.mark : null,
      rank,
      level,
      disciplinePercent,
      homeworkPercent,
      assessmentPercent: student ? student.percentage : null,
      materials: student ? student.materials : [],
      students: marks.map(m => ({
        roll: m.student_roll,
        mark: m.mark,
        percentage: m.percentage,
        level: m.current_level,
        materials: m.materials
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};


exports.getAcademicDetails = async (req, res) => {
  const { studentId, sectionId, subject, date } = req.body;
  // console.log("Academic Details Request:", studentId, sectionId, subject, date);

  if (!studentId || !sectionId || !subject || !date) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Get subject_id and student_roll
    const [[student]] = await db.promise().query(
      `SELECT roll FROM students WHERE id = ?`, [studentId]
    );
    const [[subjectRow]] = await db.promise().query(
      `SELECT id FROM subjects WHERE subject_name = ?`, [subject]
    );
    if (!student || !subjectRow) return res.json({});
    // console.log("Student Roll:", student.roll, "Subject ID:", subjectRow.id);

    // Find academic session(s) for this section, subject, and date
    const [sessions] = await db.promise().query(
      `SELECT asa.performance, asa.attendance_status, asa.session_id, ds.session_no
       FROM academic_session_attendance asa
       JOIN daily_schedule ds ON asa.session_id = ds.id
       JOIN academic_sessions ass ON asa.session_id = ass.dsa_id
       WHERE asa.student_id = ? AND ds.section_id = ? AND ds.subject_id = ? AND ds.date = ? AND ass.status = 'Completed'`,
      [studentId, sectionId, subjectRow.id, date]
    );
    if (!sessions || sessions.length === 0) return res.json({});

    // Find the student's current level from the session(s)
    let level1 = null;
    if (sessions.length > 0) {
      // Use the first session's session_no as level (or adjust as needed)
      level1 = sessions[0].session_no;
    }

    const [[sectionRow]] = await db.promise().query(
      `SELECT grade_id FROM sections WHERE id = ?`,
      [sectionId]
    );
    if (!sectionRow) return res.json({});
    const gradeId = sectionRow.grade_id;
    // console.log("Section Grade ID:", gradeId, "Level:", level1);


    // Fetch materials for this level, subject, and section
    let materials = [];
    if (level1) {
      // Method 1: Using JSON_TABLE (MySQL 8.0+)
      // console.log("Fetching materials for subject:", subjectRow.id, "gradeId:", gradeId, "level:", level1);

      const [materialRows] = await db.promise().query(
        `SELECT m.file_name, m.file_url
   FROM materials m
   WHERE m.subject_id = ? 
     AND m.grade_id = ? 
     AND m.level = ?
     AND material_type = 'PDF'`,
        [subjectRow.id, gradeId, level1]
      );

      // console.log("Material Rows:", materialRows);

      // Fallback method if JSON_TABLE fails
      if (!materialRows || materialRows.length === 0) {
        const [fallbackRows] = await db.promise().query(
          `SELECT m.file_name, m.file_url
   FROM materials m
   WHERE m.subject_id = ? 
     AND m.level = ?`,
          [subjectRow.id, level1]
        );

        materials = fallbackRows;
      } else {
        materials = materialRows;
      }
    }


    // Calculate attentiveness and academic percent
    let totalScore = 0, count = 0, level = null;
    let attentiveness = "Not Attentive";
    sessions.forEach(s => {
      if (s.attendance_status === 'Present') {
        switch (s.performance) {
          case 'Highly Attentive': totalScore += 100; break;
          case 'Moderately Attentive': totalScore += 70; break;
          case 'Not Attentive': totalScore += 40; break;
          default: totalScore += 0;
        }
        count++;
      }
      if (s.session_no && !level) level = s.session_no;
    });
    const academicPercent = count > 0 ? Math.round((totalScore / count) * 0.8) : 0;
    if (academicPercent >= 70) attentiveness = "Highly Attentive";
    else if (academicPercent >= 40) attentiveness = "Moderately Attentive";

    // Discipline (10%)
    const [[disciplineRow]] = await db.promise().query(
      `SELECT COUNT(*) as count FROM student_dicipline WHERE roll = ? AND DATE(registered_at) = ?`,
      [student.roll, date]
    );
    const disciplinePercent = (disciplineRow.count > 0) ? 0 : 10;

    // Homework (20%)
    const [[hwRow]] = await db.promise().query(
      `SELECT sh.status, sh.redo_count FROM student_homework sh
       JOIN homework h ON sh.homework_id = h.id
       WHERE sh.student_roll = ? AND h.subject_id = ? AND h.date = ? LIMIT 1`,
      [student.roll, subjectRow.id, date]
    );
    let homeworkPercent = 0;
    if (hwRow && hwRow.status === 'Done') {
      homeworkPercent = 20 - (hwRow.redo_count * 2);
      if (homeworkPercent < 0) homeworkPercent = 0;
    }

    res.json({
      attentiveness,
      level,
      disciplinePercent,
      homeworkPercent,
      academicPercent,
      materials
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

//ExamSchedule
// Fetch exam schedule for a section
exports.getExamScheduleBySection = async (req, res) => {
  const { grade_id } = req.body;
  if (!grade_id) {
    return res.status(400).json({ success: false, message: "Missing section_id" });
  }

  try {
    const sql = `SELECT es.*, s.subject_name
        FROM Exam_Schedule es
        LEFT JOIN Subjects s ON es.subject_id = s.id
        WHERE es.grade_id = ?
        ORDER BY es.exam_date;`;

    db.query(sql, [grade_id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.status(200).json({ success: true, schedules: results });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Fetch materials and completed levels for a student and subject
exports.getMaterialsAndCompletedLevels = async (req, res) => {
  const { section_id, subject_id, student_roll } = req.body;
  if (!section_id || !subject_id || !student_roll) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Get grade_id from section_id
    const [[sectionRow]] = await db.promise().query(
      `SELECT grade_id FROM sections WHERE id = ?`, [section_id]
    );
    if (!sectionRow) return res.status(404).json({ success: false, message: "Section not found" });
    const grade_id = sectionRow.grade_id;

    // Fetch materials for this subject and grade
    const [materials] = await db.promise().query(
      `SELECT id, level, material_type, file_name, file_url
       FROM materials
       WHERE subject_id = ? AND grade_id = ?
       ORDER BY level ASC, material_type ASC`,
      [subject_id, grade_id]
    );

    // Fetch completed levels for this student and subject
    const [completedLevelsRows] = await db.promise().query(
      `SELECT DISTINCT level
       FROM student_level_updates
       WHERE student_roll = ? AND subject_id = ?`,
      [student_roll, subject_id]
    );
    const completedLevels = completedLevelsRows.map(row => row.level);

    res.json({
      success: true,
      materials,
      completedLevels
    });
  } catch (err) {
    console.error("Error fetching materials and completed levels:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

//PHone Book
exports.fetchSectionSubjectMentors = (req, res) => {
  const { sectionId } = req.body;

  if (!sectionId) {
    return res.status(400).json({ success: false, message: 'Missing sectionId' });
  }

  const sql = `
   SELECT 
    s.id AS subject_id,
    m.roll AS mentor_roll,
    s.subject_name,
    m.id AS mentor_id,
    u.name AS mentor_name,
    m.phone AS mentor_phone,
    up.file_path
FROM 
    section_mentor_subject sms
JOIN 
    mentor_section_assignments msa ON sms.msa_id = msa.id
JOIN 
    subjects s ON msa.subject_id = s.id
JOIN 
    mentors m ON msa.mentor_id = m.id
JOIN 
    Users u ON m.phone = u.phone
JOIN 
    User_photos up ON m.phone = up.phone
WHERE 
    sms.section_id = ?;
  `;

  db.query(sql, [sectionId], (err, results) => {
    if (err) {
      console.error("Error fetching section subject mentors:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, subjectMentors: results });
  });
}

//Events

exports.getRegisteredEvents = (req, res) => {
  const { studentId } = req.query;

  const sql = `
    SELECT 
  e.*,
  g.grade_name,
  (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS participants_count
FROM events e
JOIN event_participants ep ON e.id = ep.event_id
LEFT JOIN grades g ON e.grade_id = g.id
WHERE ep.student_id = ?
GROUP BY e.id
ORDER BY e.event_date DESC
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, registeredEvents: results });
  });
};

exports.registerEvent = (req, res) => {
  const { studentId, eventId } = req.body;

  if (!studentId || !eventId) {
    return res.status(400).json({ success: false, message: 'Missing datas' });
  }

  const checkSql = `SELECT COUNT(id) AS cnt FROM event_participants WHERE student_id = ? AND event_id = ?`;

  const sql = `
   INSERT INTO event_participants (student_id, event_id) VALUES(?, ?);
  `;

  db.query(checkSql, [studentId, eventId], (err, results) => {
    if (err) {
      console.error("Error registering event:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    console.log(results);


    if (results[0].cnt != 0) {
      return res.status(500).json({ success: false, message: 'Already registered' });
    }

    db.query(sql, [studentId, eventId], (err, results) => {
      if (err) {
        console.error("Error registering event:", err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({ success: true });
    });
  })

}

//Favourite

// Add event to favorites
exports.addFavouriteEvent = (req, res) => {
  const { student_roll, event_id } = req.body;
  if (!student_roll || !event_id) {
    return res.status(400).json({ success: false, message: 'Missing data' });
  }
  const sql = `INSERT IGNORE INTO favourite_events (student_roll, event_id) VALUES (?, ?)`;
  db.query(sql, [student_roll, event_id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true });
  });
};

// Remove event from favorites
exports.removeFavouriteEvent = (req, res) => {
  const { student_roll, event_id } = req.body;
  if (!student_roll || !event_id) {
    return res.status(400).json({ success: false, message: 'Missing data' });
  }
  const sql = `DELETE FROM favourite_events WHERE student_roll = ? AND event_id = ?`;
  db.query(sql, [student_roll, event_id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true });
  });
};

// Get all favourite events for a student
exports.getFavouriteEvents = (req, res) => {
  const { student_roll } = req.query;
  if (!student_roll) {
    return res.status(400).json({ success: false, message: 'Missing student_roll' });
  }
  const sql = `
    SELECT e.*, g.grade_name
    FROM favourite_events f
    JOIN events e ON f.event_id = e.id
    LEFT JOIN grades g ON e.grade_id = g.id
    WHERE f.student_roll = ?
    ORDER BY e.event_date DESC
  `;
  db.query(sql, [student_roll], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, favouriteEvents: results });
  });
};

//Parent Dashboard homework
exports.getPendingHomework = (req, res) => {
  const { student_roll } = req.body;
  // console.log(student_roll);
  
  if (!student_roll) return res.status(400).json({ success: false, message: "Missing student_roll" });

  const sql = `
    SELECT h.id, h.subject_id, h.level, h.date, h.section_id, h.grade_id, h.created_by, h.created_at,
           s.status, s.completed_date,  sub.subject_name
    FROM homework h
    JOIN student_homework s ON h.id = s.homework_id
    JOIN subjects sub ON h.subject_id = sub.id
    WHERE s.student_roll = ? AND (s.status != 'Done')
    ORDER BY h.date DESC
  `;
  db.query(sql, [student_roll], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, homework: results });
  });
};

//Survey
exports.getStudentSurveys = (req, res) => {
    const { studentId } = req.query;

    if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const sql = `
        SELECT
            s.id,
            s.task_type,
            s.title,
            s.description,
            s.start_date,
            s.end_date,
            ss.completed,
            u.name AS mentor_name,
            up.file_path AS mentor_photo
        FROM surveys s
        JOIN survey_students ss ON s.id = ss.survey_id
        JOIN mentors m ON s.mentor_id = m.id
        JOIN users u ON m.phone = u.phone
        LEFT JOIN user_photos up ON u.phone = up.phone AND up.is_profile_photo = 1
        WHERE ss.student_id = ? AND s.status = 'Active' AND s.end_date >= CURDATE()
        ORDER BY s.created_at DESC;
    `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("Error fetching student surveys:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, surveys: results });
    });
};

// NEW: Get all questions for a specific survey
exports.getSurveyQuestions = (req, res) => {
    const { surveyId } = req.query;

    if (!surveyId) {
        return res.status(400).json({ success: false, message: 'Survey ID is required' });
    }

    const sql = `
        SELECT id, question_text, answer_type
        FROM survey_questions
        WHERE survey_id = ?
        ORDER BY question_order;
    `;

    db.query(sql, [surveyId], (err, results) => {
        if (err) {
            console.error("Error fetching survey questions:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, questions: results });
    });
};

// NEW: Submit answers for a feedback survey
exports.submitSurveyResponse = async (req, res) => {
    const { surveyId, studentId, responses } = req.body;

    if (!surveyId || !studentId || !responses || !Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing required data' });
    }

    try {
        const transaction = await db.beginTransaction();

        const responseValues = responses.map(r => [
            surveyId,
            studentId,
            r.question_id,
            r.answer,  // Always store answer as text
            null       // option_answer is null
        ]);

        const insertSql = `
            INSERT INTO survey_question_responses 
            (survey_id, student_id, question_id, text_answer, option_answer) 
            VALUES ?
        `;

        await transaction.query(insertSql, [responseValues]);

        const updateSql = `UPDATE survey_students SET completed = 1 WHERE survey_id = ? AND student_id = ?`;
        await transaction.query(updateSql, [surveyId, studentId]);

        await transaction.commit();
        res.json({ success: true, message: 'Feedback submitted successfully' });

    } catch (err) {
        if (err.rollback) await err.rollback();  // custom rollback on transaction object if it's included
        console.error("Transaction error in submitSurveyResponse:", err);
        res.status(500).json({ success: false, message: 'Transaction failed: ' + err.message });
    }
};


// NEW: Mark a non-feedback survey as read
exports.markSurveyAsRead = (req, res) => {
    const { surveyId, studentId } = req.body;

    if (!surveyId || !studentId) {
        return res.status(400).json({ success: false, message: 'Missing required data' });
    }

    const sql = `UPDATE survey_students SET completed = 1 WHERE survey_id = ? AND student_id = ?`;

    db.query(sql, [surveyId, studentId], (err, result) => {
        if (err) {
            console.error("Error marking survey as read:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Survey or student not found' });
        }
        res.json({ success: true, message: 'Marked as read' });
    });
};