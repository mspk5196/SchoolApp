const db = require('../../config/db');

// Function to delete conflicting schedules for exams
async function deleteConflictingSchedules(grade_id, date, start_time, end_time) {
  return new Promise((resolve, reject) => {
    // Get sections for the grade
    const getSectionsSql = `SELECT id FROM sections WHERE grade_id = ?`;
    
    db.query(getSectionsSql, [grade_id], (err, sections) => {
      if (err) {
        return reject(err);
      }

      if (sections.length === 0) {
        return resolve();
      }

      const sectionIds = sections.map(s => s.id);
      const placeholders = sectionIds.map(() => '?').join(',');

      // Find conflicting schedules
      const findConflictsSql = `
        SELECT id FROM daily_schedule
        WHERE section_id IN (${placeholders})
        AND date = ?
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `;

      const params = [...sectionIds, date, end_time, start_time, end_time, start_time, start_time, end_time];

      db.query(findConflictsSql, params, (err, conflictingSchedules) => {
        if (err) {
          return reject(err);
        }

        if (conflictingSchedules.length === 0) {
          return resolve();
        }

        const scheduleIds = conflictingSchedules.map(s => s.id);

        // Delete related records first
        const deleteAssessmentSessionsSql = `
          DELETE FROM assessment_sessions 
          WHERE dsa_id IN (${scheduleIds.map(() => '?').join(',')})
        `;

        const deleteAcademicSessionsSql = `
          DELETE FROM academic_sessions 
          WHERE session_id IN (${scheduleIds.map(() => '?').join(',')})
        `;

        const deleteDailyScheduleSql = `
          DELETE FROM daily_schedule 
          WHERE id IN (${scheduleIds.map(() => '?').join(',')})
        `;

        // Execute deletions in sequence
        db.query(deleteAssessmentSessionsSql, scheduleIds, (err) => {
          if (err) console.error('Error deleting assessment sessions:', err);
          
          db.query(deleteAcademicSessionsSql, scheduleIds, (err) => {
            if (err) console.error('Error deleting academic sessions:', err);
            
            db.query(deleteDailyScheduleSql, scheduleIds, (err) => {
              if (err) {
                return reject(err);
              }
              console.log(`Deleted ${scheduleIds.length} conflicting schedule(s) for exam on ${date}`);
              resolve();
            });
          });
        });
      });
    });
  });
}

// Function to run exam conflict deletion cron
async function runExamConflictDeletion() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

    // Get all exam schedules that should run today
    const getExamsSql = `
      SELECT es.*, s.subject_name, g.grade_name
      FROM Exam_Schedule es
      LEFT JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN grades g ON es.grade_id = g.id
      WHERE (
        (es.recurrence = 'Daily') OR
        (es.recurrence = 'Every Mon' AND ? = 'Monday') OR
        (es.recurrence = 'Every Tue' AND ? = 'Tuesday') OR
        (es.recurrence = 'Every Wed' AND ? = 'Wednesday') OR
        (es.recurrence = 'Every Thu' AND ? = 'Thursday') OR
        (es.recurrence = 'Every Fri' AND ? = 'Friday') OR
        (es.recurrence = 'Every Sat' AND ? = 'Saturday') OR
        (es.recurrence = 'Every Sun' AND ? = 'Sunday') OR
        (es.exam_date = ?)
      )
    `;

    db.query(getExamsSql, [currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, today], async (err, exams) => {
      if (err) {
        console.error('Error fetching exam schedules for cron:', err);
        return;
      }

      if (exams.length === 0) {
        console.log('No exam schedules found for today');
        return;
      }

      console.log(`Found ${exams.length} exam schedule(s) for ${today} (${currentDay})`);

      // Process each exam
      for (const exam of exams) {
        try {
          // Only delete conflicts if the exam is not a one-time exam on a different date
          if (exam.recurrence !== 'Only Once' || exam.exam_date === today) {
            await deleteConflictingSchedules(exam.grade_id, today, exam.start_time, exam.end_time);
            console.log(`Processed conflicts for exam: ${exam.subject_name} (${exam.grade_name}) - ${exam.start_time} to ${exam.end_time}`);
          }
        } catch (error) {
          console.error(`Error processing exam ${exam.id}:`, error);
        }
      }

      console.log('Exam conflict deletion cron completed');
    });
  } catch (error) {
    console.error('Error in exam conflict deletion cron:', error);
  }
}

module.exports = {
  runExamConflictDeletion,
  deleteConflictingSchedules
};
