const db = require('../../config/db');
const ExcelJS = require('exceljs');

// ==================== BATCH MANAGEMENT ====================

/**
 * Get all batches for a subject-section combination
 */
const getBatches = async (req, res) => {
  try {
    const { sectionId, subjectId } = req.body;

    if (!sectionId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID and Subject ID are required'
      });
    }

    // First get the subject_section_assignments id
    const [ssaRows] = await db.query(
      `SELECT id FROM subject_section_assignments 
       WHERE section_id = ? AND subject_id = ? AND is_active = 1`,
      [sectionId, subjectId]
    );

    if (ssaRows.length === 0) {
      return res.json({
        success: true,
        batches: [],
        message: 'No subject-section assignment found'
      });
    }

    const subjectSectionId = ssaRows[0].id;

    // Get all batches with statistics
    const [batches] = await db.query(
      `SELECT 
        sb.id,
        sb.batch_name,
        sb.batch_level,
        sb.max_students,
        sb.current_students_count,
        sb.avg_performance_score,
        sb.is_active,
        COUNT(DISTINCT stc.section_activity_topic_id) as active_topics,
        ROUND((sb.current_students_count / sb.max_students) * 100, 0) as capacity_utilization,
        CASE
          WHEN sb.avg_performance_score >= 80 THEN 'A'
          WHEN sb.avg_performance_score >= 60 THEN 'B'
          WHEN sb.avg_performance_score >= 40 THEN 'C'
          ELSE 'D'
        END as performance_grade
      FROM section_batches sb
      LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id
      LEFT JOIN student_topic_completion stc ON sba.student_id = stc.student_id
      WHERE sb.subject_section_id = ?
      GROUP BY sb.id
      ORDER BY sb.batch_level, sb.batch_name`,
      [subjectSectionId]
    );

    res.json({
      success: true,
      batches: batches,
      subjectSectionId: subjectSectionId
    });

  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message
    });
  }
};

/**
 * Get batch analytics
 */
const getBatchAnalytics = async (req, res) => {
  try {
    const { sectionId, subjectId } = req.body;

    if (!sectionId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID and Subject ID are required'
      });
    }

    // Get subject_section_assignments id
    const [ssaRows] = await db.query(
      `SELECT id FROM subject_section_assignments 
       WHERE section_id = ? AND subject_id = ? AND is_active = 1`,
      [sectionId, subjectId]
    );

    if (ssaRows.length === 0) {
      return res.json({
        success: true,
        analytics: null,
        message: 'No subject-section assignment found'
      });
    }

    const subjectSectionId = ssaRows[0].id;

    // Get comprehensive analytics
    const [analytics] = await db.query(
      `SELECT 
        COUNT(DISTINCT sb.id) as total_batches,
        SUM(sb.current_students_count) as total_students,
        AVG(sb.avg_performance_score) as overall_avg_performance,
        SUM(CASE WHEN sb.current_students_count >= sb.max_students THEN 1 ELSE 0 END) as full_batches,
        SUM(CASE WHEN sb.current_students_count < sb.max_students THEN 1 ELSE 0 END) as available_batches,
        MAX(sb.batch_level) as max_batch_level
      FROM section_batches sb
      WHERE sb.subject_section_id = ? AND sb.is_active = 1`,
      [subjectSectionId]
    );

    res.json({
      success: true,
      analytics: analytics[0]
    });

  } catch (error) {
    console.error('Error fetching batch analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

/**
 * Initialize batches for a subject-section
 */
const initializeBatches = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { sectionId, subjectId, numberOfBatches, maxStudentsPerBatch } = req.body;
    const coordinatorId = req.user.id;

    if (!sectionId || !subjectId || !numberOfBatches || !maxStudentsPerBatch) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    await connection.beginTransaction();

    // Build a composite -> batch mapping so uploads using the composite label
    // "Grade / Section / Subject :: Batch Name" can be resolved uniquely.
    const [allBatchRows] = await connection.query(
      `SELECT sb.id as batch_id, sb.batch_name, sb.subject_section_id, sec.section_name as section_name, g.grade_name, sub.subject_name
       FROM section_batches sb
       JOIN subject_section_assignments ssa ON sb.subject_section_id = ssa.id
       JOIN sections sec ON ssa.section_id = sec.id
       JOIN grades g ON sec.grade_id = g.id
       JOIN subjects sub ON ssa.subject_id = sub.id
       WHERE sb.is_active = 1`
    );

    const compositeBatchMap = {};
    for (const r of allBatchRows) {
      const composite = `${r.grade_name} / ${r.section_name} / ${r.subject_name} :: ${r.batch_name}`;
      compositeBatchMap[composite] = { batch_id: r.batch_id, subject_section_id: r.subject_section_id };
    }

    // Get subject_section_assignments id
    const [ssaRows] = await connection.query(
      `SELECT id FROM subject_section_assignments 
       WHERE section_id = ? AND subject_id = ? AND is_active = 1`,
      [sectionId, subjectId]
    );

    if (ssaRows.length === 0) {
      throw new Error('No active subject-section assignment found');
    }

    const subjectSectionId = ssaRows[0].id;

    // Check if batches already exist
    const [existingBatches] = await connection.query(
      `SELECT COUNT(*) as count FROM section_batches 
       WHERE subject_section_id = ?`,
      [subjectSectionId]
    );

    if (!existingBatches[0].count > 0) {
      throw new Error('Batches does not exist for this subject-section combination');
    }

    // Create batches
    const batchInserts = [];
    for (let i = 1; i <= numberOfBatches; i++) {
      batchInserts.push([
        subjectSectionId,
        `Batch ${i}`,
        1, // batch_level
        maxStudentsPerBatch,
        0, // current_students_count
        null, // avg_performance_score
        1, // is_active
        coordinatorId
      ]);
    }

    // await connection.query(
    //   `INSERT INTO section_batches 
    //    (subject_section_id, batch_name, batch_level, max_students, 
    //     current_students_count, avg_performance_score, is_active, updated_by)
    //    VALUES ?`,
    //   [batchInserts]
    // );

    // Get all students in the section
    const [students] = await connection.query(
      `SELECT sm.id, s.roll 
       FROM students s
       JOIN student_mappings sm ON s.id = sm.student_id
       JOIN academic_years ay ON sm.academic_year = ay.id AND ay.is_active=1
       WHERE sm.section_id = ?
       ORDER BY s.roll`,
      [sectionId]
    );

    // Distribute students evenly across batches
    if (students.length > 0) {
      const [createdBatches] = await connection.query(
        `SELECT id FROM section_batches WHERE subject_section_id = ? ORDER BY id`,
        [subjectSectionId]
      );

      const studentAssignments = [];
      students.forEach((student, index) => {
        const batchIndex = index % createdBatches.length;
        const batchId = createdBatches[batchIndex].id;
        studentAssignments.push([student.id, batchId, null, null]);
      });

      if (studentAssignments.length > 0) {
        await connection.query(
          `INSERT INTO student_batch_assignments 
           (student_id, batch_id, current_performance, last_activity)
           VALUES ?`,
          [studentAssignments]
        );

        // Update student counts
        for (const batch of createdBatches) {
          const count = studentAssignments.filter(sa => sa[1] === batch.id).length;
          await connection.query(
            `UPDATE section_batches SET current_students_count = ? WHERE id = ?`,
            [count, batch.id]
          );
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Successfully initialized ${numberOfBatches} batches`,
      batchesCreated: numberOfBatches,
      studentsAssigned: students.length
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error initializing batches:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize batches',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Run batch reallocation algorithm
 */
const reallocateBatches = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { sectionId, subjectId } = req.body;
    const coordinatorId = req.user.id;

    if (!sectionId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID and Subject ID are required'
      });
    }

    await connection.beginTransaction();

    // Get subject_section_assignments id
    const [ssaRows] = await connection.query(
      `SELECT id FROM subject_section_assignments 
       WHERE section_id = ? AND subject_id = ? AND is_active = 1`,
      [sectionId, subjectId]
    );

    if (ssaRows.length === 0) {
      throw new Error('No active subject-section assignment found');
    }

    const subjectSectionId = ssaRows[0].id;

    // Get all students with their performance
    const [students] = await connection.query(
      `SELECT 
        sm.id as student_id,
        s.roll,
        sba.batch_id,
        sba.current_performance,
        COUNT(stc.id) as topics_completed
      FROM students s
      JOIN student_mappings sm ON s.id = sm.student_id
      JOIN student_batch_assignments sba ON s.id = sba.student_id
      JOIN section_batches sb ON sba.batch_id = sb.id
      LEFT JOIN student_topic_completion stc ON s.id = stc.student_id AND stc.status = 'completed'
      WHERE sm.section_id = ? AND sb.subject_section_id = ?
      GROUP BY s.id, sba.batch_id
      ORDER BY sba.current_performance DESC, topics_completed DESC`,
      [sectionId, subjectSectionId]
    );

    if (students.length === 0) {
      throw new Error('No students found for reallocation');
    }

    // Get batch information
    const [batches] = await connection.query(
      `SELECT id, batch_name, batch_level, max_students 
       FROM section_batches 
       WHERE subject_section_id = ? 
       ORDER BY batch_level, id`,
      [subjectSectionId]
    );

    // Clear existing assignments
    await connection.query(
      `DELETE sba FROM student_batch_assignments sba
       JOIN section_batches sb ON sba.batch_id = sb.id
       WHERE sb.subject_section_id = ?`,
      [subjectSectionId]
    );

    // Reallocate students based on performance
    const studentsPerBatch = Math.ceil(students.length / batches.length);
    const newAssignments = [];
    
    students.forEach((student, index) => {
      const batchIndex = Math.floor(index / studentsPerBatch);
      const targetBatch = batches[Math.min(batchIndex, batches.length - 1)];
      
      newAssignments.push([
        student.student_id,
        targetBatch.id,
        student.current_performance,
        new Date()
      ]);
    });

    // Insert new assignments
    await connection.query(
      `INSERT INTO student_batch_assignments 
       (student_id, batch_id, current_performance, last_activity)
       VALUES ?`,
      [newAssignments]
    );

    // Update batch statistics
    for (const batch of batches) {
      const batchStudents = newAssignments.filter(sa => sa[1] === batch.id);
      const avgPerformance = batchStudents.reduce((sum, sa) => sum + (sa[2] || 0), 0) / batchStudents.length;
      
      await connection.query(
        `UPDATE section_batches 
         SET current_students_count = ?, 
             avg_performance_score = ?,
             updated_by = ?
         WHERE id = ?`,
        [batchStudents.length, avgPerformance || null, coordinatorId, batch.id]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Batch reallocation completed successfully',
      studentsReallocated: students.length,
      batchesUpdated: batches.length
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error reallocating batches:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reallocate batches',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Configure (create) batches for a subject-section without assigning students
 */
const configureBatches = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { sectionId, subjectId, maxBatches, batchSizeLimit } = req.body;
    const coordinatorId = req.user.id;

    if (!sectionId || !subjectId || !maxBatches) {
      return res.status(400).json({ success: false, message: 'sectionId, subjectId and maxBatches are required' });
    }

    await connection.beginTransaction();

    // Get subject_section_assignments id
    const [ssaRows] = await connection.query(
      `SELECT id FROM subject_section_assignments 
       WHERE section_id = ? AND subject_id = ? AND is_active = 1`,
      [sectionId, subjectId]
    );

    if (ssaRows.length === 0) {
      throw new Error('No active subject-section assignment found');
    }

    const subjectSectionId = ssaRows[0].id;

    // Check if batches already exist
    const [existingBatches] = await connection.query(
      `SELECT COUNT(*) as count FROM section_batches WHERE subject_section_id = ?`,
      [subjectSectionId]
    );

    if (existingBatches[0].count > 0) {
      throw new Error('Batches already exist for this subject-section combination');
    }

    const inserts = [];
    const limit = parseInt(batchSizeLimit, 10) || 30;
    for (let i = 1; i <= parseInt(maxBatches, 10); i++) {
      inserts.push([
        subjectSectionId,
        `Batch ${i}`,
        1,
        limit,
        0,
        null,
        1,
        coordinatorId
      ]);
    }

    if (inserts.length > 0) {
      await connection.query(
        `INSERT INTO section_batches (subject_section_id, batch_name, batch_level, max_students, current_students_count, avg_performance_score, is_active, updated_by) VALUES ?`,
        [inserts]
      );
    }

    await connection.commit();

    res.json({ success: true, message: `Configured ${inserts.length} batches`, batchesCreated: inserts.length });
  } catch (error) {
    await connection.rollback();
    console.error('Error configuring batches:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to configure batches', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Assign students to specific batches (manual assignment)
 * Expects body: { assignments: [{ studentId, batchId }, ...] }
 */
const assignStudents = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { assignments } = req.body;
    const coordinatorId = req.user.id;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ success: false, message: 'assignments array is required' });
    }

    await connection.beginTransaction();

    // Validate batch ids and student ids
    const batchIds = [...new Set(assignments.map(a => a.batchId))];
    const studentIds = [...new Set(assignments.map(a => a.studentId))];

    // Ensure batches exist
    const [batchRows] = await connection.query(
      `SELECT id, subject_section_id, max_students FROM section_batches WHERE id IN (?)`,
      [batchIds]
    );
    if (batchRows.length !== batchIds.length) {
      throw new Error('One or more batches not found');
    }

    // Remove any existing assignments for these students (in their current batch)
    if (studentIds.length > 0) {
      await connection.query(
        `DELETE sba FROM student_batch_assignments sba WHERE sba.student_id IN (?)`,
        [studentIds]
      );
    }
    const [activeAcademicYearRows] = await connection.query(
      `SELECT ay.id from academic_years ay JOIN ay_status ays ON ays.academic_year_id = ay.id WHERE ays.is_active=1`,
    );

    // Insert new assignments
    const values = assignments.map(a => [a.studentId, a.batchId, null, null, activeAcademicYearRows[0].id]);
    if (values.length > 0) {
      await connection.query(
        `INSERT INTO student_batch_assignments (student_id, batch_id, current_performance, last_activity, academic_year) VALUES ?`,
        [values]
      );
    }

    // Recalculate and update batch counts
    for (const batch of batchRows) {
      const [countRes] = await connection.query(
        `SELECT COUNT(*) as cnt FROM student_batch_assignments WHERE batch_id = ?`,
        [batch.id]
      );
      const cnt = countRes[0].cnt || 0;
      await connection.query(
        `UPDATE section_batches SET current_students_count = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`,
        [cnt, coordinatorId, batch.id]
      );
      // Recalculate average performance
      await recalculateBatchAverage(batch.id, connection);
    }

    await connection.commit();

    res.json({ success: true, message: 'Students assigned to batches successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error assigning students to batches:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to assign students', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Update batch size
 */
const updateBatchSize = async (req, res) => {
  try {
    const { batchId, newMaxSize } = req.body;
    const coordinatorId = req.user.id;

    if (!batchId || !newMaxSize) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID and new max size are required'
      });
    }

    // Check current student count
    const [batchInfo] = await db.query(
      `SELECT current_students_count, max_students FROM section_batches WHERE id = ?`,
      [batchId]
    );

    if (batchInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (newMaxSize < batchInfo[0].current_students_count) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce size below current student count (${batchInfo[0].current_students_count})`,
        requiresReallocation: true,
        currentCount: batchInfo[0].current_students_count,
        overflow: batchInfo[0].current_students_count - newMaxSize
      });
    }

    // Update batch size
    await db.query(
      `UPDATE section_batches 
       SET max_students = ?, updated_by = ?, updated_at = NOW()
       WHERE id = ?`,
      [newMaxSize, coordinatorId, batchId]
    );

    res.json({
      success: true,
      message: 'Batch size updated successfully'
    });

  } catch (error) {
    console.error('Error updating batch size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update batch size',
      error: error.message
    });
  }
};

/**
 * Get batch details with students
 */
const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    // Get batch info
    const [batchInfo] = await db.query(
      `SELECT 
        sb.*,
        COUNT(DISTINCT stc.section_activity_topic_id) as active_topics
      FROM section_batches sb
      LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id
      LEFT JOIN student_topic_completion stc ON sba.student_id = stc.student_id
      WHERE sb.id = ?
      GROUP BY sb.id`,
      [batchId]
    );

    if (batchInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Get students in batch
    const [students] = await db.query(
      `SELECT 
        s.id,
        s.roll as student_roll,
        s.name as student_name,
        sba.current_performance,
        sba.last_activity,
        COUNT(DISTINCT CASE WHEN stc.status = 'completed' THEN stc.id END) as topics_completed,
        COUNT(DISTINCT CASE WHEN shc.status = 'not_submitted' THEN shc.id END) as pending_homework,
        0 as penalty_count
      FROM students s
      JOIN student_batch_assignments sba ON s.id = sba.student_id
      LEFT JOIN student_topic_completion stc ON s.id = stc.student_id
      LEFT JOIN student_homework_calendar shc ON s.id = shc.student_id
      WHERE sba.batch_id = ?
      GROUP BY s.id
      ORDER BY s.roll`,
      [batchId]
    );

    res.json({
      success: true,
      batchInfo: batchInfo[0],
      students: students
    });

  } catch (error) {
    console.error('Error fetching batch details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch details',
      error: error.message
    });
  }
};

/**
 * Move student between batches
 */
const moveStudentBatch = async (req, res) => {
  try {
    const { studentRoll, fromBatchId, toBatchId, subjectId, reason } = req.body;
    const coordinatorId = req.user.id;

    if (!studentRoll || !fromBatchId || !toBatchId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Get student ID
    const [studentRows] = await db.query(
      `SELECT id FROM students WHERE roll = ?`,
      [studentRoll]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentId = studentRows[0].id;

    // Check target batch capacity
    const [targetBatch] = await db.query(
      `SELECT current_students_count, max_students FROM section_batches WHERE id = ?`,
      [toBatchId]
    );

    if (targetBatch.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Target batch not found'
      });
    }

    if (targetBatch[0].current_students_count >= targetBatch[0].max_students) {
      return res.status(400).json({
        success: false,
        message: 'Target batch is full'
      });
    }

    // Update assignment
    await db.query(
      `UPDATE student_batch_assignments 
       SET batch_id = ?, last_activity = NOW()
       WHERE student_id = ? AND batch_id = ?`,
      [toBatchId, studentId, fromBatchId]
    );

    // Update batch counts
    await db.query(
      `UPDATE section_batches 
       SET current_students_count = current_students_count - 1,
           updated_by = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [coordinatorId, fromBatchId]
    );

    await db.query(
      `UPDATE section_batches 
       SET current_students_count = current_students_count + 1,
           updated_by = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [coordinatorId, toBatchId]
    );

    // Recalculate batch averages
    await recalculateBatchAverage(fromBatchId);
    await recalculateBatchAverage(toBatchId);

    res.json({
      success: true,
      message: 'Student moved successfully'
    });

  } catch (error) {
    console.error('Error moving student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move student',
      error: error.message
    });
  }
};

/**
 * Get students in batch for overflow resolution
 */
const getBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    const [students] = await db.query(
      `SELECT 
        sm.id,
        s.roll,
        s.name,
        sba.current_performance,
        COUNT(DISTINCT CASE WHEN stc.status = 'completed' THEN stc.id END) as topics_completed
      FROM students s
      JOIN student_batch_assignments sba ON s.id = sba.student_id
      LEFT JOIN student_topic_completion stc ON s.id = stc.student_id
      JOIN student_mappings sm ON s.id = sm.student_id
      JOIN academic_years ay ON sm.academic_year = ay.id
      JOIN ay_status ays ON ay.id = ays.academic_year_id AND ays.is_active=1
      WHERE sba.batch_id = ? AND ays.is_active = 1
      GROUP BY s.id
      ORDER BY sba.current_performance ASC, topics_completed ASC`,
      [batchId]
    );

    res.json({
      success: true,
      students: students
    });

  } catch (error) {
    console.error('Error fetching batch students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

/**
 * Move multiple students
 */
const moveMultipleStudents = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { studentRolls, fromBatchId, toBatchId } = req.body;
    const coordinatorId = req.user.id;

    if (!studentRolls || !Array.isArray(studentRolls) || studentRolls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student rolls array is required'
      });
    }

    await connection.beginTransaction();

    // Get student IDs
    const [students] = await connection.query(
      `SELECT id, roll FROM students WHERE roll IN (?)`,
      [studentRolls]
    );

    if (students.length === 0) {
      throw new Error('No students found');
    }

    const studentIds = students.map(s => s.id);

    // Check target batch capacity
    const [targetBatch] = await connection.query(
      `SELECT current_students_count, max_students FROM section_batches WHERE id = ?`,
      [toBatchId]
    );

    const availableSpace = targetBatch[0].max_students - targetBatch[0].current_students_count;
    if (availableSpace < studentIds.length) {
      throw new Error(`Target batch only has space for ${availableSpace} students`);
    }

    // Move students
    await connection.query(
      `UPDATE student_batch_assignments 
       SET batch_id = ?, last_activity = NOW()
       WHERE student_id IN (?) AND batch_id = ?`,
      [toBatchId, studentIds, fromBatchId]
    );

    // Update batch counts
    await connection.query(
      `UPDATE section_batches 
       SET current_students_count = current_students_count - ?,
           updated_by = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [studentIds.length, coordinatorId, fromBatchId]
    );

    await connection.query(
      `UPDATE section_batches 
       SET current_students_count = current_students_count + ?,
           updated_by = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [studentIds.length, coordinatorId, toBatchId]
    );

    await connection.commit();

    // Recalculate averages
    await recalculateBatchAverage(fromBatchId);
    await recalculateBatchAverage(toBatchId);

    res.json({
      success: true,
      message: `Successfully moved ${studentIds.length} students`,
      movedCount: studentIds.length
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error moving students:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to move students',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Helper function to recalculate batch average
// If a `connection` (transaction) is provided, use it so the recalculation
// runs within the same transaction and avoids lock waits.
async function recalculateBatchAverage(batchId, connection = null) {
  if (connection) {
    const [result] = await connection.query(
      `SELECT AVG(current_performance) as avg_performance
       FROM student_batch_assignments
       WHERE batch_id = ? AND current_performance IS NOT NULL`,
      [batchId]
    );

    await connection.query(
      `UPDATE section_batches 
       SET avg_performance_score = ?
       WHERE id = ?`,
      [result[0].avg_performance || null, batchId]
    );
  } else {
    const [result] = await db.query(
      `SELECT AVG(current_performance) as avg_performance
       FROM student_batch_assignments
       WHERE batch_id = ? AND current_performance IS NOT NULL`,
      [batchId]
    );

    await db.query(
      `UPDATE section_batches 
       SET avg_performance_score = ?
       WHERE id = ?`,
      [result[0].avg_performance || null, batchId]
    );
  }
}

// ==================== TOPIC HIERARCHY ====================

/**
 * Get topic hierarchy for a subject-section-activity
 */
const getTopicHierarchy = async (req, res) => {
  try {
    const { sectionId, subjectId, contextActivityId } = req.body;

    if (!sectionId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID and Subject ID are required'
      });
    }

    // Get all topics
    const [topics] = await db.query(
      `SELECT 
        th.*
      FROM topic_hierarchy th
      WHERE th.context_activity_id = ?
      ORDER BY th.level, th.order_sequence`,
      [contextActivityId]
    );

    // Build hierarchy tree
    const topicMap = {};
    const rootTopics = [];

    topics.forEach(topic => {
      topicMap[topic.id] = { ...topic, children: [] };
    });

    topics.forEach(topic => {
      if (topic.parent_id === null) {
        rootTopics.push(topicMap[topic.id]);
      } else if (topicMap[topic.parent_id]) {
        topicMap[topic.parent_id].children.push(topicMap[topic.id]);
      }
    });

    res.json({
      success: true,
      topics: rootTopics,
      flatTopics: topics
    });

  } catch (error) {
    console.error('Error fetching topic hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic hierarchy',
      error: error.message
    });
  }
};

/**
 * Create topic
 */
const createTopic = async (req, res) => {
  try {
    const {
      contextActivityId,
      parentId,
      topicName,
      topicCode,
      level,
      orderSequence,
      hasAssessment,
      hasHomework,
      isBottomLevel,
      expectedCompletionDays,
      passPercentage
    } = req.body;

    if (!contextActivityId || !topicName || !topicCode) {
      return res.status(400).json({
        success: false,
        message: 'Context Activity ID, Topic Name, and Topic Code are required'
      });
    }

    // Check for duplicate topic code
    const [existing] = await db.query(
      `SELECT id FROM topic_hierarchy 
       WHERE context_activity_id = ? AND topic_code = ?`,
      [contextActivityId, topicCode]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic code already exists'
      });
    }

    // Calculate level if not provided
    let topicLevel = level || 1;
    if (parentId) {
      const [parent] = await db.query(
        `SELECT level FROM topic_hierarchy WHERE id = ?`,
        [parentId]
      );
      if (parent.length > 0) {
        topicLevel = parent[0].level + 1;
      }
    }

    // Insert topic
    const [result] = await db.query(
      `INSERT INTO topic_hierarchy 
       (parent_id, context_activity_id, level, topic_name, topic_code, 
        order_sequence, has_assessment, has_homework, is_bottom_level, 
        expected_completion_days, pass_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parentId || null,
        contextActivityId,
        topicLevel,
        topicName,
        topicCode,
        orderSequence || 1,
        hasAssessment ? 1 : 0,
        hasHomework ? 1 : 0,
        isBottomLevel ? 1 : 0,
        expectedCompletionDays || 7,
        passPercentage || 60
      ]
    );

    res.json({
      success: true,
      message: 'Topic created successfully',
      topicId: result.insertId
    });

  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create topic',
      error: error.message
    });
  }
};

/**
 * Update topic
 */
const updateTopic = async (req, res) => {
  try {
    const {
      topicId,
      topicName,
      topicCode,
      orderSequence,
      hasAssessment,
      hasHomework,
      isBottomLevel,
      expectedCompletionDays,
      passPercentage
    } = req.body;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID is required'
      });
    }

    // Check if topic exists
    const [existing] = await db.query(
      `SELECT id FROM topic_hierarchy WHERE id = ?`,
      [topicId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (topicName !== undefined) {
      updates.push('topic_name = ?');
      values.push(topicName);
    }
    if (topicCode !== undefined) {
      updates.push('topic_code = ?');
      values.push(topicCode);
    }
    if (orderSequence !== undefined) {
      updates.push('order_sequence = ?');
      values.push(orderSequence);
    }
    if (hasAssessment !== undefined) {
      updates.push('has_assessment = ?');
      values.push(hasAssessment ? 1 : 0);
    }
    if (hasHomework !== undefined) {
      updates.push('has_homework = ?');
      values.push(hasHomework ? 1 : 0);
    }
    if (isBottomLevel !== undefined) {
      updates.push('is_bottom_level = ?');
      values.push(isBottomLevel ? 1 : 0);
    }
    if (expectedCompletionDays !== undefined) {
      updates.push('expected_completion_days = ?');
      values.push(expectedCompletionDays);
    }
    if (passPercentage !== undefined) {
      updates.push('pass_percentage = ?');
      values.push(passPercentage);
    }

    updates.push('updated_at = NOW()');
    values.push(topicId);

    await db.query(
      `UPDATE topic_hierarchy SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Topic updated successfully'
    });

  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update topic',
      error: error.message
    });
  }
};

/**
 * Delete topic
 */
const deleteTopic = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID is required'
      });
    }

    await connection.beginTransaction();

    // Check if topic has children
    const [children] = await connection.query(
      `SELECT COUNT(*) as count FROM topic_hierarchy WHERE parent_id = ?`,
      [topicId]
    );

    if (children[0].count > 0) {
      throw new Error('Cannot delete topic with child topics');
    }

    // Delete related materials
    await connection.query(
      `DELETE FROM topic_materials WHERE topic_id = ?`,
      [topicId]
    );

    // Delete topic completion dates
    await connection.query(
      `DELETE FROM topic_completion_dates WHERE topic_id = ?`,
      [topicId]
    );

    // Delete topic
    await connection.query(
      `DELETE FROM topic_hierarchy WHERE id = ?`,
      [topicId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting topic:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete topic',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get activities for subject
 */
const getActivitiesForSubject = async (req, res) => {
  try {
    const { sectionId, subjectId } = req.body;

    if (!sectionId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID and Subject ID are required'
      });
    }

    const [activities] = await db.query(
      `SELECT DISTINCT
        ca.id as context_activity_id,
        a.id as activity_id,
        a.name as activity_name
      FROM context_activities ca
      JOIN activities a ON ca.activity_id = a.id
      WHERE ca.section_id = ? AND ca.subject_id = ? AND ca.parent_context_id IS NULL
      ORDER BY a.name`,
      [sectionId, subjectId]
    );

    res.json({
      success: true,
      activities: activities
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};

/**
 * Get sub-activities for activity
 */
const getSubActivitiesForActivity = async (req, res) => {
  try {
    const { sectionId, subjectId, contextActivityId } = req.body;

    if (!contextActivityId) {
      return res.status(400).json({
        success: false,
        message: 'Context Activity ID is required'
      });
    }

    const [subActivities] = await db.query(
      `SELECT DISTINCT
        ca.id as context_activity_id,
        a.id as activity_id,
        a.name as activity_name
      FROM context_activities ca
      JOIN activities a ON ca.activity_id = a.id
      WHERE ca.parent_context_id = ?
      ORDER BY a.name`,
      [contextActivityId]
    );

    res.json({
      success: true,
      subActivities: subActivities
    });

  } catch (error) {
    console.error('Error fetching sub-activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-activities',
      error: error.message
    });
  }
};

// ==================== MATERIALS ====================

/**
 * Get materials for topic
 */
const getTopicMaterials = async (req, res) => {
  try {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID is required'
      });
    }

    const [materials] = await db.query(
      `SELECT * FROM topic_materials 
       WHERE topic_id = ? AND is_active = 1
       ORDER BY id`,
      [topicId]
    );

    res.json({
      success: true,
      materials: materials
    });

  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
};

/**
 * Add material to topic
 */
const addTopicMaterial = async (req, res) => {
  try {
    const {
      topicId,
      materialType,
      fileName,
      fileUrl,
      estimatedDuration,
      difficultyLevel,
      instructions,
      hasAssessment
    } = req.body;

    if (!topicId || !materialType || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID, Material Type, and File URL are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO topic_materials 
       (topic_id, material_type, file_name, file_url, estimated_duration, 
        difficulty_level, instructions, is_active, has_assessment)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        topicId,
        materialType,
        fileName || null,
        fileUrl,
        estimatedDuration || 0,
        difficultyLevel || 'Medium',
        instructions || null,
        hasAssessment ? 1 : 0
      ]
    );

    res.json({
      success: true,
      message: 'Material added successfully',
      materialId: result.insertId
    });

  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add material',
      error: error.message
    });
  }
};

/**
 * Update material
 */
const updateTopicMaterial = async (req, res) => {
  try {
    const {
      materialId,
      fileName,
      fileUrl,
      estimatedDuration,
      difficultyLevel,
      instructions,
      hasAssessment
    } = req.body;

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }

    const updates = [];
    const values = [];

    if (fileName !== undefined) {
      updates.push('file_name = ?');
      values.push(fileName);
    }
    if (fileUrl !== undefined) {
      updates.push('file_url = ?');
      values.push(fileUrl);
    }
    if (estimatedDuration !== undefined) {
      updates.push('estimated_duration = ?');
      values.push(estimatedDuration);
    }
    if (difficultyLevel !== undefined) {
      updates.push('difficulty_level = ?');
      values.push(difficultyLevel);
    }
    if (instructions !== undefined) {
      updates.push('instructions = ?');
      values.push(instructions);
    }
    if (hasAssessment !== undefined) {
      updates.push('has_assessment = ?');
      values.push(hasAssessment ? 1 : 0);
    }

    updates.push('updated_at = NOW()');
    values.push(materialId);

    await db.query(
      `UPDATE topic_materials SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Material updated successfully'
    });

  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material',
      error: error.message
    });
  }
};

/**
 * Delete material
 */
const deleteTopicMaterial = async (req, res) => {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }

    // Soft delete
    await db.query(
      `UPDATE topic_materials SET is_active = 0, updated_at = NOW() WHERE id = ?`,
      [materialId]
    );

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error.message
    });
  }
};

/**
 * Set expected completion date for batch
 */
const setExpectedCompletionDate = async (req, res) => {
  try {
    const { topicId, batchId, expectedDate } = req.body;

    if (!topicId || !batchId || !expectedDate) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID, Batch ID, and Expected Date are required'
      });
    }

    // Check if record exists
    const [existing] = await db.query(
      `SELECT id FROM topic_completion_dates 
       WHERE topic_id = ? AND batch_id = ?`,
      [topicId, batchId]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE topic_completion_dates 
         SET expected_completion_date = ?
         WHERE id = ?`,
        [expectedDate, existing[0].id]
      );
    } else {
      // Insert new
      await db.query(
        `INSERT INTO topic_completion_dates 
         (topic_id, batch_id, expected_completion_date)
         VALUES (?, ?, ?)`,
        [topicId, batchId, expectedDate]
      );
    }

    res.json({
      success: true,
      message: 'Expected completion date set successfully'
    });

  } catch (error) {
    console.error('Error setting expected date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set expected date',
      error: error.message
    });
  }
};

// ==================== EXCEL UPLOAD ====================

/**
 * Generate batch template Excel
 */
const generateBatchTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Batch Data');

    // Define columns — use human readable dropdowns: Grade, Section, Subject, Batch, Student Roll
    worksheet.columns = [
      { header: 'Grade (choose from dropdown)', key: 'grade_name', width: 20 },
      { header: 'Section (choose from dropdown)', key: 'section_name', width: 20 },
      { header: 'Subject (choose from dropdown)', key: 'subject_name', width: 25 },
      { header: 'Batch Name (choose from dropdown)', key: 'batch_name', width: 30 },
      { header: 'Student Roll (choose from dropdown)', key: 'student_roll', width: 20 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4361EE' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Fetch existing batches for dropdown (format: [Grade -> Section -> Subject] BatchName)
    const [batchLookupRows] = await db.query(
      `SELECT sb.id as batch_id, sb.batch_name, sb.subject_section_id, sec.section_name as section_name, g.grade_name, sub.subject_name
       FROM section_batches sb
       JOIN subject_section_assignments ssa ON sb.subject_section_id = ssa.id
       JOIN sections sec ON ssa.section_id = sec.id
       JOIN grades g ON sec.grade_id = g.id
       JOIN subjects sub ON ssa.subject_id = sub.id
       WHERE sb.is_active = 1
       ORDER BY g.grade_name, sec.section_name, sub.subject_name, sb.batch_name`
    );

    // Create lookup sheets for dropdowns: Grades, Sections, Subjects, Batches, Students
    const gradesSheet = workbook.addWorksheet('Grades');
    gradesSheet.state = 'hidden';
    gradesSheet.getColumn(1).width = 30;
    gradesSheet.addRow(['Grade']);

    const sectionsSheet = workbook.addWorksheet('Sections');
    sectionsSheet.state = 'hidden';
    sectionsSheet.getColumn(1).width = 30;
    sectionsSheet.addRow(['Section']);

    const subjectsSheet = workbook.addWorksheet('Subjects');
    subjectsSheet.state = 'hidden';
    subjectsSheet.getColumn(1).width = 40;
    subjectsSheet.addRow(['Subject']);

    const batchesSheet = workbook.addWorksheet('Batches');
    batchesSheet.state = 'hidden';
    batchesSheet.getColumn(1).width = 60; // composite label
    batchesSheet.getColumn(2).width = 40; // batch name
    // Columns: CompositeLabel, Batch Name, subject_section_id, Section, Grade, Subject, BatchId
    batchesSheet.addRow(['Composite', 'Batch Name', 'subject_section_id', 'Section', 'Grade', 'Subject', 'BatchId']);

    // Populate Grades
    const [grades] = await db.query(`SELECT grade_name FROM grades ORDER BY id`);
    const gradeValues = [];
    for (const g of grades) {
      gradesSheet.addRow([g.grade_name]);
      gradeValues.push(g.grade_name);
    }

    // Populate Sections
    const [sections] = await db.query(`SELECT s.section_name, g.grade_name FROM sections s JOIN grades g ON s.grade_id = g.id ORDER BY g.grade_name, s.section_name`);
    const sectionValues = [];
    for (const s of sections) {
      sectionsSheet.addRow([s.section_name]);
      sectionValues.push(s.section_name);
    }

    // Populate Subjects
    const [subjects] = await db.query(`SELECT subject_name FROM subjects ORDER BY subject_name`);
    const subjectValues = [];
    for (const su of subjects) {
      subjectsSheet.addRow([su.subject_name]);
      subjectValues.push(su.subject_name);
    }

    // Populate Batches — write a composite label so same batch names in different sections are unique
    for (const r of batchLookupRows) {
      const composite = `${r.grade_name} / ${r.section_name} / ${r.subject_name} :: ${r.batch_name}`;
      batchesSheet.addRow([composite, r.batch_name, r.subject_section_id, r.section_name, r.grade_name, r.subject_name, r.batch_id]);
    }

    // Prepare a visible Students sheet to provide student roll dropdown
    const [studentRows] = await db.query(
      `SELECT s.roll, sm.id as mapping_id
       FROM students s
       JOIN student_mappings sm ON s.id = sm.student_id
       JOIN academic_years ay ON sm.academic_year = ay.id
       JOIN ay_status ays ON ays.academic_year_id = ay.id AND ays.is_active=1
       ORDER BY s.roll`
    );

    const studentsSheet = workbook.addWorksheet('Students');
    studentsSheet.getColumn(1).width = 30; // roll
    studentsSheet.addRow(['Student Roll']);
    const studentLookupValues = [];
    for (const s of studentRows) {
      studentsSheet.addRow([s.roll]);
      studentLookupValues.push(s.roll);
    }

    // Add a couple of sample rows in main sheet demonstrating one-student-per-row
    // Use the human-readable column keys and pick the first available lookup values if present
    worksheet.addRow({
      grade_name: gradeValues.length > 0 ? gradeValues[0] : 'Grade 1',
      section_name: sectionValues.length > 0 ? sectionValues[0] : 'A',
      subject_name: subjectValues.length > 0 ? subjectValues[0] : 'Maths',
      batch_name: batchLookupRows.length > 0 ? batchLookupRows[0].batch_name : 'Batch A',
      student_roll: studentLookupValues.length > 0 ? studentLookupValues[0] : 'ROLL001'
    });
    worksheet.addRow({
      grade_name: gradeValues.length > 1 ? gradeValues[1] : (gradeValues.length > 0 ? gradeValues[0] : 'Grade 1'),
      section_name: sectionValues.length > 1 ? sectionValues[1] : (sectionValues.length > 0 ? sectionValues[0] : 'A'),
      subject_name: subjectValues.length > 1 ? subjectValues[1] : (subjectValues.length > 0 ? subjectValues[0] : 'Maths'),
      batch_name: batchLookupRows.length > 1 ? batchLookupRows[1].batch_name : (batchLookupRows.length > 0 ? batchLookupRows[0].batch_name : 'Batch A'),
      student_roll: studentLookupValues.length > 1 ? studentLookupValues[1] : (studentLookupValues.length > 0 ? studentLookupValues[0] : 'ROLL002')
    });

    // Add data validation to Grade (col 1), Section (col 2), Subject (col3), Batch (col4), Student Roll (col5)
    if (gradeValues.length > 0) {
      const lastG = gradeValues.length + 1;
      worksheet.getColumn(1).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) return;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Grades'!$A$2:$A$${lastG}`] };
      });
    }

    if (sectionValues.length > 0) {
      const lastSec = sectionValues.length + 1;
      worksheet.getColumn(2).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) return;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Sections'!$A$2:$A$${lastSec}`] };
      });
    }

    if (subjectValues.length > 0) {
      const lastSu = subjectValues.length + 1;
      worksheet.getColumn(3).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) return;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Subjects'!$A$2:$A$${lastSu}`] };
      });
    }

    // Batches (use composite labels in column A of Batches sheet)
    const batchCount = batchLookupRows.length;
    if (batchCount > 0) {
      const lastB = batchCount + 1;
      worksheet.getColumn(4).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) return;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Batches'!$A$2:$A$${lastB}`] };
      });
    }

    // Students
    if (studentLookupValues.length > 0) {
      const lastS = studentLookupValues.length + 1;
      worksheet.getColumn(5).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) return;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Students'!$A$2:$A$${lastS}`] };
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=batch_template.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message
    });
  }
};

/**
 * Upload batches from Excel
 */
const uploadBatchesFromExcel = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const coordinatorId = req.user.id;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const rows = [];
    const errors = [];

    await connection.beginTransaction();

    // Parse rows: each row represents one student for a batch (one student per row)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowData = {
        gradeName: row.getCell(1).value ? String(row.getCell(1).value).trim() : null,
        sectionName: row.getCell(2).value ? String(row.getCell(2).value).trim() : null,
        subjectName: row.getCell(3).value ? String(row.getCell(3).value).trim() : null,
        batchName: row.getCell(4).value ? String(row.getCell(4).value).trim() : null,
        studentRoll: row.getCell(5).value ? String(row.getCell(5).value).trim() : null
      };

      if (!rowData.gradeName || !rowData.sectionName || !rowData.subjectName || !rowData.batchName || !rowData.studentRoll) {
        errors.push(`Row ${rowNumber}: Missing required fields (grade/section/subject/batch/studentRoll)`);
        return;
      }

      rows.push(rowData);
    });

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    // Group rows by batch key: gradeName|sectionName|subjectName|batchName
    const groups = new Map();
    for (const r of rows) {
      const key = `${r.gradeName}||${r.sectionName}||${r.subjectName}||${r.batchName}`;
      if (!groups.has(key)) {
        groups.set(key, {
          gradeName: r.gradeName,
          sectionName: r.sectionName,
          subjectName: r.subjectName,
          batchName: r.batchName,
          studentRolls: []
        });
      }
      if (r.studentRoll) groups.get(key).studentRolls.push(r.studentRoll);
    }

    let createdCount = 0;
    let assignedStudentCount = 0;

    for (const [key, group] of groups) {
      // Support composite batch labels produced by the template:
      // "Grade / Section / Subject :: Batch Name". If a composite label
      // is provided and matches our map, prefer that resolution because it
      // uniquely identifies the batch even when batch names repeat across sections.
      let sectionId = null;
      let subjectId = null;
      let subjectSectionId = null;
      let batchId = null;

      if (group.batchName && compositeBatchMap[group.batchName]) {
        const mapped = compositeBatchMap[group.batchName];
        batchId = mapped.batch_id;
        subjectSectionId = mapped.subject_section_id;

        // derive section and subject from the subject_section_assignments row
        const [ssaInfo] = await connection.query(
          `SELECT section_id, subject_id FROM subject_section_assignments WHERE id = ? LIMIT 1`,
          [subjectSectionId]
        );
        if (ssaInfo.length === 0) {
          errors.push(`Batch mapping found but subject-section record missing for batch "${group.batchName}"`);
          continue;
        }
        sectionId = ssaInfo[0].section_id;
        subjectId = ssaInfo[0].subject_id;
      } else {
        // Resolve section_id from sectionName + gradeName
        const [sectionRows] = await connection.query(
          `SELECT s.id FROM sections s JOIN grades g ON s.grade_id = g.id WHERE s.section_name = ? AND g.grade_name = ? LIMIT 1`,
          [group.sectionName, group.gradeName]
        );
        if (sectionRows.length === 0) {
          errors.push(`No section found matching Grade "${group.gradeName}" and Section "${group.sectionName}"`);
          continue;
        }
        sectionId = sectionRows[0].id;

        // Resolve subject id
        const [subjectRows] = await connection.query(
          `SELECT id FROM subjects WHERE subject_name = ? LIMIT 1`,
          [group.subjectName]
        );
        if (subjectRows.length === 0) {
          errors.push(`No subject found with name "${group.subjectName}"`);
          continue;
        }
        subjectId = subjectRows[0].id;

        // Get subject_section_assignments id
        const [ssaRows] = await connection.query(
          `SELECT id FROM subject_section_assignments 
           WHERE section_id = ? AND subject_id = ? AND is_active = 1`,
          [sectionId, subjectId]
        );

        if (ssaRows.length === 0) {
          errors.push(`No active assignment for Grade "${group.gradeName}" Section "${group.sectionName}", Subject "${group.subjectName}"`);
          continue;
        }

        subjectSectionId = ssaRows[0].id;

        // Check if batch already exists (use existing if present)
        const [existing] = await connection.query(
          `SELECT id FROM section_batches WHERE subject_section_id = ? AND batch_name = ? AND is_active = 1`,
          [subjectSectionId, group.batchName]
        );

        if (existing.length > 0) {
          batchId = existing[0].id;
        } else {
          // Do NOT create batches during upload. Report and skip.
          errors.push(`No existing batch named "${group.batchName}" for Grade "${group.gradeName}" Section "${group.sectionName}" Subject "${group.subjectName}"`);
          continue;
        }
      }

      // Resolve studentRolls to mapping IDs using student rolls only
      const values = (group.studentRolls || []).map(v => String(v).trim()).filter(v => v !== '');
      const rolls = values; // treat all values as rolls

      let mappedIds = [];
      const rollToId = {};
      if (rolls.length > 0) {
        const [rowsFound] = await connection.query(
          `SELECT sm.id as mapping_id, s.roll FROM students s JOIN student_mappings sm ON s.id = sm.student_id JOIN academic_years ay ON sm.academic_year = ay.id JOIN ay_status ays ON ays.academic_year_id = ay.id AND ays.is_active=1 WHERE s.roll IN (?)`,
          [rolls]
        );
        mappedIds = (rowsFound || []).map(r => r.mapping_id);
        for (const r of (rowsFound || [])) {
          rollToId[r.roll] = r.mapping_id;
        }
      }

      // Report rolls not found
      const foundRolls = Object.keys(rollToId);
      const missingRolls = rolls.filter(r => !foundRolls.includes(r));
      if (missingRolls.length > 0) {
        errors.push(`Section ${group.sectionId} Subject ${group.subjectId} - student rolls not found: ${missingRolls.join(',')}`);
      }

      // Combine and dedupe mapping IDs
      const finalIds = Array.from(new Set([...(mappedIds || [])]));

      if (finalIds.length > 0) {
        // Check if any of these students are already assigned to a batch
        // for the same subject_section (to prevent duplicate assignments)
        const [alreadyAssignedRows] = await connection.query(
          `SELECT sba.student_id FROM student_batch_assignments sba
           JOIN section_batches sb ON sba.batch_id = sb.id
           WHERE sba.student_id IN (?) AND sb.subject_section_id = ?`,
          [finalIds, subjectSectionId]
        );

        const alreadyAssignedIds = (alreadyAssignedRows || []).map(r => r.student_id);

        // Map alreadyAssignedIds to rolls for clearer messages
        const idToRoll = {};
        for (const roll of Object.keys(rollToId)) {
          idToRoll[rollToId[roll]] = roll;
        }

        if (alreadyAssignedIds.length > 0) {
          const assignedRolls = alreadyAssignedIds.map(id => idToRoll[id] || id);
          errors.push(`Section ${group.sectionId} Subject ${group.subjectId} - students already assigned: ${assignedRolls.join(',')}`);
        }

        // Filter out already assigned students
        const idsToInsert = finalIds.filter(id => !alreadyAssignedIds.includes(id));

        if (idsToInsert.length > 0) {
          // Check batch capacity before inserting (do NOT update section_batches table)
          const [batchInfoRows] = await connection.query(
            `SELECT id, max_students, current_students_count FROM section_batches WHERE id = ?`,
            [batchId]
          );
          const batchInfo = batchInfoRows[0];
          const available = (batchInfo.max_students || 0) - (batchInfo.current_students_count || 0);

          if (available <= 0) {
            const skippedRolls = idsToInsert.map(id => idToRoll[id] || id);
            errors.push(`Batch ${group.batchName} is full (max ${batchInfo.max_students}). Skipped students: ${skippedRolls.join(',')}`);
          } else {
            const idsAllowed = idsToInsert.slice(0, available);
            const idsSkipped = idsToInsert.slice(available);

            const assignments = idsAllowed.map(id => [id, batchId, null, null]);
            await connection.query(
              `INSERT INTO student_batch_assignments 
               (student_id, batch_id, current_performance, last_activity)
               VALUES ?`,
              [assignments]
            );

            if (idsSkipped.length > 0) {
              const skippedRolls = idsSkipped.map(id => idToRoll[id] || id);
              errors.push(`Batch ${group.batchName} exceeded capacity; skipped students: ${skippedRolls.join(',')}`);
            }

            assignedStudentCount += idsAllowed.length;
          }
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Batches uploaded successfully',
      batchesCreated: createdCount,
      studentsAssigned: assignedStudentCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error uploading batches:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload batches',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Generate materials template Excel
 */
const generateMaterialsTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Topic Materials');

    worksheet.columns = [
      { header: 'Topic ID', key: 'topic_id', width: 15 },
      { header: 'Material Type', key: 'material_type', width: 15 },
      { header: 'File Name', key: 'file_name', width: 30 },
      { header: 'File URL', key: 'file_url', width: 50 },
      { header: 'Estimated Duration (minutes)', key: 'estimated_duration', width: 25 },
      { header: 'Difficulty Level', key: 'difficulty_level', width: 20 },
      { header: 'Instructions', key: 'instructions', width: 40 },
      { header: 'Has Assessment', key: 'has_assessment', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4361EE' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add sample
    worksheet.addRow({
      topic_id: 1,
      material_type: 'Video',
      file_name: 'Introduction to Topic',
      file_url: 'https://example.com/video.mp4',
      estimated_duration: 30,
      difficulty_level: 'Medium',
      instructions: 'Watch the video and take notes',
      has_assessment: 'Yes'
    });

    // Add notes
    worksheet.addRow([]);
    worksheet.addRow(['Notes:']);
    worksheet.addRow(['Material Type: PDF, Video, Image, Text']);
    worksheet.addRow(['Difficulty Level: Easy, Medium, Hard']);
    worksheet.addRow(['Has Assessment: Yes or No']);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=materials_template.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message
    });
  }
};

/**
 * Upload materials from Excel
 */
const uploadMaterialsFromExcel = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const materials = [];
    const errors = [];

    await connection.beginTransaction();

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const materialData = {
        topicId: row.getCell(1).value,
        materialType: row.getCell(2).value,
        fileName: row.getCell(3).value,
        fileUrl: row.getCell(4).value,
        estimatedDuration: row.getCell(5).value || 0,
        difficultyLevel: row.getCell(6).value || 'Medium',
        instructions: row.getCell(7).value,
        hasAssessment: String(row.getCell(8).value).toLowerCase() === 'yes' ? 1 : 0
      };

      if (!materialData.topicId || !materialData.materialType || !materialData.fileUrl) {
        errors.push(`Row ${rowNumber}: Missing required fields`);
        return;
      }

      materials.push(materialData);
    });

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    // Insert materials
    const values = materials.map(m => [
      m.topicId,
      m.materialType,
      m.fileName,
      m.fileUrl,
      m.estimatedDuration,
      m.difficultyLevel,
      m.instructions,
      1, // is_active
      m.hasAssessment
    ]);

    await connection.query(
      `INSERT INTO topic_materials 
       (topic_id, material_type, file_name, file_url, estimated_duration, 
        difficulty_level, instructions, is_active, has_assessment)
       VALUES ?`,
      [values]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Materials uploaded successfully',
      materialsCreated: materials.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error uploading materials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload materials',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get grade subjects
 */
const getGradeSubjects = async (req, res) => {
  try {
    const { gradeId } = req.body;

    if (!gradeId) {
      return res.status(400).json({
        success: false,
        message: 'Grade ID is required'
      });
    }

    const [subjects] = await db.query(
      `SELECT DISTINCT
        s.id as subject_id,
        s.subject_name
      FROM subjects s
      JOIN subject_section_assignments ssa ON s.id = ssa.subject_id
      JOIN sections sec ON ssa.section_id = sec.id
      WHERE sec.grade_id = ? AND ssa.is_active = 1 AND sec.is_active = 1
      ORDER BY s.subject_name`,
      [gradeId]
    );

    res.json({
      success: true,
      gradeSubjects: subjects
    });

  } catch (error) {
    console.error('Error fetching grade subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

module.exports = {
  // Batch management
  getBatches,
  getBatchAnalytics,
  initializeBatches,
  configureBatches,
  reallocateBatches,
  updateBatchSize,
  getBatchDetails,
  moveStudentBatch,
  getBatchStudents,
  moveMultipleStudents,
  assignStudents,
  
  // Topic hierarchy
  getTopicHierarchy,
  createTopic,
  updateTopic,
  deleteTopic,
  getActivitiesForSubject,
  getSubActivitiesForActivity,
  
  // Materials
  getTopicMaterials,
  addTopicMaterial,
  updateTopicMaterial,
  deleteTopicMaterial,
  setExpectedCompletionDate,
  
  // Excel upload
  generateBatchTemplate,
  uploadBatchesFromExcel,
  generateMaterialsTemplate,
  uploadMaterialsFromExcel,
  
  // Utilities
  getGradeSubjects
};
