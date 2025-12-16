const db = require('../../config/db');
const ExcelJS = require('exceljs');

// Generate Excel template for mentor schedule upload with dropdowns and dependent data
exports.generateMentorScheduleTemplate = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const academicYearId = req.activeAcademicYearId;

    // Fetch all necessary data for dropdowns
    const [mentors] = await conn.query(`
      SELECT DISTINCT f.roll, f.name
      FROM faculty f
      JOIN mentors m ON m.faculty_id = f.id
      WHERE f.roll IS NOT NULL
      ORDER BY f.roll
    `);

    const [grades] = await conn.query('SELECT id, grade_name FROM grades ORDER BY id');

    const [sections] = await conn.query(`
      SELECT s.id, s.section_name, s.grade_id, g.grade_name
      FROM sections s
      JOIN grades g ON g.id = s.grade_id
      ORDER BY g.id, s.section_name
    `);

    const [subjects] = await conn.query(`
      SELECT DISTINCT sub.id, sub.subject_name, ssa.grade_id, ssa.section_id, g.id, g.grade_name, s.section_name
      FROM subject_section_assignments ssa
      JOIN subjects sub ON sub.id = ssa.subject_id
      JOIN grades g ON g.id = ssa.grade_id
      JOIN sections s ON s.id = ssa.section_id
      ORDER BY g.id, s.section_name, sub.subject_name
    `);

    const [batches] = await conn.query(`
      SELECT sb.id, sb.batch_name, ssa.grade_id, ssa.section_id, ssa.subject_id,
             g.grade_name, s.section_name, sub.subject_name
      FROM section_batches sb
      JOIN subject_section_assignments ssa ON ssa.id = sb.subject_section_id
      JOIN grades g ON g.id = ssa.grade_id
      JOIN sections s ON s.id = ssa.section_id
      JOIN subjects sub ON sub.id = ssa.subject_id
      ORDER BY g.id, s.section_name, sub.subject_name, sb.batch_name
    `);

    const [venues] = await conn.query('SELECT id, name FROM venues ORDER BY name');

    const [sessionTypes] = await conn.query(
      `SELECT st.id, st.name, em.name AS eval_name
       FROM session_types st
       LEFT JOIN evaluation_modes em ON em.id = st.evaluation_mode
       WHERE st.is_active = 1
       ORDER BY st.name`
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('MentorSchedule');

    // Create hidden data sheets for dropdowns
    const mentorSheet = workbook.addWorksheet('Mentors');
    const gradeSheet = workbook.addWorksheet('Grades');
    const sectionSheet = workbook.addWorksheet('Sections');
    const subjectSheet = workbook.addWorksheet('Subjects');
    const batchSheet = workbook.addWorksheet('Batches');
    const venueSheet = workbook.addWorksheet('Venues');
    const sessionTypeSheet = workbook.addWorksheet('SessionTypes');

    // Populate hidden sheets with combined labels
    mentorSheet.addRow(['Mentor']);
    mentors.forEach(m => mentorSheet.addRow([`${m.roll}[${m.name}]`]));

    gradeSheet.addRow(['Grade']);
    grades.forEach(g => gradeSheet.addRow([g.grade_name]));

    sectionSheet.addRow(['Section[Grade]']);
    sections.forEach(s => sectionSheet.addRow([`${s.section_name}[${s.grade_name}]`]));

    subjectSheet.addRow(['Subject[Grade-Section]']);
    subjects.forEach(sub => subjectSheet.addRow([`${sub.subject_name}[${sub.grade_name}-${sub.section_name}]`]));

    batchSheet.addRow(['Batch[Grade-Section-Subject]']);
    batches.forEach(b => batchSheet.addRow([`${b.batch_name}[${b.grade_name}-${b.section_name}-${b.subject_name}]`]));

    venueSheet.addRow(['Venue']);
    venues.forEach(v => venueSheet.addRow([v.name]));

    sessionTypeSheet.addRow(['SessionType']);
    sessionTypes.forEach(st => sessionTypeSheet.addRow([`${st.name}[${st.eval_name || 'none'}]`]));

    // Hide the data sheets
    mentorSheet.state = 'veryHidden';
    gradeSheet.state = 'veryHidden';
    sectionSheet.state = 'veryHidden';
    subjectSheet.state = 'veryHidden';
    batchSheet.state = 'veryHidden';
    venueSheet.state = 'veryHidden';
    sessionTypeSheet.state = 'veryHidden';

    // Main sheet columns
    sheet.columns = [
      { header: 'FacultyRollno*', key: 'faculty_rollno', width: 16 },
      { header: 'Date* (YYYY-MM-DD)', key: 'date', width: 18 },
      { header: 'StartTime* (HH:MM)', key: 'start_time', width: 18 },
      { header: 'EndTime* (HH:MM)', key: 'end_time', width: 18 },
      { header: 'Grade*', key: 'grade_name', width: 15 },
      { header: 'Section*', key: 'section_name', width: 15 },
      { header: 'Subject*', key: 'subject_name', width: 22 },
      { header: 'Batch (optional)', key: 'batch_name', width: 25 },
      { header: 'Venue*', key: 'venue_name', width: 20 },
      { header: 'SessionType*', key: 'session_type', width: 24 },
      { header: 'TotalMarks', key: 'total_marks', width: 15 },
      { header: 'AssessmentCycleName', key: 'assessment_cycle_name', width: 25 },
      { header: 'TaskDescription', key: 'task_description', width: 40 },
    ];

    sheet.getRow(1).font = { bold: true };

    // Add data validation (dropdowns) for 100 rows
    for (let i = 2; i <= 101; i++) {
      // Mentor dropdown (roll[name])
      sheet.getCell(`A${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Mentors!$A$2:$A$${mentors.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Mentor',
        error: 'Please select a mentor from the list (roll[name])'
      };

      // Grade dropdown
      sheet.getCell(`E${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Grades!$A$2:$A$${grades.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Grade',
        error: 'Please select a grade from the list'
      };

      // Section dropdown labeled as Section[Grade]
      sheet.getCell(`F${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Sections!$A$2:$A$${sections.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Section',
        error: 'Please select a section (Section[Grade])'
      };

      // Subject dropdown labeled as Subject[Grade-Section]
      sheet.getCell(`G${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Subjects!$A$2:$A$${subjects.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Subject',
        error: 'Please select a subject (Subject[Grade-Section])'
      };

      // Batch dropdown labeled as Batch[Grade-Section-Subject] (optional)
      sheet.getCell(`H${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Batches!$A$2:$A$${batches.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Batch',
        error: 'Please select a batch (Batch[Grade-Section-Subject])'
      };

      // Venue dropdown
      sheet.getCell(`I${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Venues!$A$2:$A$${venues.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Venue',
        error: 'Please select a venue from the list'
      };

      // SessionType dropdown (label includes evaluation mode)
      sheet.getCell(`J${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`SessionTypes!$A$2:$A$${sessionTypes.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Session Type',
        error: 'Please select a valid session type'
      };
    }

    // Add example row
    sheet.addRow({
      faculty_rollno: mentors.length > 0 ? `${mentors[0].roll}[${mentors[0].name}]` : 'M1001[John Doe]',
      date: '2025-12-20',
      start_time: '09:00',
      end_time: '09:50',
      grade_name: grades.length > 0 ? grades[0].grade_name : 'Grade 1',
      section_name: sections.length > 0 ? `${sections[0].section_name}[${sections[0].grade_name}]` : 'A[Grade 1]',
      subject_name: subjects.length > 0 ? `${subjects[0].subject_name}[${subjects[0].grade_name}-${subjects[0].section_name}]` : 'Mathematics[Grade 1-A]',
      batch_name: batches.length > 0 ? `${batches[0].batch_name}[${batches[0].grade_name}-${batches[0].section_name}-${batches[0].subject_name}]` : '',
      venue_name: venues.length > 0 ? venues[0].name : 'Room 101',
      session_type: sessionTypes.length > 0 ? sessionTypes[0].name : 'class',
      total_marks: '',
      assessment_cycle_name: '',
      task_description: 'Regular class session',
    });

    if (conn) conn.release();

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="mentor_schedule_template.xlsx"');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error generating mentor schedule template:', err);
    if (conn) conn.release();
  }
};

// Helper to fetch single row
async function fetchSingle(conn, sql, params) {
  const [rows] = await conn.query(sql, params);
  return rows && rows.length ? rows[0] : null;
}

// Upload mentor schedule from Excel and create mentor & student schedules
exports.uploadMentorSchedule = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = { processed: 0, succeeded: 0, failed: [] };

  let conn;

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet('MentorSchedule') || workbook.worksheets[0];

    if (!sheet) {
      return res.status(400).json({ success: false, message: 'Invalid Excel: No worksheet found' });
    }

    conn = await db.getConnection();
    const academicYearId = req.activeAcademicYearId;

    // Pre-fetch session types with their evaluation modes (active)
    const [sessionTypes] = await conn.query(
      `SELECT st.id, st.name, em.name AS eval_name
       FROM session_types st
       LEFT JOIN evaluation_modes em ON em.id = st.evaluation_mode
       WHERE st.is_active = 1
       ORDER BY st.name`
    );
    const sessionTypeMapDb = new Map(sessionTypes.map(st => [String(st.name).toLowerCase(), st]));

    const scheduleTypeMap = {
      class: 'class_session',
      lab: 'class_session',
      assessment: 'exam',
      exam: 'exam',
      homework_eval: 'homework',
      admin_task: 'class_session',
      other: 'class_session',
    };

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      // Skip empty
      if (!row.getCell(1).value) continue;
      results.processed++;

      try {
        // Mentor value like M1001[Name] -> extract roll before '['
        const mentorCellRaw = String(row.getCell(1).value || '').trim();
        const facultyRollno = mentorCellRaw.includes('[') ? mentorCellRaw.split('[')[0].trim() : mentorCellRaw;
        const dateStr = String(row.getCell(2).value || '').trim();
        const startTimeStr = String(row.getCell(3).value || '').trim();
        const endTimeStr = String(row.getCell(4).value || '').trim();
        const gradeName = String(row.getCell(5).value || '').trim();
        // Section value like SectionA[Grade1] -> take text before '['
        const sectionRaw = String(row.getCell(6).value || '').trim();
        const sectionName = sectionRaw.includes('[') ? sectionRaw.split('[')[0].trim() : sectionRaw;
        // Subject value like Maths[Grade1-SectionA] -> take text before '['
        const subjectRaw = String(row.getCell(7).value || '').trim();
        const subjectName = subjectRaw.includes('[') ? subjectRaw.split('[')[0].trim() : subjectRaw;
        // Batch value like BatchA[Grade1-SectionA-Maths] -> take text before '['
        const batchRaw = String(row.getCell(8).value || '').trim();
        const batchName = batchRaw.includes('[') ? batchRaw.split('[')[0].trim() : batchRaw; // Single batch now
        const venueName = String(row.getCell(9).value || '').trim();
        const sessionTypeRaw = String(row.getCell(10).value || '').trim().toLowerCase();
        const totalMarksCell = row.getCell(11).value;
        const assessmentCycleName = String(row.getCell(12).value || '').trim();
        const taskDescription = String(row.getCell(13).value || '').trim();

        if (!facultyRollno || !dateStr || !startTimeStr || !endTimeStr || !gradeName || !sectionName || !subjectName || !venueName) {
          results.failed.push({ row: i, reason: 'Missing required fields' });
          continue;
        }

        const sessionTypeName = sessionTypeRaw.includes('[')
          ? sessionTypeRaw.split('[')[0].trim()
          : sessionTypeRaw;
        const sessionTypeRow = sessionTypeName
          ? sessionTypeMapDb.get(sessionTypeName)
          : (sessionTypes[0] || null);
        if (!sessionTypeRow) {
          results.failed.push({ row: i, reason: `Unknown session type: ${sessionTypeRaw || 'not provided'}` });
          continue;
        }
        const sessionType = String(sessionTypeRow.name).toLowerCase();
        const sessionTypeId = sessionTypeRow.id;
        const evaluationMode = String(sessionTypeRow.eval_name || 'none').toLowerCase();
        const totalMarks = totalMarksCell ? parseInt(totalMarksCell, 10) : null;

        // Resolve mentor by rollno
        const mentorRow = await fetchSingle(
          conn,
          `SELECT m.id AS mentor_id
           FROM faculty f
           JOIN mentors m ON m.faculty_id = f.id
           WHERE f.roll = ?`,
          [facultyRollno]
        );
        if (!mentorRow) {
          results.failed.push({ row: i, reason: `Mentor not found for rollno ${facultyRollno}` });
          continue;
        }

        const mentorId = mentorRow.mentor_id;

        // Resolve grade, section, subject
        const gradeRow = await fetchSingle(conn, 'SELECT id FROM grades WHERE grade_name = ?', [gradeName]);
        if (!gradeRow) {
          results.failed.push({ row: i, reason: `Unknown grade: ${gradeName}` });
          continue;
        }

        const sectionRow = await fetchSingle(
          conn,
          'SELECT id FROM sections WHERE grade_id = ? AND section_name = ?',
          [gradeRow.id, sectionName]
        );
        if (!sectionRow) {
          results.failed.push({ row: i, reason: `Unknown section: ${sectionName} for grade ${gradeName}` });
          continue;
        }

        const subjectRow = await fetchSingle(conn, 'SELECT id FROM subjects WHERE subject_name = ?', [subjectName]);
        if (!subjectRow) {
          results.failed.push({ row: i, reason: `Unknown subject: ${subjectName}` });
          continue;
        }

        // Resolve venue by name
        const venueRow = await fetchSingle(conn, 'SELECT id FROM venues WHERE name = ?', [venueName]);
        if (!venueRow) {
          results.failed.push({ row: i, reason: `Unknown venue: ${venueName}` });
          continue;
        }

        // Optional assessment cycle
        let assessmentCycleId = null;
        if (assessmentCycleName) {
          const existingCycle = await fetchSingle(
            conn,
            'SELECT id FROM assessment_cycles WHERE name = ? AND academic_year_id = ?',
            [assessmentCycleName, academicYearId]
          );
          if (existingCycle) {
            assessmentCycleId = existingCycle.id;
          } else {
            const [ins] = await conn.query(
              `INSERT INTO assessment_cycles
               (name, academic_year_id, grade_id, section_id, subject_id, frequency, period_start, period_end, default_total_marks, created_by, created_at)
               VALUES (?, ?, ?, ?, ?, 'custom', NULL, NULL, ?, NULL, NOW())`,
              [assessmentCycleName, academicYearId, gradeRow.id, sectionRow.id, subjectRow.id, totalMarks || null]
            );
            assessmentCycleId = ins.insertId;
          }
        }

        // Start transaction per row to keep failures isolated
        await conn.beginTransaction();

        // Insert mentor session
        const [sessionRes] = await conn.query(
          `INSERT INTO mentor_calendar
           (mentor_id, academic_year, date, start_time, end_time, venue_id, grade_id, section_id, subject_id,
            context_activity_id, section_activity_topic_id, task_description, is_assessment, is_rescheduled, status,
            created_at, session_type_id, session_type, evaluation_mode, total_marks, assessment_cycle_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, 0, 'scheduled', NOW(), ?, ?, ?, ?, ?)`,
          [
            mentorId,
            academicYearId,
            dateStr,
            startTimeStr,
            endTimeStr,
            venueRow.id,
            gradeRow.id,
            sectionRow.id,
            subjectRow.id,
            taskDescription || null,
            sessionType === 'assessment' || sessionType === 'exam' ? 1 : 0,
            sessionTypeId,
            sessionType,
            evaluationMode,
            totalMarks || null,
            assessmentCycleId,
          ]
        );

        const mentorCalendarId = sessionRes.insertId;

        // Attach batch if provided
        let batchIds = [];
        if (batchName) {
          const batchRow = await fetchSingle(
            conn,
            `SELECT sb.id
             FROM section_batches sb
             JOIN subject_section_assignments ssa ON ssa.id = sb.subject_section_id
             WHERE ssa.grade_id = ? AND ssa.section_id = ? AND ssa.subject_id = ? AND sb.batch_name = ?`,
            [gradeRow.id, sectionRow.id, subjectRow.id, batchName]
          );
          if (!batchRow) {
            await conn.rollback();
            results.failed.push({ row: i, reason: `Unknown batch: ${batchName} for ${gradeName}/${sectionName}/${subjectName}` });
            continue;
          }
          batchIds.push(batchRow.id);
          await conn.query(
            'INSERT INTO session_batches (mentor_calendar_id, batch_id) VALUES (?, ?)',
            [mentorCalendarId, batchRow.id]
          );
        };
        const scheduleType = scheduleTypeMap[sessionType] || 'class_session';

        // Insert student schedules for this session (only for class/lab/assessment/exam/homework_eval)
        if (['class', 'lab', 'assessment', 'exam', 'homework_eval'].includes(sessionType) && students.length > 0) {
          for (const s of students) {
            await conn.query(
              `INSERT INTO student_schedule_calendar
							 (student_id, grade_id, section_id, subject_id, mentor_id, context_activity_id, section_activity_topic_id,
								task_description, date, start_time, end_time, venue_id, schedule_type, status, attendance, remarks,
								created_at, mentor_calendar_id, evaluation_mode, total_marks)
							 VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, 'scheduled', 'present', '', NOW(), ?, ?, ?)`,
              [
                s.student_id,
                gradeRow.id,
                sectionRow.id,
                subjectRow.id,
                mentorId,
                taskDescription || null,
                dateStr,
                startTimeStr,
                endTimeStr,
                venueRow.id,
                scheduleType,
                mentorCalendarId,
                evaluationMode,
                totalMarks || null,
              ]
            );
          }
        }

        await conn.commit();
        results.succeeded++;
      } catch (err) {
        console.error(`Error processing row ${i}:`, err);
        try {
          if (conn) await conn.rollback();
        } catch (rbErr) {
          console.error('Rollback error:', rbErr);

        }
        results.failed.push({ row: i, reason: err.message || 'Unknown error' });
      }
    }

    if (conn) conn.release();

    return res.json({ success: true, message: 'Mentor schedule upload completed', data: results });
  } catch (error) {
    console.error('Mentor schedule upload error:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to upload mentor schedule', error: error.message });
  }
};
// ---- Session types & evaluation modes management ----

// Get active evaluation modes for dropdowns
exports.getEvaluationModes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description, requires_marks, requires_attentiveness, requires_docs, allows_malpractice, is_active
           FROM evaluation_modes
           WHERE is_active = 1
           ORDER BY name`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching evaluation modes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch evaluation modes', error: error.message });
  }
};

// Get all session types (active and inactive) with evaluation mode name
exports.getSessionTypes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
             st.id,
             st.name,
             st.description,
             st.is_student_facing,
             st.requires_context_activity,
             st.evaluation_mode,
             st.is_active,
             em.name AS evaluation_mode_name
           FROM session_types st
           LEFT JOIN evaluation_modes em ON em.id = st.evaluation_mode
           ORDER BY st.name`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching session types:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch session types', error: error.message });
  }
};

// Create a new session type
exports.createSessionType = async (req, res) => {
  try {
    const {
      name,
      description,
      isStudentFacing,
      requiresContextActivity,
      evaluationModeId,
      isActive,
    } = req.body || {};

    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Check duplicate name
    const [existing] = await db.query('SELECT id FROM session_types WHERE name = ?', [name.trim()]);
    if (existing && existing.length) {
      return res.status(400).json({ success: false, message: 'Session type with this name already exists' });
    }

    const isStudentFlag = isStudentFacing ? 1 : 0;
    const requiresContextFlag = requiresContextActivity ? 1 : 0;
    const isActiveFlag = typeof isActive === 'boolean' || typeof isActive === 'number'
      ? (isActive ? 1 : 0)
      : 1;

    const [result] = await db.query(
      `INSERT INTO session_types 
             (name, description, is_student_facing, requires_context_activity, evaluation_mode, is_active, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [
        name.trim(),
        description || null,
        isStudentFlag,
        requiresContextFlag,
        evaluationModeId || null,
        isActiveFlag,
        userId,
      ]
    );

    return res.json({ success: true, message: 'Session type created', id: result.insertId });
  } catch (error) {
    console.error('Error creating session type:', error);
    return res.status(500).json({ success: false, message: 'Failed to create session type', error: error.message });
  }
};

// Update session type (fields and active/inactive flag)
exports.updateSessionType = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      isStudentFacing,
      requiresContextActivity,
      evaluationModeId,
      isActive,
    } = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, message: 'Session type id is required' });
    }

    const [rows] = await db.query('SELECT * FROM session_types WHERE id = ?', [id]);
    if (!rows || !rows.length) {
      return res.status(404).json({ success: false, message: 'Session type not found' });
    }
    const current = rows[0];

    // If name is changing, ensure uniqueness
    const newName = name !== undefined ? name.trim() : current.name;
    if (!newName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (newName !== current.name) {
      const [dup] = await db.query('SELECT id FROM session_types WHERE name = ? AND id <> ?', [newName, id]);
      if (dup && dup.length) {
        return res.status(400).json({ success: false, message: 'Another session type with this name already exists' });
      }
    }

    const finalDescription = description !== undefined ? description : current.description;
    const finalIsStudent = isStudentFacing !== undefined ? (isStudentFacing ? 1 : 0) : current.is_student_facing;
    const finalRequiresContext =
      requiresContextActivity !== undefined ? (requiresContextActivity ? 1 : 0) : current.requires_context_activity;
    const finalEvalMode = evaluationModeId !== undefined ? (evaluationModeId || null) : current.evaluation_mode;
    const finalIsActive =
      isActive !== undefined
        ? (isActive ? 1 : 0)
        : current.is_active;

    await db.query(
      `UPDATE session_types 
           SET name = ?, description = ?, is_student_facing = ?, requires_context_activity = ?, evaluation_mode = ?, is_active = ?
           WHERE id = ?`,
      [
        newName,
        finalDescription,
        finalIsStudent,
        finalRequiresContext,
        finalEvalMode,
        finalIsActive,
        id,
      ]
    );

    return res.json({ success: true, message: 'Session type updated' });
  } catch (error) {
    console.error('Error updating session type:', error);
    return res.status(500).json({ success: false, message: 'Failed to update session type', error: error.message });
  }
};

// Hard delete session type
exports.deleteSessionType = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, message: 'Session type id is required' });
    }

    await db.query('DELETE FROM session_types WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Session type deleted' });
  } catch (error) {
    console.error('Error deleting session type:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete session type', error: error.message });
  }
};

