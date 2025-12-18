const db = require('../../config/db');

// Get mentor's schedule for a specific date
const getMentorSchedule = async (req, res) => {
  try {
    const { date, facultyId } = req.body;
    const academicYear = req.activeAcademicYearId;

    console.log('getMentorSchedule params:', { date, facultyId, academicYear });

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
               st.name, st.evaluation_mode, em.name, em.requires_marks,
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
    const { facultyCalendarId } = req.body;
    const academicYear = req.activeAcademicYearId;

    // First get the session details
    const [sessionDetails] = await db.execute(`
      SELECT fc.*, st.evaluation_mode,
        em.requires_marks, em.requires_attentiveness, em.allows_malpractice
      FROM faculty_calendar fc
      LEFT JOIN session_types st ON fc.session_type_id = st.id
      LEFT JOIN evaluation_modes em ON st.evaluation_mode = em.id
      WHERE fc.id = ?
    `, [facultyCalendarId]);

    if (sessionDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessionDetails[0];

    // Get batches for this session
    const [batches] = await db.execute(`
      SELECT batch_id FROM session_batches WHERE faculty_calendar_id = ?
    `, [facultyCalendarId]);

    let students = [];

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
    const { facultyCalendarId } = req.body;
    const userId = req.user.userId;

    // Get faculty_id from user_id
    const [facultyResult] = await db.execute(
      'SELECT id FROM faculty WHERE user_id = ?',
      [userId]
    );

    if (facultyResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty record not found'
      });
    }

    const facultyId = facultyResult[0].id;

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

// End a session with evaluations
const endSession = async (req, res) => {
  try {
    const { 
      facultyCalendarId, 
      studentEvaluations, 
      earlyCompletionReason 
    } = req.body;
    const userId = req.user.userId;

    // Get faculty_id from user_id
    const [facultyResult] = await db.execute(
      'SELECT id FROM faculty WHERE user_id = ?',
      [userId]
    );

    if (facultyResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty record not found'
      });
    }

    const facultyId = facultyResult[0].id;

    // Get session instance
    const [sessionInstance] = await db.execute(`
      SELECT si.id, fc.end_time, st.evaluation_mode
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

    // Insert student evaluations
    if (studentEvaluations && studentEvaluations.length > 0) {
      for (const evaluation of studentEvaluations) {
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
          evaluation.marksObtained || null,
          evaluation.attentivenessId || null,
          evaluation.malpracticeFlag || 0,
          evaluation.remarks || null
        ]);
      }
    }

    // Update session instance status
    await db.execute(`
      UPDATE session_instances 
      SET ended_at = NOW(), status = 'completed'
      WHERE id = ?
    `, [sessionInstanceId]);

    // Update faculty calendar status
    await db.execute(`
      UPDATE faculty_calendar 
      SET status = 'completed'
      WHERE id = ?
    `, [facultyCalendarId]);

    // If early completion, log the reason
    if (earlyCompletionReason) {
      await db.execute(`
        UPDATE session_instances 
        SET status = 'completed'
        WHERE id = ?
      `, [sessionInstanceId]);

      // You might want to store the reason in a separate field or remarks
      await db.execute(`
        INSERT INTO faculty_evaluations 
        (session_instance_id, evaluation_mode_id, faculty_id, is_completed, notes, created_at)
        VALUES (?, ?, ?, 1, ?, NOW())
        ON DUPLICATE KEY UPDATE notes = VALUES(notes)
      `, [sessionInstanceId, evaluationModeId, facultyId, earlyCompletionReason]);
    }

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
        st.evaluation_mode,
        em.name as evaluation_mode_name,
        em.requires_marks,
        em.requires_attentiveness,
        em.requires_docs,
        em.allows_malpractice,
        th.topic_name,
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
               st.name, st.evaluation_mode, em.name, em.requires_marks,
               em.requires_attentiveness, em.requires_docs, em.allows_malpractice,
               th.topic_name, a.name
    `, [facultyCalendarId]);

    if (sessionDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      sessionDetails: sessionDetails[0]
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

module.exports = {
  getMentorSchedule,
  getStudentsForSession,
  startSession,
  endSession,
  getSessionDetails
};
