const db = require('../../config/db');
const ExcelJS = require('exceljs');

// Generate Excel template for academic calendar upload
exports.generateAcademicCalendarTemplate = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const academicYearId = req.activeAcademicYearId;

    // Fetch academic year info
    const [academicYears] = await conn.query(
      'SELECT id, academic_year FROM academic_years ORDER BY academic_year DESC'
    );

    const [dayTypes] = await conn.query(
      'SELECT id, day_type FROM ac_day_types'
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('AcademicCalendar');

    // Create hidden data sheets for dropdowns
    const academicYearSheet = workbook.addWorksheet('AcademicYears');
    const dayTypeSheet = workbook.addWorksheet('DayTypes');

    // Populate hidden sheets
    academicYearSheet.addRow(['AcademicYear']);
    academicYears.forEach(ay => academicYearSheet.addRow([ay.academic_year]));

    dayTypeSheet.addRow(['DayType']);
    dayTypes.forEach(dt => dayTypeSheet.addRow([dt.day_type]));

    // Hide the data sheets
    academicYearSheet.state = 'veryHidden';
    dayTypeSheet.state = 'veryHidden';

    // Main sheet columns
    sheet.columns = [
      { header: 'AcademicYear*', key: 'academic_year', width: 16 },
      { header: 'Date* (YYYY-MM-DD)', key: 'date', width: 18 },
      { header: 'DayType*', key: 'day_type', width: 22 },
      { header: 'Reason', key: 'reason', width: 40 },
      { header: 'IsEditable (0/1)', key: 'is_editable', width: 18 },
    ];

    sheet.getRow(1).font = { bold: true };

    // Format date column as yyyy-mm-dd to guide users
    try {
      sheet.getColumn(2).numFmt = 'yyyy-mm-dd';
    } catch (e) {
      // ignore formatting errors silently
    }

    // Add data validation (dropdowns) for 100 rows
    for (let i = 2; i <= 101; i++) {
      // Academic Year dropdown
      sheet.getCell(`A${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`AcademicYears!$A$2:$A$${academicYears.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Academic Year',
        error: 'Please select an academic year from the list'
      };

      // Day Type dropdown
      sheet.getCell(`C${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`DayTypes!$A$2:$A$${dayTypes.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Day Type',
        error: 'Please select a day type from the list'
      };
    }

    // Add example rows
    const sampleDayType = dayTypes.length > 0 ? dayTypes[0].day_type : 'Working Day';

    sheet.addRow({
      academic_year: academicYears.length > 0 ? academicYears[0].academic_year : 2025,
      date: '2025-12-25',
      day_type: sampleDayType,
      reason: 'Holiday',
      is_editable: 1,
    });

    sheet.addRow({
      academic_year: academicYears.length > 0 ? academicYears[0].academic_year : 2025,
      date: '2025-12-26',
      day_type: sampleDayType,
      reason: '',
      is_editable: 1,
    });

    if (conn) conn.release();

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="academic_calendar_template.xlsx"');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error generating academic calendar template:', err);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to generate template' });
  }
};

// Helper to fetch single row
async function fetchSingle(conn, sql, params) {
  const [rows] = await conn.query(sql, params);
  return rows && rows.length ? rows[0] : null;
}

// Normalize various Excel/JS date representations to 'YYYY-MM-DD'
function normalizeDate(value) {
  if (!value) return null;

  // If already a JS Date
  if (value instanceof Date && !isNaN(value)) {
    return formatYMD(value);
  }

  // ExcelJS can return numbers for dates if cell type not enforced
  if (typeof value === 'number') {
    const d = excelSerialToDate(value);
    return d ? formatYMD(d) : null;
  }

  // If it's an object with a 'result' or 'text' property (rare)
  if (typeof value === 'object' && value) {
    if (value.text) {
      const parsed = new Date(value.text);
      if (!isNaN(parsed)) return formatYMD(parsed);
    }
    if (value.result) {
      const parsed = new Date(value.result);
      if (!isNaN(parsed)) return formatYMD(parsed);
    }
  }

  // String cases
  const str = String(value).trim();
  if (!str) return null;

  // Already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Try generic Date parsing and then format in local Y-M-D
  const parsed = new Date(str);
  if (!isNaN(parsed)) return formatYMD(parsed);

  return null;
}

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Excel serial date (days since 1899-12-30 on Windows)
function excelSerialToDate(serial) {
  if (typeof serial !== 'number' || !isFinite(serial)) return null;
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = serial * 24 * 60 * 60 * 1000;
  const d = new Date(excelEpoch.getTime() + ms);
  // Convert to local time for consistent Y-M-D
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// Upload academic calendar from Excel
exports.uploadAcademicCalendar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = { processed: 0, succeeded: 0, failed: [] };
  let conn;

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet('AcademicCalendar') || workbook.worksheets[0];

    if (!sheet) {
      return res.status(400).json({ success: false, message: 'Invalid Excel: No worksheet found' });
    }

    conn = await db.getConnection();

    const [allowedDayTypes] = await conn.query(
      'SELECT id, day_type FROM ac_day_types'
    );

    if (!allowedDayTypes || allowedDayTypes.length === 0) {
      return res.status(500).json({ success: false, message: 'Day types not configured in the system' });
    }

    const dayTypeMap = allowedDayTypes.reduce((acc, dt) => {
      acc[String(dt.day_type).trim().toLowerCase()] = dt.id;
      return acc;
    }, {});

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      // Skip empty
      if (!row.getCell(1).value) continue;
      results.processed++;

      try {
        const academicYearValue = String(row.getCell(1).value || '').trim();
        const dateISO = normalizeDate(row.getCell(2).value);
        const dayTypeRaw = String(row.getCell(3).value || '').trim().toLowerCase();
        const reason = String(row.getCell(4).value || '').trim();
        const isEditableCell = row.getCell(5).value;

        if (!academicYearValue || !dateISO || !dayTypeRaw) {
          results.failed.push({ row: i, reason: 'Missing required fields' });
          continue;
        }

        const dayTypeId = dayTypeMap[dayTypeRaw];
        if (!dayTypeId) {
          results.failed.push({ row: i, reason: `Unknown day type: ${dayTypeRaw}` });
          continue;
        }
        const isEditable = isEditableCell ? parseInt(isEditableCell, 10) : 1;

        // Resolve academic year
        const academicYearRow = await fetchSingle(
          conn,
          'SELECT id FROM academic_years WHERE academic_year = ?',
          [academicYearValue]
        );
        if (!academicYearRow) {
          results.failed.push({ row: i, reason: `Unknown academic year: ${academicYearValue}` });
          continue;
        }

        // Check if entry already exists
        const [existing] = await conn.query(
          'SELECT id FROM academic_calendar WHERE academic_year = ? AND date = ?',
          [academicYearRow.id, dateISO]
        );

        if (existing.length > 0) {
          // Update existing entry
          await conn.query(
            `UPDATE academic_calendar 
             SET day_type = ?, reason = ?, is_editable = ?
             WHERE id = ?`,
            [dayTypeId, reason || null, isEditable, existing[0].id]
          );
        } else {
          // Insert new entry
          await conn.query(
            `INSERT INTO academic_calendar 
             (academic_year, date, day_type, reason, is_editable, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [academicYearRow.id, dateISO, dayTypeId, reason || null, isEditable]
          );
        }

        results.succeeded++;
      } catch (err) {
        console.error(`Error processing row ${i}:`, err);
        results.failed.push({ row: i, reason: err.message || 'Unknown error' });
      }
    }

    if (conn) conn.release();

    return res.json({ success: true, message: 'Academic calendar upload completed', data: results });
  } catch (error) {
    console.error('Academic calendar upload error:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to upload academic calendar', error: error.message });
  }
};

// Get academic calendar entries
exports.getAcademicCalendar = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { academic_year_id, month, year } = req.body;

    let query = `
      SELECT 
        ac.id,
        ac.academic_year,
        ac.date,
        ac.day_type AS day_type_id,
        dt.day_type,
        ac.reason,
        ac.is_editable,
        ac.created_at,
        ay.academic_year AS academic_year_name
      FROM academic_calendar ac
      JOIN academic_years ay ON ay.id = ac.academic_year
      LEFT JOIN ac_day_types dt ON dt.id = ac.day_type
      WHERE 1=1
    `;
    const params = [];

    if (academic_year_id) {
      query += ' AND ac.academic_year = ?';
      params.push(academic_year_id);
    }

    if (year && month) {
      query += ' AND YEAR(ac.date) = ? AND MONTH(ac.date) = ?';
      params.push(year, month);
    } else if (year) {
      query += ' AND YEAR(ac.date) = ?';
      params.push(year);
    }

    query += ' ORDER BY ac.date ASC';

    const [calendar] = await conn.query(query, params);
    // console.log(calendar);
    
    if (conn) conn.release();

    return res.json({ success: true, calendar });
  } catch (error) {
    console.error('Error fetching academic calendar:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to fetch academic calendar' });
  }
};

// Delete academic calendar entry
exports.deleteAcademicCalendarEntry = async (req, res) => {
  let conn;
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Entry ID is required' });
    }

    conn = await db.getConnection();

    // Check if entry is editable
    const [entry] = await conn.query('SELECT is_editable FROM academic_calendar WHERE id = ?', [id]);
    if (!entry || entry.length === 0) {
      if (conn) conn.release();
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry[0].is_editable === 0) {
      if (conn) conn.release();
      return res.status(403).json({ success: false, message: 'This entry cannot be deleted' });
    }

    await conn.query('DELETE FROM academic_calendar WHERE id = ?', [id]);

    if (conn) conn.release();

    return res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic calendar entry:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to delete entry' });
  }
};

// Get day types list
exports.getDayTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, day_type FROM ac_day_types ORDER BY id');
    // console.log(rows);
    
    return res.json({ success: true, dayTypes: rows });
  } catch (error) {
    console.error('Error fetching day types:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch day types' });
  }
};

// Bulk update day type and reason for selected calendar entries
exports.bulkUpdateAcademicCalendar = async (req, res) => {
  let conn;
  try {
    const { ids, day_type_id, reason } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No entries selected' });
    }
    if (!day_type_id) {
      return res.status(400).json({ success: false, message: 'Day type is required' });
    }

    conn = await db.getConnection();

    // Validate day type exists
    const [dtRows] = await conn.query('SELECT id FROM ac_day_types WHERE id = ?', [day_type_id]);
    if (!dtRows || dtRows.length === 0) {
      if (conn) conn.release();
      return res.status(400).json({ success: false, message: 'Invalid day type' });
    }

    const [result] = await conn.query(
      `UPDATE academic_calendar
       SET day_type = ?, reason = ?
       WHERE id IN (?) AND is_editable = 1`,
      [day_type_id, reason || null, ids]
    );

    if (conn) conn.release();

    return res.json({ success: true, updated: result.affectedRows });
  } catch (error) {
    console.error('Error bulk updating academic calendar:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to update academic calendar' });
  }
};

// Get academic calendar statistics
exports.getCalendarStats = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { academic_year_id } = req.body;

    if (!academic_year_id) {
      return res.status(400).json({ success: false, message: 'Academic year ID is required' });
    }

    const [stats] = await conn.query(`
      SELECT 
        dt.day_type,
        COUNT(*) as count
      FROM academic_calendar ac
      LEFT JOIN ac_day_types dt ON dt.id = ac.day_type
      WHERE ac.academic_year = ?
      GROUP BY dt.day_type
    `, [academic_year_id]);
        // console.log(stats);
        
    if (conn) conn.release();

    return res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching calendar stats:', error);
    if (conn) conn.release();
    return res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

module.exports = exports;
