const db = require('../../config/db');

// Get mentor's schedule for a specific date
const getMentorSchedule = async (req, res) => {
  try {
    const { date, facultyId } = req.body;
    const academicYear = req.activeAcademicYearId;

    // console.log('getMentorSchedule params:', { date, facultyId, academicYear });

    // Validate required parameters
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required'
      });
    }

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Academic year not found. Please ensure academic year is set.'
      });
    }

    const query = `
      SELECT 
        fc.*,
        g.grade_name,
        s.section_name,
        sub.subject_name,
        v.name as venue_name,
        st.name as session_type,
        st.is_student_facing,
        st.evaluation_mode,
        em.name as evaluation_mode_name,
        em.requires_marks,
        em.requires_attentiveness,
        em.requires_docs,
        em.allows_malpractice,
        th.topic_name,
        a.name as activity_name,
        GROUP_CONCAT(DISTINCT sb.batch_name ORDER BY sb.batch_name SEPARATOR ', ') as batch_names,
        MAX(si.id) as session_instance_id,
        MAX(si.status) as session_status,
        MAX(si.started_at) as started_at,
        MAX(si.ended_at) as ended_at
      FROM faculty_calendar fc
      LEFT JOIN grades g ON fc.grade_id = g.id
      LEFT JOIN sections s ON fc.section_id = s.id
      LEFT JOIN subjects sub ON fc.subject_id = sub.id
      LEFT JOIN venues v ON fc.venue_id = v.id
      LEFT JOIN session_types st ON fc.session_type_id = st.id
      LEFT JOIN evaluation_modes em ON st.evaluation_mode = em.id
      LEFT JOIN topic_hierarchy th ON fc.topic_id = th.id
      LEFT JOIN context_activities ca ON fc.context_activity_id = ca.id
      LEFT JOIN activities a ON ca.activity_id = a.id
      LEFT JOIN session_batches sessb ON fc.id = sessb.faculty_calendar_id
      LEFT JOIN section_batches sb ON sessb.batch_id = sb.id
      LEFT JOIN session_instances si ON fc.id = si.faculty_calendar_id
      WHERE fc.faculty_id = ? 
        AND fc.date = ?
        AND fc.academic_year = ?
        AND fc.acting_role = 'mentor'
      GROUP BY fc.id, g.grade_name, s.section_name, sub.subject_name, v.name,
               st.name, st.is_student_facing, st.evaluation_mode, em.name, em.requires_marks,
               em.requires_attentiveness, em.requires_docs, em.allows_malpractice,
               th.topic_name, a.name
      ORDER BY fc.start_time
    `;

    const [schedule] = await db.execute(query, [facultyId, date, academicYear]);

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error fetching mentor schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

// Get students for a session (for marking attendance/evaluation)
const getStudentsForSession = async (req, res) => {
  try {
    const { facultyCalendarId, assessment_cycle_id } = req.body;
    const academicYear = req.activeAcademicYearId;

    // First get the session details
    const [sessionDetails] = await db.execute(`
      SELECT fc.*, st.evaluation_mode, st.is_student_facing,
        em.requires_marks, em.requires_attentiveness, em.allows_malpractice,
        ac.name as assessment_cycle_name
      FROM faculty_calendar fc
      LEFT JOIN session_types st ON fc.session_type_id = st.id
      LEFT JOIN evaluation_modes em ON st.evaluation_mode = em.id
      LEFT JOIN assessment_cycles ac ON fc.assessment_cycle_id = ac.id
      WHERE fc.id = ?
    `, [facultyCalendarId]);

    if (sessionDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessionDetails[0];

    let students = [];

    // If this is a marks-based assessment session tied to an assessment cycle,
    // fetch students from student_schedule_calendar using this faculty_calendar_id.
    if (session.requires_marks === 1 && session.assessment_cycle_id) {
      const [assessmentStudents] = await db.execute(`
        SELECT DISTINCT
          s.id,
          s.name,
          s.roll,
          s.photo_url,
          se.marks_obtained,
          se.attentiveness_id,
          se.malpractice_flag,
          se.remarks,
          sa.attentiveness
        FROM student_schedule_calendar ssc
        INNER JOIN students s ON ssc.student_id = s.id
        LEFT JOIN session_instances si ON si.faculty_calendar_id = ?
        LEFT JOIN student_evaluations se ON se.session_instance_id = si.id AND se.student_id = s.id
        LEFT JOIN student_attentiveness sa ON se.attentiveness_id = sa.id
        WHERE ssc.faculty_calendar_id = ?
        ORDER BY s.roll
      `, [facultyCalendarId, facultyCalendarId, academicYear]);

      students = assessmentStudents;
    } else {
      // Existing behaviour for non-marks sessions: use batches/section

      // Get batches for this session
      const [batches] = await db.execute(`
        SELECT batch_id FROM session_batches WHERE faculty_calendar_id = ?
      `, [facultyCalendarId]);

      if (batches.length > 0) {
        const batchIds = batches.map(b => b.batch_id);
        const placeholders = batchIds.map(() => '?').join(',');

        // Get students assigned to these batches
        const [batchStudents] = await db.execute(`
          SELECT DISTINCT
            s.id,
            s.name,
            s.roll,
            s.photo_url,
            sba.batch_id,
            sb.batch_name,
            se.marks_obtained,
            se.attentiveness_id,
            se.malpractice_flag,
            se.remarks,
            sa.attentiveness
          FROM students s
          INNER JOIN student_batch_assignments sba ON s.id = sba.student_id
          INNER JOIN section_batches sb ON sba.batch_id = sb.id
          LEFT JOIN session_instances si ON si.faculty_calendar_id = ?
          LEFT JOIN student_evaluations se ON se.session_instance_id = si.id AND se.student_id = s.id
          LEFT JOIN student_attentiveness sa ON se.attentiveness_id = sa.id
          WHERE sba.batch_id IN (${placeholders})
            AND sba.academic_year = ?
          ORDER BY s.roll
        `, [facultyCalendarId, ...batchIds, academicYear]);

        students = batchStudents;
      } else {
        // If no batches, get all students from the section
        const [sectionStudents] = await db.execute(`
          SELECT DISTINCT
            s.id,
            s.name,
            s.roll,
            s.photo_url,
            se.marks_obtained,
            se.attentiveness_id,
            se.malpractice_flag,
            se.remarks,
            sa.attentiveness
          FROM students s
          INNER JOIN student_mappings sm ON s.id = sm.student_id
          LEFT JOIN session_instances si ON si.faculty_calendar_id = ?
          LEFT JOIN student_evaluations se ON se.session_instance_id = si.id AND se.student_id = s.id
          LEFT JOIN student_attentiveness sa ON se.attentiveness_id = sa.id
          WHERE sm.section_id = ?
            AND sm.academic_year = ?
          ORDER BY s.roll
        `, [facultyCalendarId, session.section_id, academicYear]);

        students = sectionStudents;
      }
    }

    // Get attentiveness options
    const [attentivenessOptions] = await db.execute(`
      SELECT id, attentiveness FROM student_attentiveness ORDER BY id
    `);

    res.json({
      success: true,
      students,
      sessionDetails: session,
      attentivenessOptions
    });
  } catch (error) {
    console.error('Error fetching students for session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

// Start a session
const startSession = async (req, res) => {
  try {
    const { facultyCalendarId, facultyId } = req.body;
    const userId = facultyId;


    // Get session timing details
    const [sessionInfo] = await db.execute(`
      SELECT date, start_time, end_time 
      FROM faculty_calendar 
      WHERE id = ?
    `, [facultyCalendarId]);

    if (sessionInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const { date, start_time, end_time } = sessionInfo[0];
    
    // Validate current time against session start time
    const now = new Date();
    const sessionDate = new Date(date);
    const [startHours, startMinutes] = start_time.split(':');
    const sessionStartDateTime = new Date(sessionDate);
    sessionStartDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    if (now < sessionStartDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start session before scheduled time',
        scheduledStartTime: sessionStartDateTime
      });
    }

    // Check if session already started
    const [existing] = await db.execute(`
      SELECT id, status FROM session_instances 
      WHERE faculty_calendar_id = ?
    `, [facultyCalendarId]);

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'Session already started',
        sessionInstanceId: existing[0].id,
        status: existing[0].status
      });
    }

    // Create session instance
    const [result] = await db.execute(`
      INSERT INTO session_instances 
      (faculty_calendar_id, started_by_faculty_id, started_at, status, created_at)
      VALUES (?, ?, NOW(), 'running', NOW())
    `, [facultyCalendarId, facultyId]);

    res.json({
      success: true,
      message: 'Session started successfully',
      sessionInstanceId: result.insertId
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
};

// Finish a session (mark as finished with evaluations, before ending)
const finishSession = async (req, res) => {
  try {
    const { 
      facultyCalendarId, 
      studentEvaluations,
      facultyNotes,
      earlyCompletionReason,
      facultyId
    } = req.body;
    

    // Get session instance with session type info
    const [sessionInstance] = await db.execute(`
      SELECT si.id, fc.end_time, fc.date, fc.section_id, fc.grade_id, fc.subject_id,
        st.evaluation_mode, st.is_student_facing
      FROM session_instances si
      INNER JOIN faculty_calendar fc ON si.faculty_calendar_id = fc.id
      LEFT JOIN session_types st ON fc.session_type_id = st.id
      WHERE si.faculty_calendar_id = ? AND si.status = 'running'
    `, [facultyCalendarId]);

    if (sessionInstance.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No running session found'
      });
    }

    const sessionInstanceId = sessionInstance[0].id;
    const evaluationModeId = sessionInstance[0].evaluation_mode;
    const isStudentFacing = sessionInstance[0].is_student_facing;

    // Handle evaluations based on session type
    if (isStudentFacing === 1) {
      // Student-facing session: Insert student evaluations
      if (studentEvaluations && studentEvaluations.length > 0) {
        for (const evaluation of studentEvaluations) {
          // Only insert if student is marked (present or absent)
          if (evaluation.isPresent !== undefined) {
            await db.execute(`
              INSERT INTO student_evaluations 
              (session_instance_id, student_id, evaluation_type_id, marks_obtained, 
               attentiveness_id, malpractice_flag, remarks, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE
                marks_obtained = VALUES(marks_obtained),
                attentiveness_id = VALUES(attentiveness_id),
                malpractice_flag = VALUES(malpractice_flag),
                remarks = VALUES(remarks)
            `, [
              sessionInstanceId,
              evaluation.studentId,
              evaluationModeId,
              evaluation.isPresent ? (evaluation.marksObtained || null) : null,
              evaluation.isPresent ? (evaluation.attentivenessId || null) : null,
              evaluation.isPresent ? (evaluation.malpracticeFlag || 0) : 0,
              evaluation.remarks || null
            ]);
          }
        }
      }
    } else {
      // Faculty-facing session: Insert faculty evaluation
      await db.execute(`
        INSERT INTO faculty_evaluations 
        (session_instance_id, evaluation_mode_id, faculty_id, is_completed, notes, created_at)
        VALUES (?, ?, ?, 1, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          is_completed = VALUES(is_completed),
          notes = VALUES(notes),
          updated_at = NOW()
      `, [sessionInstanceId, evaluationModeId, facultyId, facultyNotes || '']);
    }

    // Update session instance with finished_at and status
    await db.execute(`
      UPDATE session_instances 
      SET finished_at = NOW(), status = 'finished_not_completed'
      WHERE id = ?
    `, [sessionInstanceId]);

    // If early completion, log the reason
    if (earlyCompletionReason) {
      await db.execute(`
        UPDATE session_instances 
        SET early_completion_reason = ?
        WHERE id = ?
      `, [earlyCompletionReason, sessionInstanceId]);
    }

    res.json({
      success: true,
      message: 'Session finished successfully'
    });
  } catch (error) {
    console.error('Error finishing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to finish session',
      error: error.message
    });
  }
};

// End a session with evaluations
const endSession = async (req, res) => {
  try {
    const { 
      facultyCalendarId,
      homework,
      facultyId,
      earlyCompletionReason
    } = req.body;
   

    // Get session instance with session info
    const [sessionInstance] = await db.execute(`
      SELECT si.id, fc.section_id, fc.grade_id, fc.subject_id, fc.date,
        st.is_student_facing
      FROM session_instances si
      INNER JOIN faculty_calendar fc ON si.faculty_calendar_id = fc.id
      LEFT JOIN session_types st ON fc.session_type_id = st.id
      WHERE si.faculty_calendar_id = ? AND si.status = 'finished_not_completed'
    `, [facultyCalendarId]);

    if (sessionInstance.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No finished session found to end'
      });
    }

    const sessionInstanceId = sessionInstance[0].id;
    const isStudentFacing = sessionInstance[0].is_student_facing;

    // Handle homework assignment if provided (for student-facing sessions)
    if (isStudentFacing === 1 && homework && homework.title) {
      const { title, description, contextActivityId, topicId } = homework;
      
      // Get section batches if any
      const [batches] = await db.execute(`
        SELECT batch_id FROM session_batches WHERE faculty_calendar_id = ?
      `, [facultyCalendarId]);

      // Insert homework into homework_assignments for each batch
      if (batches.length > 0) {
        for (const batch of batches) {
          await db.execute(`
            INSERT INTO homework_assignments 
            (context_activity_id, grade_id, section_id, batch_id, topic_id, assigned_by_faculty_id, due_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            contextActivityId,
            sessionInstance[0].grade_id,
            sessionInstance[0].section_id,
            batch.batch_id,
            topicId,
            facultyId,
            sessionInstance[0].date
          ]);
        }
      }
    }

    // Update session instance status and ended_at
    await db.execute(`
      UPDATE session_instances 
      SET ended_at = NOW(), status = 'completed'
      WHERE id = ?
    `, [sessionInstanceId]);

    // If early completion reason provided, update it
    if (earlyCompletionReason) {
      await db.execute(`
        UPDATE session_instances 
        SET early_completion_reason = ?
        WHERE id = ?
      `, [earlyCompletionReason, sessionInstanceId]);
    }

    // Update faculty calendar status
    await db.execute(`
      UPDATE faculty_calendar 
      SET status = 'completed'
      WHERE id = ?
    `, [facultyCalendarId]);

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
};

// Helper function to get topic hierarchy
const getTopicHierarchy = async (topicId) => {
  if (!topicId) return [];
  
  const hierarchy = [];
  let currentTopicId = topicId;
  
  while (currentTopicId) {
    const [topic] = await db.execute(
      'SELECT id, parent_id, topic_name, topic_code, level FROM topic_hierarchy WHERE id = ?',
      [currentTopicId]
    );
    
    if (topic.length === 0) break;
    
    hierarchy.unshift(topic[0]);
    currentTopicId = topic[0].parent_id;
  }
  // console.log(hierarchy);
  
  return hierarchy;
};

// Helper function to get activity hierarchy through context_activities
const getActivityHierarchy = async (contextActivityId) => {
  if (!contextActivityId) return [];
  
  const hierarchy = [];
  let currentContextId = contextActivityId;
  
  while (currentContextId) {
    // Get context activity details
    const [contextActivity] = await db.execute(
      'SELECT ca.id, ca.activity_id, ca.parent_context_id, a.name, a.description, a.level FROM context_activities ca INNER JOIN activities a ON ca.activity_id = a.id WHERE ca.id = ?',
      [currentContextId]
    );
    
    if (contextActivity.length === 0) break;
    
    hierarchy.unshift({
      context_id: contextActivity[0].id,
      activity_id: contextActivity[0].activity_id,
      name: contextActivity[0].name,
      description: contextActivity[0].description,
      level: contextActivity[0].level
    });
    
    currentContextId = contextActivity[0].parent_context_id;
  }
  
  return hierarchy;
};

// Get session details
const getSessionDetails = async (req, res) => {
  try {
    const { facultyCalendarId } = req.body;

    const [sessionDetails] = await db.execute(`
      SELECT 
        fc.*,
        g.grade_name,
        s.section_name,
        sub.subject_name,
        v.name as venue_name,
        st.name as session_type,
        st.is_student_facing,
        st.evaluation_mode,
        em.name as evaluation_mode_name,
        em.requires_marks,
        em.requires_attentiveness,
        em.requires_docs,
        em.allows_malpractice,
        th.topic_name,
        th.id as topic_id,
        a.name as activity_name,
        MAX(si.id) as session_instance_id,
        MAX(si.status) as session_status,
        MAX(si.started_at) as started_at,
        MAX(si.ended_at) as ended_at,
        GROUP_CONCAT(DISTINCT sb.batch_name ORDER BY sb.batch_name SEPARATOR ', ') as batch_names
      FROM faculty_calendar fc
      LEFT JOIN grades g ON fc.grade_id = g.id
      LEFT JOIN sections s ON fc.section_id = s.id
      LEFT JOIN subjects sub ON fc.subject_id = sub.id
      LEFT JOIN venues v ON fc.venue_id = v.id
      LEFT JOIN session_types st ON fc.session_type_id = st.id
      LEFT JOIN evaluation_modes em ON st.evaluation_mode = em.id
      LEFT JOIN topic_hierarchy th ON fc.topic_id = th.id
      LEFT JOIN context_activities ca ON fc.context_activity_id = ca.id
      LEFT JOIN activities a ON ca.activity_id = a.id
      LEFT JOIN session_batches sessb ON fc.id = sessb.faculty_calendar_id
      LEFT JOIN section_batches sb ON sessb.batch_id = sb.id
      LEFT JOIN session_instances si ON fc.id = si.faculty_calendar_id
      WHERE fc.id = ?
      GROUP BY fc.id, g.grade_name, s.section_name, sub.subject_name, v.name,
               st.name, st.is_student_facing, st.evaluation_mode, em.name, em.requires_marks,
               em.requires_attentiveness, em.requires_docs, em.allows_malpractice,
               th.topic_name, th.id, a.name
    `, [facultyCalendarId]);

    if (sessionDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessionDetails[0];

    // Get topic hierarchy and materials
    let topicHierarchy = [];
    let topicMaterials = [];
    if (session.topic_id) {
      topicHierarchy = await getTopicHierarchy(session.topic_id);
      
      const [materials] = await db.execute(`
        SELECT 
          id, material_title, material_type, material_url, 
          difficulty_level, instructions, estimated_duration, order_number
        FROM topic_materials
        WHERE topic_id = ? AND is_active = 1
        ORDER BY order_number
      `, [session.topic_id]);
      
      topicMaterials = materials;
    }

    // Get activity hierarchy from context_activity_id
    let activityHierarchy = [];
    if (session.context_activity_id) {
      activityHierarchy = await getActivityHierarchy(session.context_activity_id);
    }

    res.json({
      success: true,
      sessionDetails: session,
      topicHierarchy,
      topicMaterials,
      activityHierarchy
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session details',
      error: error.message
    });
  }
};

// Get activities for homework assignment
const getActivitiesForHomework = async (req, res) => {
  try {
    const { gradeId, subjectId } = req.body;

    if (!gradeId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'gradeId and subjectId are required'
      });
    }

    // Get all activities with their hierarchy
    const query = `
      WITH RECURSIVE activity_hierarchy AS (
        -- Base case: get all activities linked to this grade/subject
        SELECT 
          ca.id as context_id,
          ca.activity_id,
          ca.parent_context_id,
          a.name,
          a.description,
          a.level,
          CAST(a.name AS CHAR(1000)) as hierarchy,
          1 as depth
        FROM context_activities ca
        INNER JOIN activities a ON ca.activity_id = a.id
        WHERE ca.grade_id = ?
          AND ca.subject_id = ?
          AND ca.parent_context_id IS NULL
        
        UNION ALL
        
        -- Recursive case: get child activities
        SELECT 
          ca.id,
          ca.activity_id,
          ca.parent_context_id,
          a.name,
          a.description,
          a.level,
          CONCAT(ah.hierarchy, ' > ', a.name),
          ah.depth + 1
        FROM context_activities ca
        INNER JOIN activities a ON ca.activity_id = a.id
        INNER JOIN activity_hierarchy ah ON ca.parent_context_id = ah.context_id
        WHERE ca.grade_id = ?
          AND ca.subject_id = ?
      )
      SELECT DISTINCT
        context_id as id,
        activity_id,
        name,
        description,
        level,
        hierarchy,
        depth
      FROM activity_hierarchy
      ORDER BY depth, hierarchy
    `;

    const [activities] = await db.execute(query, [
      gradeId, subjectId,
      gradeId, subjectId
    ]);
    // console.log(activities);
    
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching activities for homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};

// Get topics for homework assignment
const getTopicsForHomework = async (req, res) => {
  try {
    const { contextActivityId } = req.body;

    if (!contextActivityId) {
      return res.status(400).json({
        success: false,
        message: 'contextActivityId is required'
      });
    }

    // Get all topics for this context activity with their hierarchy
    const query = `
      WITH RECURSIVE topic_tree AS (
        -- Base case: get root topics for this context activity
        SELECT 
          id,
          parent_id,
          topic_name,
          topic_code,
          level,
          CAST(topic_name AS CHAR(1000)) as hierarchy,
          1 as depth
        FROM topic_hierarchy
        WHERE context_activity_id = ?
          AND parent_id IS NULL
        
        UNION ALL
        
        -- Recursive case: get child topics
        SELECT 
          th.id,
          th.parent_id,
          th.topic_name,
          th.topic_code,
          th.level,
          CONCAT(tt.hierarchy, ' > ', th.topic_name),
          tt.depth + 1
        FROM topic_hierarchy th
        INNER JOIN topic_tree tt ON th.parent_id = tt.id
        WHERE th.context_activity_id = ?
      )
      SELECT DISTINCT
        id,
        parent_id,
        topic_name,
        topic_code,
        level,
        hierarchy,
        depth
      FROM topic_tree
      ORDER BY depth, hierarchy
    `;

    const [topics] = await db.execute(query, [contextActivityId, contextActivityId]);
    
    res.json({
      success: true,
      topics
    });
  } catch (error) {
    console.error('Error fetching topics for homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics',
      error: error.message
    });
  }
};

// Update evaluations for finished but not completed session
const updateFinishedSessionEvaluations = async (req, res) => {
  try {
    const { 
      facultyCalendarId, 
      studentEvaluations,
      facultyNotes,
      facultyId
    } = req.body;

    // Get session instance with session type info
    const [sessionInstance] = await db.execute(`
      SELECT si.id, fc.section_id, fc.grade_id, fc.subject_id,
        st.evaluation_mode, st.is_student_facing
      FROM session_instances si
      INNER JOIN faculty_calendar fc ON si.faculty_calendar_id = fc.id
      LEFT JOIN session_types st ON fc.session_type_id = st.id
      WHERE si.faculty_calendar_id = ? AND si.status = 'finished_not_completed'
    `, [facultyCalendarId]);

    if (sessionInstance.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No finished_not_completed session found'
      });
    }

    const sessionInstanceId = sessionInstance[0].id;
    const evaluationModeId = sessionInstance[0].evaluation_mode;
    const isStudentFacing = sessionInstance[0].is_student_facing;

    // Handle evaluations based on session type
    if (isStudentFacing === 1) {
      // Student-facing session: Update student evaluations
      if (studentEvaluations && studentEvaluations.length > 0) {
        for (const evaluation of studentEvaluations) {
          // Only update if student is marked (present or absent)
          if (evaluation.isPresent !== undefined) {
            await db.execute(`
              INSERT INTO student_evaluations 
              (session_instance_id, student_id, evaluation_type_id, marks_obtained, 
               attentiveness_id, malpractice_flag, remarks, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE
                marks_obtained = VALUES(marks_obtained),
                attentiveness_id = VALUES(attentiveness_id),
                malpractice_flag = VALUES(malpractice_flag),
                remarks = VALUES(remarks)
            `, [
              sessionInstanceId,
              evaluation.studentId,
              evaluationModeId,
              evaluation.isPresent ? (evaluation.marksObtained || null) : null,
              evaluation.isPresent ? (evaluation.attentivenessId || null) : null,
              evaluation.isPresent ? (evaluation.malpracticeFlag || 0) : 0,
              evaluation.remarks || null
            ]);
          }
        }
      }
    } else {
      // Faculty-facing session: Update faculty evaluation
      await db.execute(`
        INSERT INTO faculty_evaluations 
        (session_instance_id, faculty_id, notes, created_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          notes = VALUES(notes)
      `, [sessionInstanceId, facultyId, facultyNotes || null]);
    }

    res.json({
      success: true,
      message: 'Evaluations updated successfully'
    });
  } catch (error) {
    console.error('Error updating evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update evaluations',
      error: error.message
    });
  }
};

module.exports = {
  getMentorSchedule,
  getStudentsForSession,
  startSession,
  finishSession,
  updateFinishedSessionEvaluations,
  endSession,
  getSessionDetails,
  getActivitiesForHomework,
  getTopicsForHomework
};
