const db = require('../../config/db');

//Homework

// Add homework
exports.addHomework = async (req, res) => {
    const {
        completion_date,
        grade_id,
        section_id,
        subject_id,
        batch_id,
        topic_id,
        created_by,
        student_rolls,
        due_date
    } = req.body;

    if (!grade_id || !section_id || !subject_id || !created_by || !student_rolls || !Array.isArray(student_rolls)) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let transaction;
    try {
        // Start transaction
        transaction = await db.promise().beginTransaction();

        // Insert homework record
        const homeworkResult = await transaction.query(
            `INSERT INTO homework 
       (given_date, completion_date, grade_id, section_id, subject_id, batch_id, topic_id, created_by) 
       VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, ?)`,
            [completion_date, grade_id, section_id, subject_id, batch_id, topic_id, created_by]
        );

        const homeworkId = homeworkResult.insertId;
        const assignedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const dueDateToUse = due_date || assignedDate;

        // Insert student homework tracking records for selected students
        if (student_rolls.length > 0) {
            const studentTrackingValues = student_rolls.map(studentRoll => [
                studentRoll,
                homeworkId,
                subject_id,
                topic_id,
                batch_id,
                assignedDate,
                dueDateToUse,
                'Assigned' // Default status
            ]);

            await transaction.query(
                `INSERT INTO student_homework_tracking 
         (student_roll, homework_id, subject_id, topic_id, batch_id, assigned_date, due_date, status) 
         VALUES ?`,
                [studentTrackingValues]
            );
        }

        // Commit transaction
        await transaction.commit();

        res.json({
            success: true,
            message: 'Homework assigned successfully',
            data: {
                homeworkId,
                studentsAssigned: student_rolls.length
            }
        });
    } catch (err) {
        console.error("Error adding homework:", err);
        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
};


// Get homework list for mentor
exports.getHomeworkList = async (req, res) => {
    const { mentorId } = req.query;

    if (!mentorId) {
        return res.status(400).json({ success: false, message: 'Missing mentorId' });
    }

    // Function to build topic hierarchy path
    const buildTopicPath = async (topicId) => {
        if (!topicId) return null;
        
        const pathSql = `
          WITH RECURSIVE topic_path AS (
            SELECT id, topic_name, parent_id, 0 as level
            FROM topic_hierarchy 
            WHERE id = ?
            
            UNION ALL
            
            SELECT th.id, th.topic_name, th.parent_id, tp.level + 1
            FROM topic_hierarchy th
            INNER JOIN topic_path tp ON th.id = tp.parent_id
          )
          SELECT topic_name FROM topic_path ORDER BY level DESC
        `;
        
        try {
            const [pathResults] = await db.promise().query(pathSql, [topicId]);
            return pathResults.map(r => r.topic_name).join(' > ');
        } catch (err) {
            console.error('Error building topic path:', err);
            return null;
        }
    };

    const sql = `
    SELECT 
      h.id,
      h.topic_id,
      DATE_FORMAT(h.given_date, '%d/%m/%Y') AS formatted_date,
      g.grade_name,
      s.section_name,
      sub.subject_name,
      th.topic_name,
      b.batch_name,
      COUNT(sht.id) AS total_students,
      SUM(CASE WHEN sht.status IN ('Marked_Complete') THEN 1 ELSE 0 END) AS done_count,
      SUM(CASE WHEN sht.status IN ('Marked_Incomplete') THEN 1 ELSE 0 END) AS redo_count,
      SUM(CASE WHEN sht.status IN ('Assigned', 'Submitted', 'Late_Submitted', 'Missing') THEN 1 ELSE 0 END) AS notCom_count
    FROM homework h
    JOIN grades g ON h.grade_id = g.id
    JOIN sections s ON h.section_id = s.id
    JOIN subjects sub ON h.subject_id = sub.id
    LEFT JOIN topic_hierarchy th ON h.topic_id = th.id
    LEFT JOIN section_batches b ON h.batch_id = b.id
    LEFT JOIN student_homework_tracking sht ON h.id = sht.homework_id
    WHERE h.created_by = ?
    GROUP BY h.id, h.topic_id, h.given_date, g.grade_name, s.section_name, sub.subject_name, th.topic_name, b.batch_name
    ORDER BY h.given_date DESC
  `;

    try {
        const [results] = await db.promise().query(sql, [mentorId]);
        
        // Build topic hierarchy for each homework
        const homeworkWithHierarchy = await Promise.all(
            results.map(async (homework) => {
                const topicPath = await buildTopicPath(homework.topic_id);
                return {
                    ...homework,
                    topic_name: topicPath || homework.topic_name
                };
            })
        );
        
        res.json({ success: true, homeworkList: homeworkWithHierarchy });
    } catch (err) {
        console.error("Error fetching homework list:", err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

// Get homework details with student submissions
exports.getHomeworkDetails = async (req, res) => {
  const { homeworkId } = req.query;

  if (!homeworkId) {
    return res.status(400).json({ success: false, message: 'Missing homeworkId' });
  }

  // Function to build topic hierarchy path
  const buildTopicPath = async (topicId) => {
    if (!topicId) return null;
    
    const pathSql = `
      WITH RECURSIVE topic_path AS (
        SELECT id, topic_name, parent_id, 0 as level
        FROM topic_hierarchy 
        WHERE id = ?
        
        UNION ALL
        
        SELECT th.id, th.topic_name, th.parent_id, tp.level + 1
        FROM topic_hierarchy th
        INNER JOIN topic_path tp ON th.id = tp.parent_id
      )
      SELECT topic_name FROM topic_path ORDER BY level DESC
    `;
    
    try {
      const [pathResults] = await db.promise().query(pathSql, [topicId]);
      return pathResults.map(r => r.topic_name).join(' > ');
    } catch (err) {
      console.error('Error building topic path:', err);
      return null;
    }
  };

  const sql = `
    SELECT 
      h.id,
      h.given_date,
      h.completion_date,
      h.topic_id,
      g.grade_name,
      s.section_name,
      sub.subject_name,
      th.topic_name,
      b.batch_name,
      sht.student_roll,
      st.name AS student_name,
      st.profile_photo,
      sht.status,
      sht.attempts_used,
      sht.days_late,
      sht.redo_count,
      sht.mentor_feedback as redo_reason,
      sht.marked_date,
      sht.submission_date,
      sht.assigned_date,
      sht.due_date,
      sht.mentor_score,
      sht.mentor_feedback
    FROM homework h
    JOIN grades g ON h.grade_id = g.id
    JOIN sections s ON h.section_id = s.id
    JOIN subjects sub ON h.subject_id = sub.id
    LEFT JOIN topic_hierarchy th ON h.topic_id = th.id
    LEFT JOIN section_batches b ON h.batch_id = b.id
    JOIN student_homework_tracking sht ON h.id = sht.homework_id
    JOIN students st ON sht.student_roll = st.roll
    WHERE h.id = ?
    ORDER BY sht.status, st.name
  `;

  try {
    const [results] = await db.promise().query(sql, [homeworkId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    // Build the topic hierarchy path
    const topicPath = await buildTopicPath(results[0].topic_id);

    const homeworkInfo = {
      id: results[0].id,
      given_date: results[0].given_date,
      completion_date: results[0].completion_date,
      grade_name: results[0].grade_name,
      section_name: results[0].section_name,
      subject_name: results[0].subject_name,
      topic_name: topicPath || results[0].topic_name,
      batch_name: results[0].batch_name,
      submissions: results.map(r => ({
        student_roll: r.student_roll,
        student_name: r.student_name,
        profile_photo: r.profile_photo,
        status: r.status,
        attempts_used: r.attempts_used,
        days_late: r.days_late,
        redo_count: r.redo_count,
        redo_reason: r.redo_reason,
        marked_date: r.marked_date,
        submission_date: r.submission_date,
        assigned_date: r.assigned_date,
        due_date: r.due_date,
        mentor_score: r.mentor_score,
        mentor_feedback: r.mentor_feedback
      }))
    };

    res.json({ success: true, homework: homeworkInfo });
  } catch (err) {
    console.error("Error fetching homework details:", err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

exports.bulkUpdateHomeworkStatus = async (req, res) => {
  const { homeworkId, studentRolls, status, mentorId, mentorScore, mentorFeedback, isRedo, redoReason } = req.body;

  if (!homeworkId || !studentRolls || !Array.isArray(studentRolls) || !status) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let transaction;
  try {
    transaction = await db.promise().beginTransaction();

    const markedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    for (const studentRoll of studentRolls) {
      // Get current tracking info to calculate redo count
      const currentInfo = await transaction.query(
        `SELECT redo_count, due_date, submission_date, mentor_feedback
         FROM student_homework_tracking 
         WHERE homework_id = ? AND student_roll = ?`,
        [homeworkId, studentRoll]
      );
      console.log(`Current info for student ${studentRoll}:`, currentInfo.length);
      
      let daysLate = 0;
      let newRedoCount = 0;
      
      if (currentInfo.length > 0) {
        const { due_date, submission_date, redo_count} = currentInfo[0];
        
        // Calculate days late
        if (submission_date && new Date(submission_date) > new Date(due_date)) {
          daysLate = Math.ceil((new Date(submission_date) - new Date(due_date)) / (1000 * 60 * 60 * 24));
        }
        
        // Increment redo count if this is a redo action
        if (isRedo) {
          newRedoCount = (redo_count || 0) + 1;
          console.log(`Incrementing redo count for student ${studentRoll} to ${newRedoCount}`);
          
        } else {
          newRedoCount = redo_count || 0;
        }
      }
      // Update student homework tracking
      if (isRedo) {
        await transaction.query(
          `UPDATE student_homework_tracking 
           SET status = ?, marked_date = ?, marked_by_mentor_id = ?, 
               mentor_score = ?, mentor_feedback = ?, days_late = ?,
               redo_count = ?, mentor_feedback = ?
           WHERE homework_id = ? AND student_roll = ?`,
          [status, markedDate, mentorId, mentorScore, mentorFeedback, daysLate, newRedoCount, redoReason, homeworkId, studentRoll]
        );
      } else {
        await transaction.query(
          `UPDATE student_homework_tracking 
           SET status = ?, marked_date = ?, marked_by_mentor_id = ?, 
               mentor_score = ?,  days_late = ?, mentor_feedback = ?
           WHERE homework_id = ? AND student_roll = ?`,
          [status, markedDate, mentorId, mentorScore, daysLate, currentInfo[0].mentor_feedback, homeworkId, studentRoll]
        );
      }
    }

    await transaction.commit();

    res.json({ 
      success: true, 
      message: 'Homework status updated successfully',
      studentsUpdated: studentRolls.length
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error("Error bulk updating homework status:", err);
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
};