const db = require("../config/db");

let cachedAcademicYearId = null;
let lastCheck = 0;

const getAcademicYear = async (req, res, next) => {
  const now = Date.now();

  if (cachedAcademicYearId && now - lastCheck < 5 * 60 * 1000) {
    req.activeAcademicYearId = cachedAcademicYearId;
    return next();
  }

  try {
    const [rows] = await db.query(`
      SELECT ay.id FROM academic_years ay
      JOIN ay_status ays ON ay.id = ays.academic_year_id
      WHERE ays.is_active = 1 LIMIT 1
    `);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'No active academic year found'
      });
    }

    cachedAcademicYearId = rows[0].id;
    lastCheck = now;

    req.activeAcademicYearId = cachedAcademicYearId;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching academic year' });
  }
};

module.exports = getAcademicYear;
