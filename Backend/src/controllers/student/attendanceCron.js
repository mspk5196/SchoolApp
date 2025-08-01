const db = require('../../config/db');

// Extract the cron logic into a function
async function runAttendanceUpdater() {
  console.log('Running daily attendance updater at 6:00 PM'); 
 
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 🛑 Skip Sundays
  if (today.getDay() === 0) {
    console.log("Today is Sunday, skipping update.");
    return { success: true, message: "Skipped - Sunday" };
  }

  // 🛑 Check calendar_events for holiday
  const [holidays] = await db.promise().query(`
    SELECT * FROM calendar_events 
    WHERE type = 'holiday' 
      AND (date = CURDATE() OR (DAY(date) = DAY(CURDATE()) AND MONTH(date) = MONTH(CURDATE())))
  `);
  if (holidays.length > 0) {
    console.log("Today is a holiday, skipping update.");
    return { success: true, message: "Skipped - Holiday" };
  }

  const [students] = await db.promise().query(`SELECT id, roll, section_id FROM Students`);

  for (const student of students) {
    const { id: studentId, roll, section_id } = student;

    const [dailySessions] = await db.promise().query(
      `SELECT COUNT(*) AS total_sessions FROM daily_schedule WHERE date = ? AND section_id = ?`,
      [todayStr, section_id]
    );
    const totalSessions = dailySessions[0].total_sessions || 0;
    if (totalSessions === 0) continue;

    const [academicPresent] = await db.promise().query(
      `SELECT COUNT(*) AS present_count
       FROM academic_session_attendance asa
       JOIN daily_schedule ds ON asa.session_id = ds.id
       JOIN academic_sessions ass ON asa.session_id = ass.dsa_id
       WHERE asa.student_id = ? AND ds.date = ? AND ass.status = 'Completed' AND asa.attendance_status != 'Absent' AND ass.status != 'Scheduled'`,
      [studentId, todayStr]
    );

    const [assessmentPresent] = await db.promise().query(
      `SELECT COUNT(*) as present_count 
       FROM assessment_session_marks asa
       JOIN assessment_sessions a ON asa.as_id = a.id
       WHERE asa.student_roll = ? AND a.date = ? AND a.status = 'Completed' AND asa.status != 'Absent' AND a.status != 'Scheduled'`,
      [roll, todayStr]
    );

    const presentSessions =
      (academicPresent[0].present_count || 0) + (assessmentPresent[0].present_count || 0);

    let presentDaysToAdd = 0;
    if (presentSessions === totalSessions) presentDaysToAdd = 1;
    else if (presentSessions >= Math.ceil(totalSessions / 2)) presentDaysToAdd = 0.5;

    // 🧮 Update StudentAttendance
    await db.promise().query(
      `UPDATE StudentAttendance SET total_days = total_days + 1, present_days = present_days + ?
       WHERE roll = ?`,
      [presentDaysToAdd, roll, todayStr]
    );
  }

  console.log("✅ Attendance processing started at:", new Date().toLocaleString());
  console.log("✅ Attendance update complete.");
  return { success: true, message: "Attendance updated successfully" };
}

// Export for manual run and cron manager
module.exports = { runAttendanceUpdater };