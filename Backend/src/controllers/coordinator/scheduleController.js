const db = require('../../config/db');
const ExcelJS = require('exceljs');

// Generate Excel template for faculty schedule upload with dropdowns and dependent data
exports.generateMentorScheduleTemplate = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const academicYearId = req.activeAcademicYearId;

    // Fetch all necessary data for dropdowns
    // All faculty with a roll number can be scheduled
    const [faculty] = await conn.query(`
      SELECT DISTINCT f.roll, f.name
      FROM faculty f
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

    // Venue mappings with academic context (grade/section/batch/activity)
    const [venueMappings] = await conn.query(`
      SELECT 
        vm.id,
        v.name AS venue_name,
        g.grade_name,
        s.section_name,
        b.batch_name,
        a.name AS activity_name
      FROM venue_mappings vm
      JOIN venues v ON v.id = vm.venue_id
      LEFT JOIN grades g ON vm.grade_id = g.id
      LEFT JOIN sections s ON vm.section_id = s.id
      LEFT JOIN section_batches b ON vm.batch_id = b.id
      LEFT JOIN context_activities ca ON vm.context_activity_id = ca.id
      LEFT JOIN activities a ON ca.activity_id = a.id
      WHERE vm.is_active = 1
      ORDER BY v.name, g.grade_name, s.section_name, b.batch_name, a.name
    `);

    const [sessionTypes] = await conn.query(
      `SELECT st.id, st.name, em.name AS eval_name
       FROM session_types st
       LEFT JOIN evaluation_modes em ON em.id = st.evaluation_mode
       WHERE st.is_active = 1
       ORDER BY st.name`
    );

    // Pre-fetch context activities with grade/section/subject for context_activity dropdown
    const [contextActivities] = await conn.query(
      `SELECT 
         ca.id AS context_activity_id,
         g.grade_name,
         s.section_name,
         sub.subject_name,
         a.name AS activity_name,
         ca.parent_context_id
       FROM context_activities ca
       JOIN activities a ON ca.activity_id = a.id
       JOIN grades g ON g.id = ca.grade_id
       JOIN sections s ON s.id = ca.section_id
       JOIN subjects sub ON sub.id = ca.subject_id
       ORDER BY g.id, s.section_name, sub.subject_name, ca.parent_context_id, a.name`
    );

    // Topics by context activity (for topic dropdown)
    const [topics] = await conn.query(
      `SELECT 
         th.id,
         th.topic_name,
         th.parent_id,
         th.context_activity_id,
         th.topic_code,
         th.level,
         th.order_sequence,
         g.grade_name,
         s.section_name,
         sub.subject_name
       FROM topic_hierarchy th
       JOIN context_activities ca ON ca.id = th.context_activity_id
       JOIN grades g ON g.id = ca.grade_id
       JOIN sections s ON s.id = ca.section_id
       JOIN subjects sub ON sub.id = ca.subject_id
       ORDER BY g.id, s.section_name, sub.subject_name, th.context_activity_id, th.level, th.order_sequence, th.topic_name`
    );

    // Fetch active assessment cycles for the current academic year
    const [assessmentCycles] = await conn.query(
      `SELECT 
         ac.id,
         ac.name,
         ac.context_activity_id,
         g.grade_name,
         s.section_name,
         sub.subject_name,
         sb.batch_name,
         a.name AS activity_name
       FROM assessment_cycles ac
       JOIN academic_years ay ON ay.id = ac.academic_year_id
       LEFT JOIN grades g ON g.id = ac.grade_id
       LEFT JOIN sections s ON s.id = ac.section_id
       LEFT JOIN subjects sub ON sub.id = ac.subject_id
       LEFT JOIN section_batches sb ON sb.id = ac.batch_id
       LEFT JOIN context_activities ca ON ca.id = ac.context_activity_id
       LEFT JOIN activities a ON a.id = ca.activity_id
       WHERE ac.academic_year_id = ? AND ac.is_active = 1
       ORDER BY ac.name`,
      [academicYearId]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('FacultySchedule');

    // Create hidden data sheets for dropdowns
    const facultySheet = workbook.addWorksheet('Faculty');
    const roleSheet = workbook.addWorksheet('Roles');
    const gradeSheet = workbook.addWorksheet('Grades');
    const sectionSheet = workbook.addWorksheet('Sections');
    const subjectSheet = workbook.addWorksheet('Subjects');
    const batchSheet = workbook.addWorksheet('Batches');
    const venueSheet = workbook.addWorksheet('Venues');
    const sessionTypeSheet = workbook.addWorksheet('SessionTypes');
    const assessmentCycleSheet = workbook.addWorksheet('AssessmentCycles');
    const contextActivitySheet = workbook.addWorksheet('ContextActivities');
    const topicSheet = workbook.addWorksheet('Topics');

    // Populate hidden sheets with combined labels
    facultySheet.addRow(['Faculty']);
    faculty.forEach(f => facultySheet.addRow([`${f.roll}[${f.name}]`]));

    roleSheet.addRow(['ActingRole']);
    roleSheet.addRow(['mentor']);
    roleSheet.addRow(['coordinator']);

    gradeSheet.addRow(['Grade']);
    grades.forEach(g => gradeSheet.addRow([g.grade_name]));

    // Sections: Grade, Section (for dependent dropdown by grade)
    sectionSheet.addRow(['Grade', 'Section']);
    sections.forEach(s => sectionSheet.addRow([s.grade_name, s.section_name]));

    // Subjects: key (Grade|Section), Subject (for dependent dropdown by grade+section)
    subjectSheet.addRow(['Key_Grade_Section', 'Subject']);
    subjects.forEach(sub => {
      subjectSheet.addRow([`${sub.grade_name}|${sub.section_name}`, sub.subject_name]);
    });

    // Batches: key (Grade|Section|Subject), Batch (for dependent dropdown by grade+section+subject)
    batchSheet.addRow(['Key_Grade_Section_Subject', 'Batch']);
    batches.forEach(b => {
      batchSheet.addRow([`${b.grade_name}|${b.section_name}|${b.subject_name}`, b.batch_name]);
    });

    // Venue sheet: key (Grade|Section), label with optional batch/activity context
    if (venueMappings.length > 0) {
      venueSheet.addRow(['Key_Grade_Section', 'VenueLabel']);
      venueMappings.forEach(vm => {
        if (!vm.grade_name || !vm.section_name) return;
        const parts = [];
        if (vm.batch_name) parts.push(vm.batch_name);
        if (vm.activity_name) parts.push(vm.activity_name);
        const suffix = parts.length ? `[${parts.join('-')}]` : '';
        venueSheet.addRow([`${vm.grade_name}|${vm.section_name}`, `${vm.venue_name}${suffix}`]);
      });
    } else {
      // Fallback: plain venue names if no mappings yet
      venueSheet.addRow(['Venue']);
      venues.forEach(v => venueSheet.addRow([v.name]));
    }

    sessionTypeSheet.addRow(['SessionType']);
    sessionTypes.forEach(st => sessionTypeSheet.addRow([`${st.name}[${st.eval_name || 'none'}]`]));

    // Context activities sheet: key by Grade|Section|Subject|Batch, label is hierarchical activity path
    const contextActivityRows = [];
    const contextLabelById = new Map();
    const seen = new Set();

    const addContextRow = (key, label) => {
      const uniq = `${key}@@${label}`;
      if (seen.has(uniq)) return;
      seen.add(uniq);
      contextActivityRows.push({ key, label });
    };

    const grouped = {};
    contextActivities.forEach(ca => {
      const gk = `${ca.grade_name}|${ca.section_name}|${ca.subject_name}`;
      if (!grouped[gk]) grouped[gk] = [];
      grouped[gk].push(ca);
    });

    Object.entries(grouped).forEach(([groupKey, activities]) => {
      const byParent = new Map();
      activities.forEach(a => {
        const pid = a.parent_context_id || 0;
        if (!byParent.has(pid)) byParent.set(pid, []);
        byParent.get(pid).push(a);
      });

      const walk = (node, path) => {
        const newPath = [...path, node.activity_name];
        const label = newPath.join(' > ');

        addContextRow(`${groupKey}|`, label);

        contextLabelById.set(node.context_activity_id, label);

        batches
          .filter(
            b =>
              `${b.grade_name}|${b.section_name}|${b.subject_name}` === groupKey
          )
          .forEach(b =>
            addContextRow(`${groupKey}|${b.batch_name}`, label)
          );

        (byParent.get(node.context_activity_id) || []).forEach(child =>
          walk(child, newPath)
        );
      };

      (byParent.get(0) || []).forEach(root => walk(root, []));
    });
    contextActivityRows.sort((a, b) => {
      if (a.key !== b.key) {
        return a.key.localeCompare(b.key); // group same keys together
      }
      return a.label.localeCompare(b.label); // stable ordering
    });

    contextActivitySheet.addRow([
      'Key_Grade_Section_Subject_Batch',
      'ContextActivityLabel'
    ]);
    contextActivityRows.forEach(r =>
      contextActivitySheet.addRow([r.key, r.label])
    );

    // Topics sheet: key is Grade|Section|Subject|Batch|ContextActivityLabel
    topicSheet.addRow([
      'Key_Grade_Section_Subject_Batch_ContextActivity',
      'TopicLabel'
    ]);

    // Build complete topic map first (includes ALL topics regardless of context)
    const topicMap = new Map();
    topics.forEach(t => topicMap.set(t.id, t));

    const getTopicPath = (topicId) => {
      const names = [];
      let currentId = topicId;
      let guard = 0;
      while (currentId && guard < 100) {
        const topic = topicMap.get(currentId);
        if (!topic) break;
        names.unshift(topic.topic_name || topic.topic_code || `Topic-${topic.id}`);
        currentId = topic.parent_id;
        guard++;
      }
      return names.join(' > ');
    };

    const topicRows = [];
    if (topics.length > 0) {
      topics.forEach(t => {
        const label = contextLabelById.get(t.context_activity_id);
        if (!label) return; // skip if context not represented

        const baseKey = `${t.grade_name}|${t.section_name}|${t.subject_name}|`;
        const topicLabel = getTopicPath(t.id);

        // Add for "no batch" key
        topicRows.push({ key: `${baseKey}${''}|${label}`, label: topicLabel });
        

        // Add for each batch under the same grade/section/subject (optional)
        batches
          .filter(
            b =>
              b.grade_name === t.grade_name &&
              b.section_name === t.section_name &&
              b.subject_name === t.subject_name
          )
          .forEach(b => {
            topicRows.push({ key: `${t.grade_name}|${t.section_name}|${t.subject_name}|${b.batch_name}|${label}`, label: topicLabel });
          });
      });
    }

    // Ensure all rows with the same key are contiguous for Excel OFFSET/MATCH/COUNTIF
    topicRows.sort((a, b) => {
      if (a.key !== b.key) return a.key.localeCompare(b.key);
      return a.label.localeCompare(b.label);
    });

    topicRows.forEach(r => topicSheet.addRow([r.key, r.label]));

    // console.log([...new Set(contextActivityRows.map(r => r.label))]);

    // Assessment cycles sheet with key (Grade|Section|Subject|Batch|Activity) and contextual label
    // Build a map for quick lookup of context activities
    const ctxMap = new Map();
    contextActivities.forEach(ca => {
      ctxMap.set(ca.context_activity_id, ca);
    });

    const buildActivityPath = (ctx) => {
      const names = [];
      let current = ctx;
      while (current) {
        names.unshift(current.activity_name);
        current = current.parent_context_id ? ctxMap.get(current.parent_context_id) : null;
      }
      return names.join(' > ');
    };

    assessmentCycleSheet.addRow([
      'Key_Grade_Section_Subject_Batch_Activity',
      'AssessmentCycleLabel[Grade-Section-Subject-Batch-Activity]',
    ]);
    assessmentCycles.forEach(ac => {
      // Build activity label using the same hierarchical path as ContextActivities sheet when possible
      let activityLabel = ac.activity_name || '';
      if (ac.context_activity_id && ctxMap.has(ac.context_activity_id)) {
        const ctx = ctxMap.get(ac.context_activity_id);
        activityLabel = buildActivityPath(ctx);
      }

      const key = `${ac.grade_name || ''}|${ac.section_name || ''}|${ac.subject_name || ''}|${ac.batch_name || ''}|${activityLabel || ''}`;
      const parts = [];
      if (ac.grade_name) parts.push(ac.grade_name);
      if (ac.section_name) parts.push(ac.section_name);
      if (ac.subject_name) parts.push(ac.subject_name);
      if (ac.batch_name) parts.push(ac.batch_name);
      if (activityLabel) parts.push(activityLabel);
      const suffix = parts.length ? `[${parts.join('-')}]` : '';
      assessmentCycleSheet.addRow([key, `${ac.name}${suffix}`]);
    });

    // Hide the data sheets
    facultySheet.state = 'veryHidden';
    roleSheet.state = 'veryHidden';
    gradeSheet.state = 'veryHidden';
    sectionSheet.state = 'veryHidden';
    subjectSheet.state = 'veryHidden';
    batchSheet.state = 'veryHidden';
    venueSheet.state = 'veryHidden';
    sessionTypeSheet.state = 'veryHidden';
    assessmentCycleSheet.state = 'veryHidden';
    contextActivitySheet.state = 'veryHidden';
    topicSheet.state = 'veryHidden';

    // Main sheet columns
    sheet.columns = [
      { header: 'FacultyRollno*', key: 'faculty_rollno', width: 16 },
      { header: 'ActingRole* (mentor/coordinator)', key: 'acting_role', width: 22 },
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
      { header: 'ContextActivity', key: 'context_activity_name', width: 30 },
      { header: 'Topic', key: 'topic_name', width: 28 },
      { header: 'AssessmentCycleName', key: 'assessment_cycle_name', width: 25 },
      { header: 'TaskDescription', key: 'task_description', width: 40 },
    ];

    sheet.getRow(1).font = { bold: true };

    // Add data validation (dropdowns) for 100 rows
    for (let i = 2; i <= 101; i++) {
      // Faculty dropdown (roll[name])
      sheet.getCell(`A${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Faculty!$A$2:$A$${faculty.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Faculty',
        error: 'Please select a faculty from the list (roll[name])'
      };

      // Acting role dropdown
      sheet.getCell(`B${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['Roles!$A$2:$A$3'],
        showErrorMessage: true,
        errorTitle: 'Invalid Acting Role',
        error: 'Please select acting role as mentor or coordinator',
      };

      // Grade dropdown
      sheet.getCell(`F${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Grades!$A$2:$A$${grades.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Grade',
        error: 'Please select a grade from the list'
      };

      // Section dropdown: only sections for selected grade (F)
      if (sections.length > 0) {
        sheet.getCell(`G${i}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [
            `OFFSET(Sections!$B$2, MATCH($F${i}, Sections!$A$2:$A$${sections.length + 1}, 0)-1, 0, ` +
            `COUNTIF(Sections!$A$2:$A$${sections.length + 1}, $F${i}), 1)`,
          ],
          showErrorMessage: true,
          errorTitle: 'Invalid Section',
          error: 'Please select a section for the chosen grade',
        };
      }

      // Subject dropdown: only subjects for selected grade (F) and section (G)
      if (subjects.length > 0) {
        sheet.getCell(`H${i}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [
            `OFFSET(Subjects!$B$2, MATCH($F${i}&"|"&$G${i}, Subjects!$A$2:$A$${subjects.length + 1}, 0)-1, 0, ` +
            `COUNTIF(Subjects!$A$2:$A$${subjects.length + 1}, $F${i}&"|"&$G${i}), 1)`,
          ],
          showErrorMessage: true,
          errorTitle: 'Invalid Subject',
          error: 'Please select a subject for the chosen grade and section',
        };
      }

      // Batch dropdown: only batches for selected grade (F), section (G) and subject (H)
      if (batches.length > 0) {
        sheet.getCell(`I${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [
            `OFFSET(Batches!$B$2, MATCH($F${i}&"|"&$G${i}&"|"&$H${i}, Batches!$A$2:$A$${batches.length + 1}, 0)-1, 0, ` +
            `COUNTIF(Batches!$A$2:$A$${batches.length + 1}, $F${i}&"|"&$G${i}&"|"&$H${i}), 1)`,
          ],
          showErrorMessage: true,
          errorTitle: 'Invalid Batch',
          error: 'Please select a batch for the chosen grade, section and subject',
        };
      }

      // Venue dropdown: only venues mapped for selected grade (F) and section (G) when mappings exist
      if (venueMappings.length > 0) {
        sheet.getCell(`J${i}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [
            `OFFSET(Venues!$B$2, MATCH($F${i}&"|"&$G${i}, Venues!$A$2:$A$${venueMappings.length + 1}, 0)-1, 0, ` +
            `COUNTIF(Venues!$A$2:$A$${venueMappings.length + 1}, $F${i}&"|"&$G${i}), 1)`,
          ],
          showErrorMessage: true,
          errorTitle: 'Invalid Venue',
          error: 'Please select a venue for the chosen grade and section',
        };
      } else {
        // Fallback: plain venue list without academic context
        sheet.getCell(`J${i}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [`Venues!$A$2:$A$${venues.length + 1}`],
          showErrorMessage: true,
          errorTitle: 'Invalid Venue',
          error: 'Please select a venue from the list',
        };
      }

      // SessionType dropdown (label includes evaluation mode)
      sheet.getCell(`K${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`SessionTypes!$A$2:$A$${sessionTypes.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Session Type',
        error: 'Please select a valid session type'
      };


      // ContextActivity dropdown: only context activities for selected grade/section/subject/batch
      if (contextActivityRows.length > 0) {
        sheet.getCell(`M${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [
            `OFFSET(ContextActivities!$B$2, MATCH($F${i}&"|"&$G${i}&"|"&$H${i}&"|"&$I${i}, ` +
            `ContextActivities!$A$2:$A$${contextActivityRows.length + 1}, 0)-1, 0, ` +
            `COUNTIF(ContextActivities!$A$2:$A$${contextActivityRows.length + 1}, $F${i}&"|"&$G${i}&"|"&$H${i}&"|"&$I${i}), 1)`,
          ],
          showErrorMessage: true,
          errorTitle: 'Invalid Context Activity',
          error: 'Please select a valid context activity for the chosen grade/section/subject/batch',
        };
      }

      // Topic dropdown: only topics for selected grade/section/subject/batch/context_activity
      sheet.getCell(`N${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [
          `OFFSET(Topics!$B$2, MATCH($F${i}&"|"&$G${i}&"|"&$H${i}&"|"&$I${i}&"|"&$M${i}, ` +
          `Topics!$A$2:$A$${topicRows.length + 1}, 0)-1, 0, ` +
          `COUNTIF(Topics!$A$2:$A$${topicRows.length + 1}, $F${i}&"|"&$G${i}&"|"&$H${i}&"|"&$I${i}&"|"&$M${i}), 1)`,
        ],
        showErrorMessage: true,
        errorTitle: 'Invalid Topic',
        error: 'Please select a topic for the chosen grade/section/subject/context activity',
      };

      // AssessmentCycle dropdown: only cycles for selected grade/section/subject/batch/context_activity
      if (assessmentCycles.length > 0) {
        sheet.getCell(`O${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [
            `OFFSET(AssessmentCycles!$B$2, MATCH($F${i}&"|"&$G${i}&"|"&$H${i}&"|"&$I${i}&"|"&$M${i}, ` +
            `AssessmentCycles!$A$2:$A$${assessmentCycles.length + 1}, 0)-1, 0, ` +
            `COUNTIF(AssessmentCycles!$A$2:$A$${assessmentCycles.length + 1}, $F${i}&"|"&$G${i}&"|"&$H${i}&"|"&$I${i}&"|"&$M${i}), 1)`,
          ],
          showErrorMessage: true,
          errorTitle: 'Invalid Assessment Cycle',
          error: 'Please select a valid assessment cycle for the chosen grade/section/subject/batch/context activity',
        };
      }
    }

    // Add example row
    sheet.addRow({
      faculty_rollno: faculty.length > 0 ? `${faculty[0].roll}[${faculty[0].name}]` : 'F1001[John Doe]',
      acting_role: 'mentor',
      date: '2025-12-20',
      start_time: '09:00',
      end_time: '09:50',
      grade_name: grades.length > 0 ? grades[0].grade_name : 'Grade 1',
      section_name: sections.length > 0 ? sections[0].section_name : 'A',
      subject_name: subjects.length > 0 ? subjects[0].subject_name : 'Mathematics',
      batch_name: batches.length > 0 ? batches[0].batch_name : '',
      venue_name:
        venueMappings.length > 0
          ? (() => {
            const vm = venueMappings[0];
            const parts = [];
            if (vm.batch_name) parts.push(vm.batch_name);
            if (vm.activity_name) parts.push(vm.activity_name);
            const suffix = parts.length ? `[${parts.join('-')}]` : '';
            return `${vm.venue_name}${suffix}`;
          })()
          : (venues.length > 0 ? venues[0].name : 'Room 101'),
      session_type: sessionTypes.length > 0 ? sessionTypes[0].name : 'class',
      total_marks: '',
      context_activity_name: contextActivityRows.length > 0 ? contextActivityRows[0].label : '',
      topic_name: topics.length > 0 ? (topics[0].topic_name || topics[0].topic_code || 'Topic 1') : '',
      assessment_cycle_name:
        assessmentCycles.length > 0
          ? (() => {
            const ac = assessmentCycles[0];
            // Build hierarchical activity label if possible
            let activityLabel = ac.activity_name || '';
            if (ac.context_activity_id && ctxMap.has(ac.context_activity_id)) {
              const ctx = ctxMap.get(ac.context_activity_id);
              activityLabel = buildActivityPath(ctx);
            }

            const parts = [];
            if (ac.grade_name) parts.push(ac.grade_name);
            if (ac.section_name) parts.push(ac.section_name);
            if (ac.subject_name) parts.push(ac.subject_name);
            if (ac.batch_name) parts.push(ac.batch_name);
            if (activityLabel) parts.push(activityLabel);
            const suffix = parts.length ? `[${parts.join('-')}]` : '';
            return `${ac.name}${suffix}`;
          })()
          : '',
      task_description: 'Regular class session',
    });

    if (conn) conn.release();

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="faculty_schedule_template.xlsx"');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error generating faculty schedule template:', err);
    if (conn) conn.release();
  }
};

// Helper to fetch single row
async function fetchSingle(conn, sql, params) {
  const [rows] = await conn.query(sql, params);
  return rows && rows.length ? rows[0] : null;
}

// Upload faculty schedule from Excel and create faculty & student schedules
exports.uploadMentorSchedule = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = { processed: 0, succeeded: 0, failed: [] };

  let conn;

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet =
      workbook.getWorksheet('FacultySchedule') ||
      workbook.getWorksheet('MentorSchedule') ||
      workbook.worksheets[0];

    if (!sheet) {
      return res.status(400).json({ success: false, message: 'Invalid Excel: No worksheet found' });
    }

    conn = await db.getConnection();
    const academicYearId = req.activeAcademicYearId;

    // Pre-fetch session types with their evaluation modes (active)
    const [sessionTypes] = await conn.query(
      `SELECT st.id, st.name, st.is_student_facing, em.name AS eval_name,
              em.requires_marks, em.requires_attentiveness
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

    // Helpers to reliably normalize Excel values
    const extractPrimitive = (v) => {
      if (v && typeof v === 'object') {
        if ('result' in v) return v.result;
        if ('text' in v) return v.text;
        if (v.richText) return v.richText.map(r => r.text).join('');
      }
      return v;
    };

    const toYMD = (cell) => {
      const pad = (n) => String(n).padStart(2, '0');
      if (cell && typeof cell.text === 'string') {
        const t = cell.text.trim();
        const isoLike = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoLike) return t;
      }
      const val = cell ? cell.value : null;
      const prim = extractPrimitive(val);
      if (!prim) return '';
      if (prim instanceof Date) {
        // Prefer UTC to avoid TZ drift
        const y = prim.getUTCFullYear();
        const m = pad(prim.getUTCMonth() + 1);
        const d = pad(prim.getUTCDate());
        return `${y}-${m}-${d}`;
      }
      if (typeof prim === 'number') {
        // Excel serial date to JS Date: Unix epoch = (val - 25569) days
        const jsDate = new Date(Math.round((prim - 25569) * 86400 * 1000));
        const y = jsDate.getUTCFullYear();
        const m = pad(jsDate.getUTCMonth() + 1);
        const d = pad(jsDate.getUTCDate());
        return `${y}-${m}-${d}`;
      }
      if (typeof prim === 'string') {
        // Try direct YYYY-MM-DD first
        const isoLike2 = prim.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoLike2) return prim;
        // Try parse via Date
        const parsed = new Date(prim);
        if (!isNaN(parsed.getTime())) {
          const y = parsed.getUTCFullYear();
          const m = pad(parsed.getUTCMonth() + 1);
          const d = pad(parsed.getUTCDate());
          return `${y}-${m}-${d}`;
        }
      }
      return '';
    };

    const toHHMM = (cell) => {
      const pad = (n) => String(n).padStart(2, '0');
      if (cell && typeof cell.text === 'string') {
        const t = cell.text.trim();
        const m1 = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
        if (m1) {
          let hh = parseInt(m1[1], 10);
          const mm = Math.min(59, parseInt(m1[2], 10));
          const ampm = m1[3] ? m1[3].toUpperCase() : '';
          if (ampm === 'PM' && hh < 12) hh += 12;
          if (ampm === 'AM' && hh === 12) hh = 0;
          return `${pad(Math.min(23, hh))}:${pad(mm)}`;
        }
      }
      const val = cell ? cell.value : null;
      const prim = extractPrimitive(val);
      if (!prim && prim !== 0) return '';
      if (prim instanceof Date) {
        // Use UTC to avoid TZ drift
        const h = pad(prim.getUTCHours());
        const m = pad(prim.getUTCMinutes());
        return `${h}:${m}`;
      }
      if (typeof prim === 'number') {
        // Excel time as fraction of day (or date+time). Use fractional part.
        const frac = prim % 1;
        const totalMinutes = Math.round(frac * 24 * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${pad(h)}:${pad(m)}`;
      }
      if (typeof prim === 'string') {
        // Accept HH:MM, HH:MM:SS, or a parsable Date string
        const m1 = prim.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
        if (m1) {
          const h = pad(Math.min(23, parseInt(m1[1], 10)));
          const m = pad(Math.min(59, parseInt(m1[2], 10)));
          return `${h}:${m}`;
        }
        const parsed = new Date(prim);
        if (!isNaN(parsed.getTime())) {
          const h = pad(parsed.getUTCHours());
          const m = pad(parsed.getUTCMinutes());
          return `${h}:${m}`;
        }
      }
      return '';
    };

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      // Skip empty
      if (!row.getCell(1).value) continue;
      results.processed++;

      try {
        // Faculty value like F1001[Name] -> extract roll before '['
        const facultyCellRaw = String(row.getCell(1).value || '').trim();
        const facultyRollno = facultyCellRaw.includes('[') ? facultyCellRaw.split('[')[0].trim() : facultyCellRaw;
        const actingRoleRaw = String(row.getCell(2).value || '').trim().toLowerCase();
        const dateStr = toYMD(row.getCell(3));
        const startTimeStr = toHHMM(row.getCell(4));
        const endTimeStr = toHHMM(row.getCell(5));
        const gradeName = String(row.getCell(6).value || '').trim();
        // Section value like SectionA[Grade1] -> take text before '['
        const sectionRaw = String(row.getCell(7).value || '').trim();
        const sectionName = sectionRaw.includes('[') ? sectionRaw.split('[')[0].trim() : sectionRaw;
        // Subject value like Maths[Grade1-SectionA] -> take text before '['
        const subjectRaw = String(row.getCell(8).value || '').trim();
        const subjectName = subjectRaw.includes('[') ? subjectRaw.split('[')[0].trim() : subjectRaw;
        // Batch value like BatchA[Grade1-SectionA-Maths] -> take text before '['
        const batchRaw = String(row.getCell(9).value || '').trim();
        const batchName = batchRaw.includes('[') ? batchRaw.split('[')[0].trim() : batchRaw; // Single batch now
        const venueName = String(row.getCell(10).value || '').trim();
        const sessionTypeRaw = String(row.getCell(11).value || '').trim().toLowerCase();
        const totalMarksCell = row.getCell(12).value;
        const contextActivityRaw = String(row.getCell(13).value || '').trim();
        const topicRaw = String(row.getCell(14).value || '').trim();
        const assessmentCycleRaw = String(row.getCell(15).value || '').trim();
        const taskDescription = String(row.getCell(16).value || '').trim();

        if (!facultyRollno || !actingRoleRaw || !dateStr || !startTimeStr || !endTimeStr || !gradeName || !sectionName || !subjectName || !venueName) {
          results.failed.push({ row: i, reason: 'Missing required fields' });
          continue;
        }

        const actingRole = actingRoleRaw === 'coordinator' ? 'coordinator' : actingRoleRaw === 'mentor' ? 'mentor' : null;
        if (!actingRole) {
          results.failed.push({ row: i, reason: `Invalid acting role: ${actingRoleRaw}` });
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
        // Determine evaluation mode for student schedules based on evaluation_modes flags
        let evaluationMode = 'none';
        if (sessionTypeRow.requires_marks) {
          evaluationMode = 'marks';
        } else if (sessionTypeRow.requires_attentiveness) {
          evaluationMode = 'attentiveness';
        }
        const totalMarks = totalMarksCell ? parseInt(totalMarksCell, 10) : null;

        // Resolve faculty by rollno
        const facultyRow = await fetchSingle(
          conn,
          `SELECT id FROM faculty WHERE roll = ?`,
          [facultyRollno]
        );
        if (!facultyRow) {
          results.failed.push({ row: i, reason: `Faculty not found for rollno ${facultyRollno}` });
          continue;
        }
        const facultyId = facultyRow.id;

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

        // Resolve venue by name (strip any [Grade-Section-Batch-Activity] suffix from dropdown label)
        const venueBaseName = venueName.includes('[') ? venueName.split('[')[0].trim() : venueName;
        const venueRow = await fetchSingle(conn, 'SELECT id FROM venues WHERE name = ?', [venueBaseName]);
        if (!venueRow) {
          results.failed.push({ row: i, reason: `Unknown venue: ${venueName}` });
          continue;
        }

        // Optional context activity
        let contextActivityId = null;
        const contextActivityLabel = contextActivityRaw;
        if (contextActivityLabel) {
          // Match by activity path leaf name (last segment) within grade/section/subject
          const leafName = contextActivityLabel.includes('>')
            ? contextActivityLabel.split('>').pop().trim()
            : contextActivityLabel.trim();
          const ctxRow = await fetchSingle(
            conn,
            `SELECT ca.id
             FROM context_activities ca
             JOIN activities a ON a.id = ca.activity_id
             WHERE ca.grade_id = ? AND ca.section_id = ? AND ca.subject_id = ? AND a.name = ?`,
            [gradeRow.id, sectionRow.id, subjectRow.id, leafName]
          );
          if (!ctxRow) {
            results.failed.push({ row: i, reason: `Unknown context activity: ${contextActivityLabel} for ${gradeName}/${sectionName}/${subjectName}` });
            continue;
          }
          contextActivityId = ctxRow.id;
        }

        // Optional topic resolution by full hierarchical path for the chosen context activity
        let topicId = null;
        if (topicRaw) {
          if (!contextActivityId) {
            results.failed.push({ row: i, reason: `Topic provided without a valid Context Activity: ${topicRaw}` });
            continue;
          }
          const [topicList] = await conn.query(
            `SELECT id, topic_name, parent_id, topic_code
             FROM topic_hierarchy
             WHERE context_activity_id = ?`,
            [contextActivityId]
          );
          const tMap = new Map();
          topicList.forEach(t => tMap.set(t.id, t));
          const buildPath = (id) => {
            const names = [];
            let current = id;
            let guard = 0;
            while (current && guard < 100) {
              const t = tMap.get(current);
              if (!t) break;
              names.unshift(t.topic_name || t.topic_code || `Topic-${t.id}`);
              current = t.parent_id;
              guard++;
            }
            return names.join(' > ');
          };
          for (const t of topicList) {
            const path = buildPath(t.id);
            if (path === topicRaw) {
              topicId = t.id;
              break;
            }
          }
          if (!topicId) {
            results.failed.push({ row: i, reason: `Unknown topic: ${topicRaw} under selected context activity` });
            continue;
          }
        }

        // Validate date is not a holiday in academic calendar
        const acRow = await fetchSingle(
          conn,
          `SELECT ac.id, dt.day_type
           FROM academic_calendar ac
           LEFT JOIN ac_day_types dt ON dt.id = ac.day_type
           WHERE ac.academic_year = ? AND ac.date = ?`,
          [academicYearId, dateStr]
        );
        if (!acRow) {
          results.failed.push({ row: i, reason: `No academic calendar entry for date ${dateStr}` });
          continue;
        }
        const dayType = (acRow.day_type || '').toLowerCase();
        if (dayType.includes('holiday')) {
          results.failed.push({ row: i, reason: `Date ${dateStr} is marked as holiday in academic calendar` });
          continue;
        }

        // Optional assessment cycle
        // Extract plain assessment cycle name (before any [context] suffix)
        const assessmentCycleName = assessmentCycleRaw.includes('[')
          ? assessmentCycleRaw.split('[')[0].trim()
          : assessmentCycleRaw;

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
               (name, academic_year_id, grade_id, section_id, subject_id, frequency, period_start, period_end,
                default_total_marks, is_active, created_by)
               VALUES (?, ?, ?, ?, ?, 'custom', NULL, NULL, ?, 1, NULL)`,
              [assessmentCycleName, academicYearId, gradeRow.id, sectionRow.id, subjectRow.id, totalMarks || null]
            );
            assessmentCycleId = ins.insertId;
          }
        }

        // Check for time overlap in faculty_calendar for this faculty/date
        const overlap = await fetchSingle(
          conn,
          `SELECT id
           FROM faculty_calendar
           WHERE academic_year = ? AND faculty_id = ? AND date = ?
             AND NOT (end_time <= ? OR start_time >= ?)` ,
          [academicYearId, facultyId, dateStr, startTimeStr, endTimeStr]
        );
        if (overlap) {
          results.failed.push({ row: i, reason: 'Time overlap with existing session for this faculty' });
          continue;
        }

        // Start transaction per row to keep failures isolated
        await conn.beginTransaction();

        // Insert faculty session
        const [sessionRes] = await conn.query(
          `INSERT INTO faculty_calendar
           (faculty_id, acting_role, academic_year, date, start_time, end_time,
            venue_id, grade_id, section_id, subject_id,
            context_activity_id, section_activity_topic_id, session_type_id,
            topic_id, task_description, assessment_cycle_id, total_marks, status, is_rescheduled)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, 'scheduled', 0)` ,
          [
            facultyId,
            actingRole,
            academicYearId,
            dateStr,
            startTimeStr,
            endTimeStr,
            venueRow.id,
            gradeRow.id,
            sectionRow.id,
            subjectRow.id,
            contextActivityId || null,
            sessionTypeId,
            topicId || null,
            taskDescription || null,
            assessmentCycleId || null,
            totalMarks || null,
          ]
        );

        const facultyCalendarId = sessionRes.insertId;

        // Determine students for this session (by batch if provided, else by section)
        let students = [];
        let batchIdForStudents = null;

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
          batchIdForStudents = batchRow.id;
          await conn.query(
            'INSERT INTO session_batches (faculty_calendar_id, batch_id) VALUES (?, ?)',
            [facultyCalendarId, batchRow.id]
          );
          const [stuRows] = await conn.query(
            `SELECT sba.student_id
             FROM student_batch_assignments sba
             WHERE sba.academic_year = ? AND sba.batch_id = ?`,
            [academicYearId, batchIdForStudents]
          );
          students = stuRows;
        };
        const scheduleType = scheduleTypeMap[sessionType] || 'class_session';

        if (!batchIdForStudents) {
          const [stuRows] = await conn.query(
            `SELECT sm.student_id
             FROM student_mappings sm
             WHERE sm.academic_year = ? AND sm.section_id = ?`,
            [academicYearId, sectionRow.id]
          );
          students = stuRows;
        }

        // Insert student schedules for this session if the session type is student facing
        if (sessionTypeRow.is_student_facing && students.length > 0) {
          // Optionally resolve mentor_id for student_schedule_calendar when acting_role is mentor
          let mentorIdForStudents = null;
          if (actingRole === 'mentor') {
            const mentorRow = await fetchSingle(
              conn,
              'SELECT id FROM mentors WHERE faculty_id = ?',
              [facultyId]
            );
            mentorIdForStudents = mentorRow ? mentorRow.id : null;
          }

          for (const s of students) {
            await conn.query(
              `INSERT INTO student_schedule_calendar
						 (student_id, grade_id, section_id, subject_id, mentor_id, context_activity_id, section_activity_topic_id,
							 task_description, date, start_time, end_time, venue_id, schedule_type, status, attendance, remarks,
							 created_at, faculty_calendar_id, evaluation_mode, total_marks)
						 VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, 'scheduled', 'present', '', NOW(), ?, ?, ?)`,
              [
                s.student_id,
                gradeRow.id,
                sectionRow.id,
                subjectRow.id,
                mentorIdForStudents,
                contextActivityId,
                taskDescription || null,
                dateStr,
                startTimeStr,
                endTimeStr,
                venueRow.id,
                scheduleType,
                facultyCalendarId,
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

    return res.json({ success: true, message: 'Faculty schedule upload completed', data: results });
  } catch (error) {
    console.error('Faculty schedule upload error:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to upload faculty schedule', error: error.message });
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

// ---- Assessment cycles management ----

// Get assessment cycles for current academic year (optional filters)
exports.getAssessmentCycles = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const academicYearId = req.activeAcademicYearId;
    const { gradeId, sectionId, subjectId, batchId } = req.body || {};

    let sql = `
      SELECT 
        ac.id,
        ac.name,
        ac.academic_year_id,
        ac.grade_id,
        g.grade_name,
        ac.section_id,
        s.section_name,
        ac.subject_id,
        sub.subject_name,
        ac.batch_id,
        sb.batch_name,
        ac.context_activity_id,
        a.name AS activity_name,
        ac.frequency,
        ac.period_start,
        ac.period_end,
        ac.default_total_marks,
        ac.is_active
      FROM assessment_cycles ac
      JOIN academic_years ay ON ay.id = ac.academic_year_id
      LEFT JOIN grades g ON g.id = ac.grade_id
      LEFT JOIN sections s ON s.id = ac.section_id
      LEFT JOIN subjects sub ON sub.id = ac.subject_id
      LEFT JOIN section_batches sb ON sb.id = ac.batch_id
      LEFT JOIN context_activities ca ON ca.id = ac.context_activity_id
      LEFT JOIN activities a ON a.id = ca.activity_id
      WHERE ac.academic_year_id = ?
    `;
    const params = [academicYearId];

    if (gradeId) {
      sql += ' AND ac.grade_id = ?';
      params.push(gradeId);
    }
    if (sectionId) {
      sql += ' AND ac.section_id = ?';
      params.push(sectionId);
    }
    if (subjectId) {
      sql += ' AND ac.subject_id = ?';
      params.push(subjectId);
    }
    if (batchId) {
      sql += ' AND ac.batch_id = ?';
      params.push(batchId);
    }

    sql += ' ORDER BY ac.name';

    const [rows] = await conn.query(sql, params);
    if (conn) conn.release();
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching assessment cycles:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to fetch assessment cycles', error: error.message });
  }
};

// Create a new assessment cycle
exports.createAssessmentCycle = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const academicYearId = req.activeAcademicYearId;
    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }

    const {
      name,
      gradeId,
      sectionId,
      subjectId,
      batchId,
      contextActivityId,
      frequency,
      periodStart,
      periodEnd,
      defaultTotalMarks,
      isActive,
    } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const freq = frequency && ['daily', 'weekly', 'monthly', 'term', 'custom'].includes(frequency)
      ? frequency
      : 'custom';

    // Optional: basic period validation
    if (periodStart && periodEnd && periodStart > periodEnd) {
      return res.status(400).json({ success: false, message: 'Period start cannot be after period end' });
    }

    const isActiveFlag = typeof isActive === 'boolean' || typeof isActive === 'number'
      ? (isActive ? 1 : 0)
      : 1;

    const [result] = await conn.query(
      `INSERT INTO assessment_cycles 
         (name, academic_year_id, grade_id, section_id, subject_id, batch_id, context_activity_id,
          frequency, period_start, period_end, default_total_marks, created_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        name.trim(),
        academicYearId,
        gradeId || null,
        sectionId || null,
        subjectId || null,
        batchId || null,
        contextActivityId || null,
        freq,
        periodStart || null,
        periodEnd || null,
        defaultTotalMarks || null,
        userId,
        isActiveFlag,
      ]
    );

    if (conn) conn.release();
    return res.json({ success: true, message: 'Assessment cycle created', id: result.insertId });
  } catch (error) {
    console.error('Error creating assessment cycle:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to create assessment cycle', error: error.message });
  }
};

// Update an existing assessment cycle
exports.updateAssessmentCycle = async (req, res) => {
  try {
    const {
      id,
      name,
      gradeId,
      sectionId,
      subjectId,
      batchId,
      contextActivityId,
      frequency,
      periodStart,
      periodEnd,
      defaultTotalMarks,
      isActive,
    } = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, message: 'Assessment cycle id is required' });
    }

    const [rows] = await db.query('SELECT * FROM assessment_cycles WHERE id = ?', [id]);
    if (!rows || !rows.length) {
      return res.status(404).json({ success: false, message: 'Assessment cycle not found' });
    }
    const current = rows[0];

    const finalName = name !== undefined ? name.trim() : current.name;
    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const freq = frequency && ['daily', 'weekly', 'monthly', 'term', 'custom'].includes(frequency)
      ? frequency
      : current.frequency || 'custom';

    const finalPeriodStart = periodStart !== undefined ? (periodStart || null) : current.period_start;
    const finalPeriodEnd = periodEnd !== undefined ? (periodEnd || null) : current.period_end;
    if (finalPeriodStart && finalPeriodEnd && finalPeriodStart > finalPeriodEnd) {
      return res.status(400).json({ success: false, message: 'Period start cannot be after period end' });
    }

    const finalGradeId = gradeId !== undefined ? (gradeId || null) : current.grade_id;
    const finalSectionId = sectionId !== undefined ? (sectionId || null) : current.section_id;
    const finalSubjectId = subjectId !== undefined ? (subjectId || null) : current.subject_id;
    const finalBatchId = batchId !== undefined ? (batchId || null) : current.batch_id;
    const finalContextActivityId = contextActivityId !== undefined ? (contextActivityId || null) : current.context_activity_id;
    const finalDefaultMarks = defaultTotalMarks !== undefined ? (defaultTotalMarks || null) : current.default_total_marks;
    const finalIsActive =
      isActive !== undefined
        ? (isActive ? 1 : 0)
        : (current.is_active !== undefined ? current.is_active : 1);

    await db.query(
      `UPDATE assessment_cycles
         SET name = ?, grade_id = ?, section_id = ?, subject_id = ?, batch_id = ?, context_activity_id = ?,
             frequency = ?, period_start = ?, period_end = ?, default_total_marks = ?, is_active = ?
       WHERE id = ?`,
      [
        finalName,
        finalGradeId,
        finalSectionId,
        finalSubjectId,
        finalBatchId,
        finalContextActivityId,
        freq,
        finalPeriodStart,
        finalPeriodEnd,
        finalDefaultMarks,
        finalIsActive,
        id,
      ]
    );

    return res.json({ success: true, message: 'Assessment cycle updated' });
  } catch (error) {
    console.error('Error updating assessment cycle:', error);
    return res.status(500).json({ success: false, message: 'Failed to update assessment cycle', error: error.message });
  }
};

// Hard delete assessment cycle
exports.deleteAssessmentCycle = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, message: 'Assessment cycle id is required' });
    }

    await db.query('DELETE FROM assessment_cycles WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Assessment cycle deleted' });
  } catch (error) {
    console.error('Error deleting assessment cycle:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete assessment cycle', error: error.message });
  }
};

