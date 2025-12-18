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

    // Active academic year
    const activeAcademicYearId = req.activeAcademicYearId;

    // Get all batches with statistics (size from section_batch_size per active AY)
    const [batches] = await db.query(
      `SELECT 
        sb.id,
        sb.batch_name,
        sb.batch_level,
        COALESCE(sbs.max_students, 0) as max_students,
        COALESCE(sbs.current_students_count, 0) as current_students_count,
        sbs.avg_performance_score,
        sb.is_active,
        COUNT(DISTINCT stc.section_activity_topic_id) as active_topics,
        ROUND(CASE WHEN COALESCE(sbs.max_students,0) > 0 THEN (COALESCE(sbs.current_students_count,0) / sbs.max_students) * 100 ELSE 0 END, 0) as capacity_utilization,
        CASE
          WHEN sbs.avg_performance_score >= 80 THEN 'A'
          WHEN sbs.avg_performance_score >= 60 THEN 'B'
          WHEN sbs.avg_performance_score >= 40 THEN 'C'
          ELSE 'D'
        END as performance_grade
      FROM section_batches sb
      LEFT JOIN section_batch_size sbs ON sbs.batch_id = sb.id ${activeAcademicYearId ? 'AND sbs.academic_year = ?' : ''}
      LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id
      LEFT JOIN student_topic_completion stc ON sba.student_id = stc.student_id
      WHERE sb.subject_section_id = ?
      GROUP BY sb.id, sb.batch_name, sb.batch_level, sbs.max_students, sbs.current_students_count, sbs.avg_performance_score, sb.is_active
      ORDER BY sb.batch_level, sb.batch_name`,
      activeAcademicYearId ? [activeAcademicYearId, subjectSectionId] : [subjectSectionId]
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


    const activeAcademicYearId2 = req.activeAcademicYearId;

    // Get comprehensive analytics (size from section_batch_size per active AY)
    const [analytics] = await db.query(
      `SELECT 
        COUNT(DISTINCT sb.id) as total_batches,
        COALESCE(SUM(sbs.current_students_count), 0) as total_students,
        AVG(sbs.avg_performance_score) as overall_avg_performance,
        SUM(CASE WHEN COALESCE(sbs.max_students,0) > 0 AND COALESCE(sbs.current_students_count,0) >= sbs.max_students THEN 1 ELSE 0 END) as full_batches,
        SUM(CASE WHEN COALESCE(sbs.current_students_count,0) < COALESCE(sbs.max_students,0) THEN 1 ELSE 0 END) as available_batches,
        MAX(sb.batch_level) as max_batch_level
      FROM section_batches sb
      LEFT JOIN section_batch_size sbs ON sbs.batch_id = sb.id ${activeAcademicYearId2 ? 'AND sbs.academic_year = ?' : ''}
      WHERE sb.subject_section_id = ? AND sb.is_active = 1`,
      activeAcademicYearId2 ? [activeAcademicYearId2, subjectSectionId] : [subjectSectionId]
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

    // Active academic year
    const activeAcademicYearId = req.activeAcademicYearId;

    if (!activeAcademicYearId) {
      throw new Error('No active academic year found');
    }

    // Get all students in the section
    const [students] = await connection.query(
      `SELECT sm.id, s.roll 
       FROM students s
       JOIN student_mappings sm ON s.id = sm.student_id
       JOIN academic_years ay ON sm.academic_year = ay.id
       JOIN ay_status ays ON ays.academic_year_id = ay.id AND ays.is_active=1
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
           (student_id, batch_id, current_performance, last_activity, academic_year)
           VALUES ?`,
          [studentAssignments.map(sa => [sa[0], sa[1], sa[2], sa[3], activeAcademicYearId])]
        );

        // Update student counts (per active academic year)
        for (const batch of createdBatches) {
          const count = studentAssignments.filter(sa => sa[1] === batch.id).length;
          await connection.query(
            `UPDATE section_batch_size SET current_students_count = ?, updated_by = ?, updated_at = NOW() WHERE batch_id = ? AND academic_year = ?`,
            [count, coordinatorId, batch.id, activeAcademicYearId]
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

    // Get batch information (no size fields here; sizes live in section_batch_size)
    const [batches] = await connection.query(
      `SELECT id, batch_name, batch_level 
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

    const activeAcademicYearId2 = req.activeAcademicYearId;

    if (!activeAcademicYearId2) {
      throw new Error('No active academic year found');
    }

    // Insert new assignments with academic year
    await connection.query(
      `INSERT INTO student_batch_assignments 
       (student_id, batch_id, current_performance, last_activity, academic_year)
       VALUES ?`,
      [newAssignments.map(sa => [sa[0], sa[1], sa[2], sa[3], activeAcademicYearId2])]
    );

    // Update batch statistics (avg in section_batches; counts in section_batch_size for active AY)
    for (const batch of batches) {
      const batchStudents = newAssignments.filter(sa => sa[1] === batch.id);
      const avgPerformance = batchStudents.reduce((sum, sa) => sum + (sa[2] || 0), 0) / (batchStudents.length || 1);

      await connection.query(
        `UPDATE section_batches 
         SET avg_performance_score = ?, updated_by = ?, updated_at = NOW()
         WHERE id = ?`,
        [avgPerformance || null, coordinatorId, batch.id]
      );

      await connection.query(
        `UPDATE section_batch_size 
         SET current_students_count = ?, updated_by = ?, updated_at = NOW()
         WHERE batch_id = ? AND academic_year = ?`,
        [batchStudents.length, coordinatorId, batch.id, activeAcademicYearId2]
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

    // Determine how many new batches to add (append mode)
    const [existingBatches] = await connection.query(
      `SELECT COUNT(*) as count FROM section_batches WHERE subject_section_id = ?`,
      [subjectSectionId]
    );

    const currentCount = existingBatches[0].count || 0;
    const desiredTotal = parseInt(maxBatches, 10);

    if (Number.isNaN(desiredTotal) || desiredTotal < 1) {
      throw new Error('maxBatches must be a positive number');
    }

    if (desiredTotal <= currentCount) {
      await connection.commit();
      return res.json({
        success: true,
        message: `No new batches added. Existing: ${currentCount}, requested: ${desiredTotal}.`,
        batchesCreated: 0
      });
    }

    const startIndex = currentCount + 1;
    const inserts = [];
    const limit = parseInt(batchSizeLimit, 10) || 30;
    for (let i = startIndex; i <= desiredTotal; i++) {
      inserts.push([
        subjectSectionId,
        `Batch ${i}`,
        i,
        1,
        coordinatorId
      ]);
    }

    if (inserts.length > 0) {
      const [insertResult] = await connection.query(
        `INSERT INTO section_batches (subject_section_id, batch_name, batch_level, is_active, updated_by) VALUES ?`,
        [inserts]
      );

      const activeAcademicYearId = req.activeAcademicYearId;
      if (activeAcademicYearId) {
        const firstId = insertResult.insertId;
        const createdIds = [];
        for (let idx = 0; idx < inserts.length; idx++) {
          createdIds.push(firstId + idx);
        }

        const sbsValues = createdIds.map(id => [id, activeAcademicYearId, limit, 0, coordinatorId]);
        if (sbsValues.length > 0) {
          await connection.query(
            `INSERT INTO section_batch_size (batch_id, academic_year, max_students, current_students_count, updated_by) VALUES ?`,
            [sbsValues]
          );
        }
      }
    }

    await connection.commit();

    res.json({ success: true, message: `Added ${inserts.length} new batch(es). Total now: ${desiredTotal}.`, batchesCreated: inserts.length });
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
      `SELECT id, subject_section_id FROM section_batches WHERE id IN (?)`,
      [batchIds]
    );
    if (batchRows.length !== batchIds.length) {
      throw new Error('One or more batches not found');
    }

    // Remove any existing assignments for these students (in their current batch)
    // if (studentIds.length > 0) {
    //   await connection.query(
    //     `DELETE sba FROM student_batch_assignments sba WHERE sba.student_id IN (?)`,
    //     [studentIds]
    //   );
    // }
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

    // Recalculate and update batch counts (per active academic year)
    for (const batch of batchRows) {
      const [countRes] = await connection.query(
        `SELECT COUNT(*) as cnt FROM student_batch_assignments WHERE batch_id = ? AND academic_year = ?`,
        [batch.id, activeAcademicYearRows[0].id]
      );
      const cnt = countRes[0].cnt || 0;
      await connection.query(
        `UPDATE section_batch_size 
         SET current_students_count = ?, updated_by = ?, updated_at = NOW()
         WHERE batch_id = ? AND academic_year = ?`,
        [cnt, coordinatorId, batch.id, activeAcademicYearRows[0].id]
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

    // Active academic year
    const activeAcademicYearId = req.activeAcademicYearId;

    if (!activeAcademicYearId) {
      return res.status(400).json({ success: false, message: 'No active academic year found' });
    }

    // Check current student count (per active academic year)
    const [batchInfo] = await db.query(
      `SELECT current_students_count, max_students FROM section_batch_size WHERE batch_id = ? AND academic_year = ?`,
      [batchId, activeAcademicYearId]
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

    // Update batch size (per active academic year)
    await db.query(
      `UPDATE section_batch_size 
       SET max_students = ?, updated_by = ?, updated_at = NOW()
       WHERE batch_id = ? AND academic_year = ?`,
      [newMaxSize, coordinatorId, batchId, activeAcademicYearId]
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

    // Active academic year
    const activeAcademicYearId = req.activeAcademicYearId;

    if (!activeAcademicYearId) {
      return res.status(400).json({ success: false, message: 'No active academic year found' });
    }

    // Check target batch capacity (per active academic year)
    const [targetBatch] = await db.query(
      `SELECT current_students_count, max_students FROM section_batch_size WHERE batch_id = ? AND academic_year = ?`,
      [toBatchId, activeAcademicYearId]
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

    // Update batch counts (per active academic year)
    await db.query(
      `UPDATE section_batch_size 
       SET current_students_count = current_students_count - 1,
           updated_by = ?,
           updated_at = NOW()
       WHERE batch_id = ? AND academic_year = ?`,
      [coordinatorId, fromBatchId, activeAcademicYearId]
    );

    await db.query(
      `UPDATE section_batch_size 
       SET current_students_count = current_students_count + 1,
           updated_by = ?,
           updated_at = NOW()
       WHERE batch_id = ? AND academic_year = ?`,
      [coordinatorId, toBatchId, activeAcademicYearId]
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

    const activeAcademicYearId = req.activeAcademicYearId;
    if (!activeAcademicYearId) {
      throw new Error('No active academic year found');
    }

    // Check target batch capacity (per active academic year)
    const [targetBatch] = await connection.query(
      `SELECT current_students_count, max_students FROM section_batch_size WHERE batch_id = ? AND academic_year = ?`,
      [toBatchId, activeAcademicYearId]
    );

    if (targetBatch.length === 0) {
      throw new Error('Target batch size not configured for active academic year');
    }

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

    // Update batch counts (per active academic year)
    await connection.query(
      `UPDATE section_batch_size 
       SET current_students_count = current_students_count - ?,
           updated_by = ?,
           updated_at = NOW()
       WHERE batch_id = ? AND academic_year = ?`,
      [studentIds.length, coordinatorId, fromBatchId, activeAcademicYearId]
    );

    await connection.query(
      `UPDATE section_batch_size 
       SET current_students_count = current_students_count + ?,
           updated_by = ?,
           updated_at = NOW()
       WHERE batch_id = ? AND academic_year = ?`,
      [studentIds.length, coordinatorId, toBatchId, activeAcademicYearId]
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
      `UPDATE section_batch_size
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
      `UPDATE section_batch_size 
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
      topicMap[topic.id] = { ...topic, children: [], batchDates: [] };
    });

    topics.forEach(topic => {
      if (topic.parent_id === null) {
        rootTopics.push(topicMap[topic.id]);
      } else if (topicMap[topic.parent_id]) {
        topicMap[topic.parent_id].children.push(topicMap[topic.id]);
      }
    });

    // Fetch batch-wise expected completion dates for these topics (for active academic year)
    const activeAcademicYearId = req.activeAcademicYearId;

    let batchDatesRows = [];
    if (topics.length > 0 && activeAcademicYearId) {
      const topicIds = topics.map(t => t.id);
      const [rows] = await db.query(
        `SELECT topic_id, batch_id, expected_completion_date 
         FROM topic_completion_dates 
         WHERE topic_id IN (?) AND academic_year = ?`,
        [topicIds, activeAcademicYearId]
      );
      batchDatesRows = rows || [];

      // console.log('Batch Dates Rows:', batchDatesRows);

      // attach to topic nodes
      batchDatesRows.forEach(r => {
        if (topicMap[r.topic_id]) {
          topicMap[r.topic_id].batchDates.push({ batch_id: r.batch_id, expected_completion_date: r.expected_completion_date });
        }
      });
    }
    // console.log(batchDatesRows);

    res.json({
      success: true,
      topics: rootTopics,
      flatTopics: topics,
      batchDates: batchDatesRows
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

    // Updated for new schema: no is_active column, use order_number for ordering
    const [materials] = await db.query(
      `SELECT id, topic_id, material_type, material_title, material_url, estimated_duration,
              difficulty_level, instructions, has_assessment, order_number, created_at, updated_at
       FROM topic_materials 
       WHERE topic_id = ?
       ORDER BY order_number, id`,
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
      topic_id,
      material_type,
      material_title,
      material_url,
      estimated_duration,
      difficulty_level,
      instructions,
      has_assessment,
      order_number
    } = req.body;

    if (!topic_id || !material_type || !material_url) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID, Material Type, and Material URL are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO topic_materials 
       (topic_id, material_type, material_title, material_url, estimated_duration, 
        difficulty_level, instructions, has_assessment, order_number, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        topic_id,
        material_type,
        material_title || 'Untitled Material',
        material_url,
        estimated_duration || 30,
        difficulty_level || 'Medium',
        instructions || null,
        has_assessment ? 1 : 0,
        order_number || 1
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
      id,
      material_title,
      material_url,
      estimated_duration,
      difficulty_level,
      instructions,
      has_assessment,
      order_number
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }

    const updates = [];
    const values = [];

    if (material_title !== undefined) {
      updates.push('material_title = ?');
      values.push(material_title);
    }
    if (material_url !== undefined) {
      updates.push('material_url = ?');
      values.push(material_url);
    }
    if (estimated_duration !== undefined) {
      updates.push('estimated_duration = ?');
      values.push(estimated_duration);
    }
    if (difficulty_level !== undefined) {
      updates.push('difficulty_level = ?');
      values.push(difficulty_level);
    }
    if (instructions !== undefined) {
      updates.push('instructions = ?');
      values.push(instructions);
    }
    if (has_assessment !== undefined) {
      updates.push('has_assessment = ?');
      values.push(has_assessment ? 1 : 0);
    }
    if (order_number !== undefined) {
      updates.push('order_number = ?');
      values.push(order_number);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

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
    const { materialId, id } = req.body;
    const materialIdToDelete = materialId || id;

    if (!materialIdToDelete) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }

    // Hard delete since there's no is_active in new schema
    await db.query(
      `DELETE FROM topic_materials WHERE id = ?`,
      [materialIdToDelete]
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
    const activeAcademicYearId = req.activeAcademicYearId;

    if (!topicId || !batchId || !expectedDate) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID, Batch ID, and Expected Date are required'
      });
    }


    // Check if record exists
    const [existing] = await db.query(
      `SELECT id FROM topic_completion_dates 
       WHERE topic_id = ? AND batch_id = ? AND academic_year = ?`,
      [topicId, batchId, activeAcademicYearId]
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
         (topic_id, batch_id, expected_completion_date, academic_year)
         VALUES (?, ?, ?, ?)`,
        [topicId, batchId, expectedDate, activeAcademicYearId]
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

/**
 * Get batch-wise expected completion dates for a topic
 */
const getBatchExpectedDates = async (req, res) => {
  try {
    const { topicId } = req.body;
    const activeAcademicYearId = req.activeAcademicYearId;
    if (!topicId) {
      return res.status(400).json({ success: false, message: 'topicId is required' });
    }
    const [rows] = await db.query(
      `SELECT batch_id, expected_completion_date FROM topic_completion_dates WHERE topic_id = ? AND academic_year = ? `,
      [topicId, activeAcademicYearId]
    );

    res.json({ success: true, batchDates: rows });
  } catch (error) {
    console.error('Error fetching batch expected dates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch batch dates', error: error.message });
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
  console.log("hi");
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
        errors.push(`Grade "${group.gradeName}" Section "${group.sectionName}" Subject "${group.subjectName}" - student rolls not found: ${missingRolls.join(',')}`);
      }

      // Combine and dedupe mapping IDs
      const finalIds = Array.from(new Set([...(mappedIds || [])]));

      const activeAcademicYearId = req.activeAcademicYearId;

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
          errors.push(`Grade "${group.gradeName}" Section "${group.sectionName}" Subject "${group.subjectName}" - students already assigned: ${assignedRolls.join(',')}`);
        }

        // Filter out already assigned students
        const idsToInsert = finalIds.filter(id => !alreadyAssignedIds.includes(id));

        if (idsToInsert.length > 0) {
          // Check batch capacity before inserting (per active academic year)
          const [batchInfoRows] = await connection.query(
            `SELECT max_students, current_students_count FROM section_batch_size WHERE batch_id = ? AND academic_year = ?`,
            [batchId, activeAcademicYearId]
          );
          const batchInfo = batchInfoRows[0] || { max_students: 0, current_students_count: 0 };
          const available = (batchInfo.max_students || 0) - (batchInfo.current_students_count || 0);

          if (available <= 0) {
            const skippedRolls = idsToInsert.map(id => idToRoll[id] || id);
            errors.push(`Batch ${group.batchName} is full (max ${batchInfo.max_students}). Skipped students: ${skippedRolls.join(',')}`);
          } else {
            const idsAllowed = idsToInsert.slice(0, available);
            const idsSkipped = idsToInsert.slice(available);


            const assignments = idsAllowed.map(id => [id, batchId, null, null, activeAcademicYearId]);
            await connection.query(
              `INSERT INTO student_batch_assignments 
               (student_id, batch_id, current_performance, last_activity, academic_year)
               VALUES ?`,
              [assignments]
            );

            // Update current count in section_batch_size (incremental)
            await connection.query(
              `UPDATE section_batch_size SET current_students_count = current_students_count + ?, updated_at = NOW() WHERE batch_id = ? AND academic_year = ?`,
              [idsAllowed.length, batchId, activeAcademicYearId]
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
 * Get grade subjects
 */
const getSectionSubjects = async (req, res) => {
  try {
    const { sectionId } = req.body;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID is required'
      });
    }

    const [subjects] = await db.query(
      `SELECT DISTINCT
        s.id as subject_id,
        s.subject_name
      FROM subjects s
      JOIN subject_section_assignments ssa ON s.id = ssa.subject_id
      JOIN sections sec ON ssa.section_id = sec.id
      WHERE  sec.id = ? AND ssa.is_active = 1 AND sec.is_active = 1
      ORDER BY s.subject_name`,
      [sectionId]
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

/**
      * Generate Academic Year bulk template with separate sheets per section & data type.
      * For each section create: section<name>-topic, section<name>-material, section<name>-batch date.
      * Hidden lookup sheets provide dependent dropdowns for Subject, ActivityRoot, ActivityPath, Batches.
      */
const generateAcademicYearTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const gradeId = req.query.gradeId || req.body?.gradeId || null;

    const [gradeNameRows] = await db.query(
      `SELECT grade_name FROM grades WHERE id = ? LIMIT 1`,
      [gradeId]
    );
    const gradeName = gradeNameRows.length > 0 ? gradeNameRows[0].grade_name : null;

    // Hidden global lookup sheets
    const materialTypesSheet = workbook.addWorksheet('MaterialTypes');
    materialTypesSheet.state = 'hidden';
    materialTypesSheet.addRow(['MaterialType']);
    ['PDF', 'Video', 'Image', 'Text', 'Link'].forEach(v => materialTypesSheet.addRow([v]));

    const difficultySheet = workbook.addWorksheet('DifficultyLevels');
    difficultySheet.state = 'hidden';
    difficultySheet.addRow(['Difficulty']);
    ['Easy', 'Medium', 'Hard'].forEach(v => difficultySheet.addRow([v]));

    const sectionMeta = workbook.addWorksheet('SectionMeta');
    sectionMeta.state = 'hidden';
    sectionMeta.addRow(['SheetName', 'SectionId', 'SheetType']);

    const [sections] = await db.query(
      gradeId
        ? `SELECT id, section_name FROM sections WHERE grade_id = ? AND is_active = 1 ORDER BY section_name`
        : `SELECT id, section_name FROM sections WHERE is_active = 1 ORDER BY section_name`,
      gradeId ? [gradeId] : []
    );

    const sanitize = (s) => (s || '').toString().replace(/[^A-Za-z0-9]/g, '_');
    const short = (s) => s.length > 20 ? s.slice(0, 20) : s;

    for (const sec of sections) {
      const secId = sec.id;
      const secName = sec.section_name;
      // Hidden per-section lookup sheets
      const subjectsSheet = workbook.addWorksheet(`Subjects_${secId}`); subjectsSheet.state = 'hidden'; subjectsSheet.addRow(['Subject']);
      const activitiesSheet = workbook.addWorksheet(`Activities_${secId}`); activitiesSheet.state = 'hidden';
      const activityPathsSheet = workbook.addWorksheet(`ActivityPaths_${secId}`); activityPathsSheet.state = 'hidden';
      const batchesSheet = workbook.addWorksheet(`Batches_${secId}`); batchesSheet.state = 'hidden';

      const [subjects] = await db.query(
        `SELECT DISTINCT sub.subject_name FROM subject_section_assignments ssa JOIN subjects sub ON ssa.subject_id=sub.id WHERE ssa.section_id=? AND ssa.is_active=1 ORDER BY sub.subject_name`,
        [secId]
      );
      subjects.forEach(s => subjectsSheet.addRow([s.subject_name]));

      const [allActs] = await db.query(
        `SELECT ca.id, ca.parent_context_id, sub.subject_name, act.name as activity_name
               FROM context_activities ca
               JOIN activities act ON ca.activity_id=act.id
               JOIN subjects sub ON ca.subject_id=sub.id
               WHERE ca.section_id=? ORDER BY sub.subject_name, activity_name`, [secId]
      );
      const [batchesAll] = await db.query(
        `SELECT DISTINCT sub.subject_name, sb.batch_name
               FROM section_batches sb
               JOIN subject_section_assignments ssa ON sb.subject_section_id = ssa.id
               JOIN subjects sub ON ssa.subject_id = sub.id
               WHERE ssa.section_id = ? AND sb.is_active = 1 AND ssa.is_active = 1
               ORDER BY sub.subject_name, sb.batch_name`, [secId]
      );

      // Maps
      const actsBySubject = new Map();
      const childMap = new Map();
      allActs.forEach(r => {
        const parentKey = r.parent_context_id ? r.parent_context_id : 0;
        if (!childMap.has(parentKey)) childMap.set(parentKey, []);
        childMap.get(parentKey).push({ id: r.id, name: r.activity_name, subject: r.subject_name });
        if (!r.parent_context_id) { if (!actsBySubject.has(r.subject_name)) actsBySubject.set(r.subject_name, []); actsBySubject.get(r.subject_name).push(r.activity_name); }
      });
      const batchesBySubject = new Map();
      batchesAll.forEach(r => { if (!batchesBySubject.has(r.subject_name)) batchesBySubject.set(r.subject_name, []); batchesBySubject.get(r.subject_name).push(r.batch_name); });

      // Build paths
      const roots = allActs.filter(a => !a.parent_context_id);
      // key subj|root -> Set of chains (excluding root); include intermediate and leaf chains
      const pathColumns = new Map();
      const addPath = (subject, rootName, chain) => {
        const excl = chain.slice(1).join(' > ');
        const key = `${subject}|${rootName}`;
        if (!pathColumns.has(key)) pathColumns.set(key, new Set());
        if (excl) pathColumns.get(key).add(excl);
      };
      const traverse = (subject, rootName, chain, id) => {
        const kids = (childMap.get(id) || []).sort((a, b) => a.name.localeCompare(b.name));
        for (const k of kids) {
          const nextChain = [...chain, k.name];
          // Add the immediate and intermediate chain (e.g., "Lecture", then deeper like "Lecture > Test")
          addPath(subject, rootName, nextChain);
          traverse(subject, rootName, nextChain, k.id);
        }
      };
      for (const r of roots) traverse(r.subject_name, r.activity_name, [r.activity_name], r.id);
      // Convert Sets to sorted arrays and add blank option at end for "no path"
      const pathColumnsArray = new Map();
      pathColumns.forEach((set, key) => {
        const arr = Array.from(set);
        arr.sort((a, b) => a.localeCompare(b));
        arr.push('');
        pathColumnsArray.set(key, arr);
      });

      // Activities sheet (root activities per subject)
      let aIdx = 1;
      actsBySubject.forEach((list, subj) => {
        const header = sanitize(subj);
        activitiesSheet.getRow(1).getCell(aIdx).value = header;
        list.forEach((val, i) => activitiesSheet.getRow(2 + i).getCell(aIdx).value = val);
        aIdx++;
      });
      // ActivityPaths sheet
      let pIdx = 1;
      (pathColumnsArray.size > 0 ? pathColumnsArray : pathColumns).forEach((list, key) => {
        const [subj, root] = key.split('|');
        const header = `${sanitize(subj)}__${sanitize(root)}`;
        activityPathsSheet.getRow(1).getCell(pIdx).value = header;
        list.forEach((val, i) => activityPathsSheet.getRow(2 + i).getCell(pIdx).value = val);
        pIdx++;
      });
      // Batches sheet
      let bIdx = 1;
      batchesBySubject.forEach((list, subj) => {
        const header = sanitize(subj);
        batchesSheet.getRow(1).getCell(bIdx).value = header;
        list.forEach((val, i) => batchesSheet.getRow(2 + i).getCell(bIdx).value = val);
        bIdx++;
      });

      // Visible sheets
      const base = short(sanitize(secName));
      const topicsName = `section${base}-topic`.substring(0, 31);
      const materialsName = `section${base}-material`.substring(0, 31);
      const batchDatesName = `section${base}-batch date`.substring(0, 31);

      sectionMeta.addRow([topicsName, secId, 'Topic']);
      sectionMeta.addRow([materialsName, secId, 'Material']);
      sectionMeta.addRow([batchDatesName, secId, 'BatchDate']);

      const topicsSheet = workbook.addWorksheet(topicsName);
      // Added ParentTopicCode column (blank if root topic). Child topics should reference a previously defined TopicCode in the same section sheet.
      // Also added HasHomework, IsBottomLevel, PassPercentage columns as requested.
      topicsSheet.columns = [
        { header: 'Subject', width: 18 },            // Col 1
        { header: 'ActivityRoot', width: 18 },       // Col 2
        { header: 'ActivityPath (Child1 > Child2 or blank)', width: 34 }, // Col 3
        { header: 'ParentTopicCode (blank if root)', width: 26 },          // Col 4
        { header: 'TopicCode', width: 14 },          // Col 5
        { header: 'TopicName', width: 28 },          // Col 6
        { header: 'TopicOrder', width: 12 },         // Col 7
        { header: 'HasAssessment (Yes/No)', width: 18 }, // Col 8
        { header: 'HasHomework (Yes/No)', width: 18 },   // Col 9
        { header: 'IsBottomLevel (Yes/No)', width: 20 }, // Col 10
        { header: 'PassPercentage', width: 16 },         // Col 11
        { header: 'DifficultyLevel', width: 16 }     // Col 12 (optional hint)
      ];
      topicsSheet.getRow(1).font = { bold: true };
      // Sample root topic row (ParentTopicCode blank)
      topicsSheet.addRow([
        subjects[0]?.subject_name || '',
        actsBySubject.get(subjects[0]?.subject_name || '')?.[0] || '',
        '', '', 'T001', 'Sample Root Topic', 1, 'No', 'No', 'Yes', 60, 'Medium'
      ]);
      // Sample child topic row referencing T001 as parent
      topicsSheet.addRow([
        subjects[0]?.subject_name || '',
        actsBySubject.get(subjects[0]?.subject_name || '')?.[0] || '',
        '', 'T001', 'T001A', 'Sample Child Topic', 2, 'No', 'No', 'Yes', 60, 'Medium'
      ]);

      const materialsSheet = workbook.addWorksheet(materialsName);
      // Simplified materials sheet (no ActivityRoot/ActivityPath)
      materialsSheet.columns = [
        { header: 'Subject', width: 18 },
        { header: 'TopicCode', width: 14 },
        { header: 'MaterialType', width: 14 },
        { header: 'MaterialTitle', width: 30 },
        { header: 'MaterialURL', width: 42 },
        { header: 'EstimatedDuration', width: 18 },
        { header: 'DifficultyLevel', width: 16 },
        { header: 'HasAssessment (Yes/No)', width: 18 },
        { header: 'Instructions', width: 32 }
      ];
      materialsSheet.getRow(1).font = { bold: true };
      materialsSheet.addRow([
        subjects[0]?.subject_name || '',
        'T001', 'Video', 'Intro Video', 'https://example.com/video.mp4', 30, 'Medium', 'No', ''
      ]);

      const batchDatesSheet = workbook.addWorksheet(batchDatesName);
      // Simplified batch dates sheet (no ActivityRoot/ActivityPath)
      batchDatesSheet.columns = [
        { header: 'Subject', width: 18 },
        { header: 'TopicCode', width: 14 },
        { header: 'BatchName', width: 20 },
        { header: 'ExpectedCompletionDate (YYYY-MM-DD)', width: 28 }
      ];
      batchDatesSheet.getRow(1).font = { bold: true };
      batchDatesSheet.addRow([
        subjects[0]?.subject_name || '',
        'T001', batchesBySubject.get(subjects[0]?.subject_name || '')?.[0] || '', '2025-01-15'
      ]);

      // Validation helpers
      const subjLast = subjects.length + 1;
      const materialTypesLast = materialTypesSheet.rowCount; // first row is header
      const diffLast = difficultySheet.rowCount;

      const applyCommon = (ws, subjCol, rootCol, pathCol, diffCol) => {
        ws.getColumn(subjCol).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; if (subjects.length > 0) cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Subjects_${secId}'!$A$2:$A$${subjLast}`] }; });
        ws.getColumn(rootCol).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; const f = `OFFSET(Activities_${secId}!$A$2,0,MATCH(SUBSTITUTE($A${row}," ","_"),Activities_${secId}!$1:$1,0)-1,1000,1)`; cell.dataValidation = { type: 'list', allowBlank: true, formulae: [f] }; });
        ws.getColumn(pathCol).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; const f = `OFFSET(ActivityPaths_${secId}!$A$2,0,MATCH(SUBSTITUTE($A${row}," ","_")&"__"&SUBSTITUTE($B${row}," ","_"),ActivityPaths_${secId}!$1:$1,0)-1,1000,1)`; cell.dataValidation = { type: 'list', allowBlank: true, formulae: [f] }; });
        if (diffCol) ws.getColumn(diffCol).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; const f = `'DifficultyLevels'!$A$2:$A$${diffLast}`; cell.dataValidation = { type: 'list', allowBlank: true, formulae: [f] }; });
      };

      // Topic sheet validations (DifficultyLevel now at column 12)
      applyCommon(topicsSheet, 1, 2, 3, 12);
      // Add simple Yes/No dropdowns for boolean columns (HasAssessment col 8, HasHomework col 9, IsBottomLevel col 10)
      const booleanCols = [8, 9, 10];
      for (const col of booleanCols) {
        topicsSheet.getColumn(col).eachCell({ includeEmpty: true }, (cell, row) => {
          if (row === 1) return;
          // Use inline list string for validation to avoid Excel repair
          cell.dataValidation = { type: 'list', allowBlank: true, formulae: ['"Yes,No"'] };
        });
      }

      // Materials validations: Subject (col1), MaterialType (col3), Difficulty (col7)
      materialsSheet.getColumn(1).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; if (subjects.length > 0) cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Subjects_${secId}'!$A$2:$A$${subjLast}`] }; });
      materialsSheet.getColumn(3).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; const f = `'MaterialTypes'!$A$2:$A$${materialTypesLast}`; cell.dataValidation = { type: 'list', allowBlank: true, formulae: [f] }; });
      materialsSheet.getColumn(7).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; const f = `'DifficultyLevels'!$A$2:$A$${diffLast}`; cell.dataValidation = { type: 'list', allowBlank: true, formulae: [f] }; });

      // BatchDates validations: Subject (col1), BatchName (col3), Date (col4)
      batchDatesSheet.getColumn(1).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; if (subjects.length > 0) cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Subjects_${secId}'!$A$2:$A$${subjLast}`] }; });
      // Use multi-character sanitization to match headers created by sanitize(name)
      batchDatesSheet.getColumn(3).eachCell({ includeEmpty: true }, (cell, row) => {
        if (row === 1) return;
        const sanitizedSubjectRef = `SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE($A${row}," ","_"),"-","_"),"&","_"),"/","_"),"(","_"),")","_"),".","_"),",","_")`;
        const f = `OFFSET(Batches_${secId}!$A$2,0,MATCH(${sanitizedSubjectRef},Batches_${secId}!$1:$1,0)-1,1000,1)`;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [f] };
      });
      batchDatesSheet.getColumn(4).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; cell.numFmt = 'yyyy-mm-dd'; });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const safeGrade = gradeName ? sanitize(gradeName) : 'all_grades';
    res.setHeader('Content-Disposition', `attachment; filename=topic_material_upload_${safeGrade}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating topic material template:', error);
    res.status(500).json({ success: false, message: 'Failed to generate topic material template', error: error.message });
  }
};

/**
     * Upload Academic Year bulk data for multi-sheet template (Topic/Material/BatchDate per section)
     */
const uploadAcademicYearData = async (req, res) => {
  const connection = await db.getConnection();
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const activeAcademicYearId = req.activeAcademicYearId;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const meta = workbook.getWorksheet('SectionMeta');
    if (!meta) return res.status(400).json({ success: false, message: 'Missing SectionMeta sheet' });
    const sheetInfos = [];
    meta.eachRow((row, rn) => { if (rn === 1) return; const name = row.getCell(1).value?.toString(); const sid = parseInt(row.getCell(2).value); const type = (row.getCell(3).value || '').toString(); if (name && sid && type) sheetInfos.push({ name, sid, type }); });

    // Preload context activities & batches
    const [allContextRows] = await db.query(`SELECT ca.id context_activity_id, ca.section_id, sub.subject_name, act.name activity_name, ca.parent_context_id FROM context_activities ca JOIN activities act ON ca.activity_id=act.id JOIN subjects sub ON ca.subject_id=sub.id`);
    const traversal = new Map();
    allContextRows.forEach(r => { const parentId = r.parent_context_id ? r.parent_context_id : 0; traversal.set(`${r.section_id}|${r.subject_name}|${parentId}|${r.activity_name}`, r.context_activity_id); });
    const [batchRows] = await db.query(`SELECT sb.id batch_id, ssa.section_id, sub.subject_name, sb.batch_name FROM section_batches sb JOIN subject_section_assignments ssa ON sb.subject_section_id=ssa.id JOIN subjects sub ON ssa.subject_id=sub.id WHERE sb.is_active=1`);
    const batchMap = new Map(); batchRows.forEach(r => batchMap.set(`${r.section_id}|${r.subject_name}|${r.batch_name}`, r.batch_id));

    const topicCodeMap = new Map(); // key sectionId|topicCode -> topicId
    const errors = []; let topicsCreated = 0, materialsCreated = 0, batchDatesSet = 0;

    await connection.beginTransaction();

    const resolveActivity = (sectionId, subject, root, path) => {
      if (!root) return null; const segs = [root, ...path.split('>').map(s => s.trim()).filter(s => s.length > 0)]; let parentId = 0; let found = null; for (const seg of segs) { const key = `${sectionId}|${subject}|${parentId}|${seg}`; const id = traversal.get(key); if (!id) return null; found = id; parentId = id; } return found;
    };

    // Topics (now supports ParentTopicCode in column 4; blank if root)
    const topicLevelMap = new Map(); // key sectionId|topicCode -> level
    for (const info of sheetInfos.filter(s => s.type === 'Topic')) {
      const ws = workbook.getWorksheet(info.name); if (!ws) continue;
      // Collect rows first to preserve ordering and allow parent-first dependency
      const topicRows = [];
      ws.eachRow((row, rn) => { if (rn === 1) return; topicRows.push({ row, rn }); });
      for (const { row, rn } of topicRows) {
        const subject = (row.getCell(1).value || '').toString().trim(); if (!subject) continue;
        const root = (row.getCell(2).value || '').toString().trim();
        const path = (row.getCell(3).value || '').toString().trim();
        const parentCode = (row.getCell(4).value || '').toString().trim();
        const code = (row.getCell(5).value || '').toString().trim();
        const name = (row.getCell(6).value || '').toString().trim();
        const order = parseInt(row.getCell(7).value) || 1;
        const yesNo = (v) => {
          if (v === true || v === 1) return true;
          const s = (v || '').toString().trim().toLowerCase();
          return s === 'yes' || s === 'y' || s === 'true' || s === '1';
        };
        const hasAssess = yesNo(row.getCell(8).value || '');
        const hasHomework = yesNo(row.getCell(9).value || '');
        const isBottom = yesNo(row.getCell(10).value || 'yes');
        const passPerc = parseInt((row.getCell(11).value || '60').toString().trim()) || 60;
        const difficulty = (row.getCell(12).value || 'Medium').toString().trim(); // currently unused in insert (legacy schema)
        if (!code || !name) { errors.push(`Topic ${info.name} row ${rn}: missing code/name`); continue; }
        const key = `${info.sid}|${code}`;
        if (topicCodeMap.has(key)) { errors.push(`Topic ${info.name} row ${rn}: duplicate code ${code}`); continue; }
        const caId = resolveActivity(info.sid, subject, root, path);
        if (!caId) { errors.push(`Topic ${info.name} row ${rn}: cannot resolve activity path`); continue; }
        let parentId = null; let level = 1;
        if (parentCode) {
          const parentKey = `${info.sid}|${parentCode}`;
            if (!topicCodeMap.has(parentKey)) {
              errors.push(`Topic ${info.name} row ${rn}: parent topic code ${parentCode} not found above`); continue;
            }
            parentId = topicCodeMap.get(parentKey);
            const parentLevel = topicLevelMap.get(parentKey) || 1;
            level = parentLevel + 1;
        }
        try {
          const [resInsert] = await connection.query(
            `INSERT INTO topic_hierarchy (parent_id, context_activity_id, level, topic_name, topic_code, order_sequence, has_assessment, has_homework, is_bottom_level, expected_completion_days, pass_percentage)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [parentId, caId, level, name, code, order, hasAssess ? 1 : 0, hasHomework ? 1 : 0, isBottom ? 1 : 0, 7, passPerc]
          );
          topicCodeMap.set(key, resInsert.insertId);
          topicLevelMap.set(key, level);
          topicsCreated++;
        } catch (e) {
          errors.push(`Topic ${info.name} row ${rn}: ${e.message}`);
        }
      }
    }

    // Materials
    for (const info of sheetInfos.filter(s => s.type === 'Material')) {
      const ws = workbook.getWorksheet(info.name); if (!ws) continue;
      ws.eachRow((row, rn) => {
        if (rn === 1) return;
        const subject = (row.getCell(1).value || '').toString().trim(); if (!subject) return;
        const code = (row.getCell(2).value || '').toString().trim();
        const type = (row.getCell(3).value || '').toString().trim();
        const title = (row.getCell(4).value || '').toString().trim() || 'Untitled';
        const url = (row.getCell(5).value || '').toString().trim();
        const est = parseInt(row.getCell(6).value) || 30;
        const diff = (row.getCell(7).value || 'Medium').toString().trim();
        const hasAssess = (row.getCell(8).value || '').toString().toLowerCase() === 'yes';
        const instr = (row.getCell(9).value || '').toString().trim();
        if (!code) { errors.push(`Material ${info.name} row ${rn}: missing topic code`); return; }
        const key = `${info.sid}|${code}`; const topicId = topicCodeMap.get(key);
        if (!topicId) { errors.push(`Material ${info.name} row ${rn}: topic code ${code} not found`); return; }
        if (!type || !url) { errors.push(`Material ${info.name} row ${rn}: missing type/url`); return; }
        connection.query(`INSERT INTO topic_materials (topic_id, material_type, material_title, material_url, estimated_duration, difficulty_level, instructions, has_assessment, order_number, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())`, [topicId, type, title, url, est, diff, instr || null, hasAssess ? 1 : 0, 1]).then(() => { materialsCreated++; }).catch(e => errors.push(`Material ${info.name} row ${rn}: ${e.message}`));
      });
    }

    // Batch Dates
    for (const info of sheetInfos.filter(s => s.type === 'BatchDate')) {
      const ws = workbook.getWorksheet(info.name); if (!ws) continue;
      ws.eachRow((row, rn) => {
        if (rn === 1) return;
        const subject = (row.getCell(1).value || '').toString().trim(); if (!subject) return;
        const code = (row.getCell(2).value || '').toString().trim();
        const batchName = (row.getCell(3).value || '').toString().trim();
        const rawDate = row.getCell(4).value;
        if (!code || !batchName) { errors.push(`BatchDate ${info.name} row ${rn}: missing topic code/batch name`); return; }
        const key = `${info.sid}|${code}`; const topicId = topicCodeMap.get(key);
        if (!topicId) { errors.push(`BatchDate ${info.name} row ${rn}: topic code ${code} not found`); return; }
        const batchId = batchMap.get(`${info.sid}|${subject}|${batchName}`);
        if (!batchId) { errors.push(`BatchDate ${info.name} row ${rn}: batch ${batchName} not found`); return; }
        let expDate = null; if (rawDate) { if (rawDate instanceof Date) expDate = rawDate.toISOString().slice(0, 10); else if (typeof rawDate === 'string') { const d = new Date(rawDate); if (!isNaN(d.getTime())) expDate = d.toISOString().slice(0, 10); } else if (typeof rawDate === 'number') { const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000)); expDate = d.toISOString().slice(0, 10); } }
        if (!expDate) { errors.push(`BatchDate ${info.name} row ${rn}: invalid expected date`); return; }
        connection.query(`SELECT id FROM topic_completion_dates WHERE topic_id=? AND batch_id=? AND academic_year=?`, [topicId, batchId, activeAcademicYearId]).then(([existing]) => {
          if (existing.length > 0) { return connection.query(`UPDATE topic_completion_dates SET expected_completion_date=? WHERE id=?`, [expDate, existing[0].id]); }
          return connection.query(`INSERT INTO topic_completion_dates (topic_id,batch_id,expected_completion_date,academic_year) VALUES (?,?,?,?)`, [topicId, batchId, expDate, activeAcademicYearId]);
        }).then(() => { batchDatesSet++; }).catch(e => errors.push(`BatchDate ${info.name} row ${rn}: ${e.message}`));
      });
    }

    if (errors.length > 0) { await connection.rollback(); return res.status(400).json({ success: false, message: 'Import encountered errors', errors }); }
    await connection.commit();
    res.json({ success: true, message: 'Academic year data imported', topicsCreated, materialsCreated, batchDatesSet });
  } catch (error) {
    await connection.rollback();
    console.error('Error uploading academic year data:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload academic year data', error: error.message });
  } finally {
    connection.release();
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
  getBatchExpectedDates,
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
  // generateMaterialsTemplate,
  // uploadMaterialsFromExcel,
  generateAcademicYearTemplate,
  uploadAcademicYearData,

  // Utilities
  getSectionSubjects
};