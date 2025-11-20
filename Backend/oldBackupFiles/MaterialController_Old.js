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




/*
Old working topic material excel upload code kept for reference
*/
const generateAcademicYearTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Optional filter: gradeId controls which sections to include
    const gradeId = req.query.gradeId || req.body?.gradeId || null;

    // Hidden lookup sheets
    const rowTypeSheet = workbook.addWorksheet('RowTypes');
    rowTypeSheet.state = 'hidden';
    ['RowType'].forEach(h => rowTypeSheet.addRow([h]));
    ['Topic', 'Material', 'BatchDate'].forEach(v => rowTypeSheet.addRow([v]));

    const materialTypesSheet = workbook.addWorksheet('MaterialTypes');
    materialTypesSheet.state = 'hidden';
    materialTypesSheet.addRow(['MaterialType']);
    ['PDF', 'Video', 'Image', 'Text'].forEach(v => materialTypesSheet.addRow([v]));

    const difficultySheet = workbook.addWorksheet('DifficultyLevels');
    difficultySheet.state = 'hidden';
    difficultySheet.addRow(['Difficulty']);
    ['Easy', 'Medium', 'Hard'].forEach(v => difficultySheet.addRow([v]));


    // Sections to include (by selected grade if provided)
    const [sections] = await db.query(
      gradeId
        ? `SELECT id, section_name FROM sections WHERE grade_id = ? AND is_active = 1 ORDER BY section_name`
        : `SELECT id, section_name FROM sections WHERE is_active = 1 ORDER BY section_name`,
      gradeId ? [gradeId] : []
    );

    // Hidden meta to map sheet name -> section_id
    const sectionMeta = workbook.addWorksheet('SectionMeta');
    sectionMeta.state = 'hidden';
    sectionMeta.addRow(['SheetName', 'SectionId']);

    // Helper to convert column index to Excel letter (1 -> A)
    const colLetter = (n) => {
      let s = '';
      while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
      return s;
    };
    const sanitize = (name) => (name || '').toString().replace(/[^A-Za-z0-9]/g, '_');

    // For each section, prepare per-section lookup lists (root activities + full paths)
    for (const sec of sections) {
      const secId = sec.id;
      const secName = sec.section_name;
      const subjectsSheet = workbook.addWorksheet(`Subjects_${secId}`);
      subjectsSheet.state = 'hidden';
      subjectsSheet.addRow(['Subject']);

      const activitiesSheet = workbook.addWorksheet(`Activities_${secId}`);
      activitiesSheet.state = 'hidden';
      // dynamic columns per subject; first row headers are sanitized subject keys (listing ROOT activities only)

      const batchesSheet = workbook.addWorksheet(`Batches_${secId}`);
      batchesSheet.state = 'hidden';
      // dynamic columns per subject; first row headers are sanitized subject keys

      const activityPathsSheet = workbook.addWorksheet(`ActivityPaths_${secId}`);
      activityPathsSheet.state = 'hidden';
      // dynamic columns per subject; first row headers are sanitized subject keys (listing child chains excluding root)

      // Subjects for this section
      const [subjects] = await db.query(
        `SELECT DISTINCT sub.subject_name
         FROM subject_section_assignments ssa
         JOIN subjects sub ON ssa.subject_id = sub.id
         WHERE ssa.section_id = ? AND ssa.is_active = 1
         ORDER BY sub.subject_name`,
        [secId]
      );
      subjects.forEach(s => subjectsSheet.addRow([s.subject_name]));

      // All activities (including nested) for this section to build root dropdowns and full paths
      const [allActs] = await db.query(
        `SELECT ca.id, ca.parent_context_id, sub.subject_name, act.name as activity_name
         FROM context_activities ca
         JOIN activities act ON ca.activity_id = act.id
         JOIN subjects sub ON ca.subject_id = sub.id
         WHERE ca.section_id = ?
         ORDER BY sub.subject_name, activity_name`,
        [secId]
      );
      // Batches by subject for this section
      const [batchesAll] = await db.query(
        `SELECT DISTINCT sub.subject_name, sb.batch_name
         FROM section_batches sb
         JOIN subject_section_assignments ssa ON sb.subject_section_id = ssa.id
         JOIN subjects sub ON ssa.subject_id = sub.id
         WHERE ssa.section_id = ? AND sb.is_active = 1
         ORDER BY sub.subject_name, sb.batch_name`,
        [secId]
      );

      // Build maps: root activities + batches
      const actsBySubject = new Map(); // root level only
      const childMap = new Map(); // key: parent_context_id (or 0) -> array of {activity_name}
      allActs.forEach(r => {
        const parentKey = r.parent_context_id ? r.parent_context_id : 0;
        if (!childMap.has(parentKey)) childMap.set(parentKey, []);
        childMap.get(parentKey).push({ id: r.id, name: r.activity_name, subject: r.subject_name });
        if (!r.parent_context_id) { // root
          if (!actsBySubject.has(r.subject_name)) actsBySubject.set(r.subject_name, []);
          actsBySubject.get(r.subject_name).push(r.activity_name);
        }
      });
      const batchesBySubject = new Map();
      batchesAll.forEach(r => { const k = r.subject_name; if (!batchesBySubject.has(k)) batchesBySubject.set(k, []); batchesBySubject.get(k).push(r.batch_name); });

      // Build full paths recursively per (subject, root) so path dropdown filters by selected root
      const roots = allActs.filter(a => !a.parent_context_id);
      const pathColumns = new Map(); // key: subject|rootName -> array of child chains ('' indicates no further depth)
      const traverse = (subject, rootName, pathNames, currentId) => {
        const children = childMap.get(currentId) || [];
        if (children.length === 0) {
          const chainExcludingRoot = pathNames.slice(1).join(' > '); // may be '' if only root
          const key = `${subject}|${rootName}`;
          if (!pathColumns.has(key)) pathColumns.set(key, []);
          pathColumns.get(key).push(chainExcludingRoot);
        } else {
          for (const ch of children) {
            traverse(subject, rootName, [...pathNames, ch.name], ch.id);
          }
        }
      };
      for (const r of roots) {
        traverse(r.subject_name, r.activity_name, [r.activity_name], r.id);
      }
      // Ensure blank entry exists for each (subject, root) so users can select leaf root without children
      pathColumns.forEach((list, key) => { if (!list.includes('')) list.push(''); });
      // Write ActivityPaths columns: header sanitized(subject) + '__' + sanitized(root)
      let apColIdx = 1;
      pathColumns.forEach((list, key) => {
        const [subj, rootName] = key.split('|');
        const header = `${sanitize(subj)}__${sanitize(rootName)}`;
        activityPathsSheet.getRow(1).getCell(apColIdx).value = header;
        list.forEach((val, i) => activityPathsSheet.getRow(2 + i).getCell(apColIdx).value = val);
        apColIdx++;
      });

      // Write Activities columns (header row = sanitized subject key)
      let colIdx = 1;
      actsBySubject.forEach((list, subj) => {
        const header = sanitize(subj);
        activitiesSheet.getRow(1).getCell(colIdx).value = header;
        list.forEach((val, i) => activitiesSheet.getRow(2 + i).getCell(colIdx).value = val);
        colIdx++;
      });

      // (Removed sub-activities sheet usage for infinite depth; path handled via free-text column)

      // Write Batches columns (header row = sanitized subject key)
      colIdx = 1;
      batchesBySubject.forEach((list, subj) => {
        const header = sanitize(subj);
        batchesSheet.getRow(1).getCell(colIdx).value = header;
        list.forEach((val, i) => batchesSheet.getRow(2 + i).getCell(colIdx).value = val);
        colIdx++;
      });

      // Create a visible sheet per section
      const sheetName = `Section_${secName}`.replace(/[^A-Za-z0-9_]/g, '_').substring(0, 31);
      sectionMeta.addRow([sheetName, secId]);
      const ws = workbook.addWorksheet(sheetName);
      ws.columns = [
        { header: 'RowType', key: 'row_type', width: 12 },
        { header: 'Subject', key: 'subject_name', width: 18 },
        { header: 'ActivityRoot', key: 'activity_root', width: 18 },
        { header: 'ActivityPath ("Child A > Child B" or blank)', key: 'activity_path', width: 30 },
        { header: 'TopicCode', key: 'topic_code', width: 16 },
        { header: 'TopicName', key: 'topic_name', width: 26 },
        { header: 'TopicOrder', key: 'topic_order', width: 12 },
        { header: 'MaterialType', key: 'material_type', width: 14 },
        { header: 'MaterialTitle', key: 'material_title', width: 28 },
        { header: 'MaterialURL', key: 'material_url', width: 40 },
        { header: 'EstimatedDuration', key: 'estimated_duration', width: 18 },
        { header: 'DifficultyLevel', key: 'difficulty_level', width: 16 },
        { header: 'HasAssessment (Yes/No)', key: 'has_assessment', width: 18 },
        { header: 'Instructions', key: 'instructions', width: 30 },
        { header: 'BatchName', key: 'batch_name', width: 18 },
        { header: 'ExpectedCompletionDate (YYYY-MM-DD)', key: 'expected_date', width: 26 }
      ];
      ws.getRow(1).font = { bold: true };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4361EE' } };
      ws.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

      // Sample rows
      ws.addRow({ row_type: 'Topic', subject_name: subjects[0]?.subject_name || '', activity_root: actsBySubject.get(subjects[0]?.subject_name || '')?.[0] || '', activity_path: '', topic_code: 'T001', topic_name: 'Sample Topic', topic_order: 1 });
      ws.addRow({ row_type: 'Material', subject_name: subjects[0]?.subject_name || '', activity_root: actsBySubject.get(subjects[0]?.subject_name || '')?.[0] || '', activity_path: '', topic_code: 'T001', material_type: 'Video', material_title: 'Intro Video', material_url: 'https://example.com/video.mp4', estimated_duration: 30, difficulty_level: 'Medium', has_assessment: 'No' });
      ws.addRow({ row_type: 'BatchDate', subject_name: subjects[0]?.subject_name || '', activity_root: actsBySubject.get(subjects[0]?.subject_name || '')?.[0] || '', activity_path: '', topic_code: 'T001', batch_name: '', expected_date: '2025-01-15' });

      // Data validation
      const rowTypeLast = 1 + 3; // 3 values
      ws.getColumn(1).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; cell.dataValidation = { type: 'list', allowBlank: false, formulae: [`'RowTypes'!$A$2:$A$${rowTypeLast}`] }; });
      const mtLast = 1 + 4;
      ws.getColumn(8).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'MaterialTypes'!$A$2:$A$${mtLast}`] }; });
      const diffLast = 1 + 3;
      ws.getColumn(12).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'DifficultyLevels'!$A$2:$A$${diffLast}`] }; });

      // Per-section lists
      const subjLast = subjects.length + 1;
      ws.getColumn(2).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; if (subjects.length > 0) cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`'Subjects_${secId}'!$A$2:$A$${subjLast}`] }; });
      // Root activity dropdown only (ActivityRoot column index 3)
      ws.getColumn(3).eachCell({ includeEmpty: true }, (cell, row) => {
        if (row === 1) return;
        const formula = `OFFSET(Activities_${secId}!$A$2,0, MATCH(SUBSTITUTE($B${row}," ","_"), Activities_${secId}!$1:$1, 0)-1, 1000, 1)`;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
      });
      // ActivityPath dropdown dependent on Subject (col 2) + ActivityRoot (col 3)
      ws.getColumn(4).eachCell({ includeEmpty: true }, (cell, row) => {
        if (row === 1) return;
        const formula = `OFFSET(ActivityPaths_${secId}!$A$2,0, MATCH(SUBSTITUTE($B${row}," ","_")&"__"&SUBSTITUTE($C${row}," ","_"), ActivityPaths_${secId}!$1:$1, 0)-1, 1000, 1)`;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
      });
      ws.getColumn(15).eachCell({ includeEmpty: true }, (cell, row) => {
        if (row === 1) return;
        const formula = `OFFSET(Batches_${secId}!$A$2,0, MATCH(SUBSTITUTE($B${row}," ","_"), Batches_${secId}!$1:$1, 0)-1, 1000, 1)`;
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
      });
      // Date formatting for expected date column
      ws.getColumn(16).eachCell({ includeEmpty: true }, (cell, row) => { if (row === 1) return; cell.numFmt = 'yyyy-mm-dd'; });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=academic_year_template.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating academic year template:', error);
    res.status(500).json({ success: false, message: 'Failed to generate academic year template', error: error.message });
  }
};




const uploadAcademicYearData = async (req, res) => {
  const connection = await db.getConnection();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const activeAcademicYearId = req.activeAcademicYearId;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    // Read SectionMeta to map sheet to sectionId
    const sectionMetaSheet = workbook.getWorksheet('SectionMeta');
    const sheetToSectionId = new Map();
    if (sectionMetaSheet) {
      sectionMetaSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const sName = row.getCell(1).value?.toString();
        const sId = parseInt(row.getCell(2).value);
        if (sName && sId) sheetToSectionId.set(sName, sId);
      });
    }

    // Preload mappings (keyed by section_id)
    const [allContextRows] = await db.query(`
      SELECT ca.id as context_activity_id, ca.section_id, sub.subject_name, act.name as activity_name, ca.parent_context_id
      FROM context_activities ca
      JOIN activities act ON ca.activity_id = act.id
      JOIN subjects sub ON ca.subject_id = sub.id
    `);
    const [batchRows] = await db.query(`
      SELECT sb.id as batch_id, ssa.section_id, sub.subject_name, sb.batch_name
      FROM section_batches sb
      JOIN subject_section_assignments ssa ON sb.subject_section_id = ssa.id
      JOIN subjects sub ON ssa.subject_id = sub.id
      WHERE sb.is_active = 1
    `);

    // Build traversal map: key = section|subject|parentId|name -> context_activity_id (parentId 0 for root)
    const traversalMap = new Map();
    allContextRows.forEach(r => {
      const parentId = r.parent_context_id ? r.parent_context_id : 0;
      traversalMap.set(`${r.section_id}|${r.subject_name}|${parentId}|${r.activity_name}`, r.context_activity_id);
    });
    const batchMap = new Map();
    batchRows.forEach(r => batchMap.set(`${r.section_id}|${r.subject_name}|${r.batch_name}`, r.batch_id));

    const topicCodeToId = new Map();
    const errors = [];
    let topicsCreated = 0, materialsCreated = 0, batchDatesSet = 0;

    await connection.beginTransaction();

    const pendingPromises = [];
    workbook.worksheets.forEach(ws => {
      if (ws.state === 'hidden') return; // skip lookup sheets
      if (!ws.getRow(1) || ws.getRow(1).getCell(1).value !== 'RowType') return; // ensure header sheet

      const sectionId = sheetToSectionId.get(ws.name);
      if (!sectionId) return; // skip unknown sheets

      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // header
        const rowType = (row.getCell(1).value || '').toString().trim();
        if (!rowType) return; // skip empty

        const subject = (row.getCell(2).value || '').toString().trim();
        const rootActivity = (row.getCell(3).value || '').toString().trim();
        const activityPath = (row.getCell(4).value || '').toString().trim();
        const topicCode = (row.getCell(5).value || '').toString().trim();
        const topicName = (row.getCell(6).value || '').toString().trim();
        const topicOrder = parseInt(row.getCell(7).value) || 1;
        const materialType = (row.getCell(8).value || '').toString().trim();
        const materialTitle = (row.getCell(9).value || '').toString().trim();
        const materialUrl = (row.getCell(10).value || '').toString().trim();
        const estimatedDuration = parseInt(row.getCell(11).value) || 30;
        const difficultyLevel = (row.getCell(12).value || 'Medium').toString().trim();
        const hasAssessmentFlag = (row.getCell(13).value || '').toString().toLowerCase() === 'yes';
        const instructions = (row.getCell(14).value || '').toString().trim();
        const batchName = (row.getCell(15).value || '').toString().trim();
        const expectedDateRaw = row.getCell(16).value;

        // Resolve context activity by traversing path segments
        let contextActivityId = null;
        if (rootActivity) {
          const segments = [rootActivity, ...activityPath.split('>').map(s => s.trim()).filter(s => s.length > 0)];
          let parentId = 0; // 0 denotes root (NULL parent)
          for (const seg of segments) {
            const key = `${sectionId}|${subject}|${parentId}|${seg}`;
            const found = traversalMap.get(key);
            if (!found) {
              contextActivityId = null;
              break;
            }
            contextActivityId = found;
            parentId = found; // next parent
          }
        }
        if (!contextActivityId && rowType !== 'BatchDate') {
          errors.push(`Row ${rowNumber} (${ws.name}): Unable to resolve activity path (root='${rootActivity}' path='${activityPath}') for subject '${subject}'`);
          return;
        }

        if (rowType === 'Topic') {
          if (!topicCode || !topicName) { errors.push(`Row ${rowNumber} (${ws.name}): Missing topic code/name`); return; }
          if (topicCodeToId.has(topicCode)) { errors.push(`Row ${rowNumber} (${ws.name}): Duplicate topic code ${topicCode}`); return; }
          // Insert topic
          const p = connection.query(
            `INSERT INTO topic_hierarchy (parent_id, context_activity_id, level, topic_name, topic_code, order_sequence, has_assessment, has_homework, is_bottom_level, expected_completion_days, pass_percentage)
             VALUES (NULL, ?, 1, ?, ?, ?, ?, 0, 1, 7, 60)`,
            [contextActivityId, topicName, topicCode, topicOrder, hasAssessmentFlag ? 1 : 0]
          ).then(([result]) => { topicCodeToId.set(topicCode, result.insertId); topicsCreated++; }).catch(e => { errors.push(`Row ${rowNumber} (${ws.name}): ${e.message}`); });
          pendingPromises.push(p);
        } else if (rowType === 'Material') {
          if (!topicCode) { errors.push(`Row ${rowNumber} (${ws.name}): Missing topic code for material`); return; }
          const topicId = topicCodeToId.get(topicCode);
          if (!topicId) { errors.push(`Row ${rowNumber} (${ws.name}): Topic code ${topicCode} not defined before material row`); return; }
          if (!materialType || !materialUrl) { errors.push(`Row ${rowNumber} (${ws.name}): Missing material type/url`); return; }
          const p = connection.query(
            `INSERT INTO topic_materials (topic_id, material_type, material_title, material_url, estimated_duration, difficulty_level, instructions, has_assessment, order_number, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [topicId, materialType, materialTitle || 'Untitled', materialUrl, estimatedDuration, difficultyLevel, instructions || null, hasAssessmentFlag ? 1 : 0, 1]
          ).then(() => { materialsCreated++; }).catch(e => { errors.push(`Row ${rowNumber} (${ws.name}): ${e.message}`); });
          pendingPromises.push(p);
        } else if (rowType === 'BatchDate') {
          if (!topicCode || !batchName) { errors.push(`Row ${rowNumber} (${ws.name}): Missing topic code or batch name for batch date`); return; }
          const topicId = topicCodeToId.get(topicCode);
          if (!topicId) { errors.push(`Row ${rowNumber} (${ws.name}): Topic code ${topicCode} not defined before batch date row`); return; }
          const batchId = batchMap.get(`${sectionId}|${subject}|${batchName}`);
          if (!batchId) { errors.push(`Row ${rowNumber} (${ws.name}): Batch ${batchName} not found`); return; }
          let expectedDate = null;
          if (expectedDateRaw) {
            if (expectedDateRaw instanceof Date) {
              expectedDate = expectedDateRaw.toISOString().slice(0, 10);
            } else if (typeof expectedDateRaw === 'string') {
              const d = new Date(expectedDateRaw);
              if (isNaN(d.getTime())) { errors.push(`Row ${rowNumber} (${ws.name}): Invalid date ${expectedDateRaw}`); return; }
              expectedDate = d.toISOString().slice(0, 10);
            } else if (typeof expectedDateRaw === 'number') {
              // Excel serialized date
              const d = new Date(Math.round((expectedDateRaw - 25569) * 86400 * 1000));
              expectedDate = d.toISOString().slice(0, 10);
            }
          }
          if (!expectedDate) { errors.push(`Row ${rowNumber} (${ws.name}): Missing/invalid expected date`); return; }
          // Upsert
          const p = connection.query(
            `SELECT id FROM topic_completion_dates WHERE topic_id = ? AND batch_id = ? AND academic_year = ?`,
            [topicId, batchId, activeAcademicYearId]
          ).then(([existing]) => {
            if (existing.length > 0) {
              return connection.query(`UPDATE topic_completion_dates SET expected_completion_date = ? WHERE id = ?`, [expectedDate, existing[0].id]);
            } else {
              return connection.query(`INSERT INTO topic_completion_dates (topic_id, batch_id, expected_completion_date, academic_year) VALUES (?, ?, ?, ?)`, [topicId, batchId, expectedDate, activeAcademicYearId]);
            }
          }).then(() => { batchDatesSet++; }).catch(e => { errors.push(`Row ${rowNumber} (${ws.name}): ${e.message}`); });
          pendingPromises.push(p);
        }
      });
    });
    await Promise.all(pendingPromises);

    if (errors.length > 0) {
      // For safety, rollback everything
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Import encountered errors', errors });
    }
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
