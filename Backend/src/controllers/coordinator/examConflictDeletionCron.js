const db = require('../../config/db');

// Function to check and delete conflicting schedules for recurring exams
async function runExamConflictDeletion() {
  try {
    console.log('🔍 Running exam conflict deletion check...');
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Every Sun', 'Every Mon', 'Every Tue', 'Every Wed', 'Every Thu', 'Every Fri', 'Every Sat'];
    const currentDayName = dayNames[dayOfWeek];
    
    // Get all recurring exam schedules that should run today
    const getRecurringExamsSql = `
      SELECT * FROM Exam_Schedule 
      WHERE (recurrence = 'Daily' OR recurrence = ?) 
      AND (exam_date <= ? OR recurrence != 'Only Once')
    `;
    
    db.query(getRecurringExamsSql, [currentDayName, todayString], async (err, recurringExams) => {
      if (err) {
        console.error('Error fetching recurring exams:', err);
        return;
      }
      
      console.log(`📅 Found ${recurringExams.length} recurring exams for today (${currentDayName})`);
      
      for (const exam of recurringExams) {
        try {
          await deleteConflictingSchedulesForExam(exam, todayString);
        } catch (error) {
          console.error(`❌ Error processing exam ${exam.id}:`, error);
        }
      }
      
      console.log('✅ Exam conflict deletion check completed');
    });
    
  } catch (error) {
    console.error('❌ Error in exam conflict deletion:', error);
  }
}

// Helper function to delete conflicting schedules for a specific exam
async function deleteConflictingSchedulesForExam(exam, date) {
  return new Promise((resolve, reject) => {
    // Get sections for the exam's grade
    const getSectionsSql = `SELECT id, section_name FROM sections WHERE grade_id = ?`;
    
    db.query(getSectionsSql, [exam.grade_id], (err, sections) => {
      if (err) {
        return reject(err);
      }

      if (sections.length === 0) {
        console.log(`📝 No sections found for grade ${exam.grade_id}`);
        return resolve();
      }

      const sectionIds = sections.map(s => s.id);
      const placeholders = sectionIds.map(() => '?').join(',');

      // Find conflicting schedules
      const findConflictsSql = `
        SELECT ds.id, ds.section_id, s.section_name, sub.subject_name, ds.start_time, ds.end_time
        FROM daily_schedule ds
        JOIN sections s ON ds.section_id = s.id
        JOIN subjects sub ON ds.subject_id = sub.id
        WHERE ds.section_id IN (${placeholders})
        AND ds.date = ?
        AND (
          (ds.start_time < ? AND ds.end_time > ?) OR
          (ds.start_time < ? AND ds.end_time > ?) OR
          (ds.start_time >= ? AND ds.end_time <= ?)
        )
      `;

      const params = [
        ...sectionIds, 
        date, 
        exam.end_time, exam.start_time,
        exam.end_time, exam.start_time,
        exam.start_time, exam.end_time
      ];

      db.query(findConflictsSql, params, (err, conflictingSchedules) => {
        if (err) {
          return reject(err);
        }

        if (conflictingSchedules.length === 0) {
          console.log(`✅ No conflicts found for exam ${exam.id} (${exam.subject_id}) on ${date}`);
          return resolve();
        }

        console.log(`🔄 Found ${conflictingSchedules.length} conflicting schedules for exam ${exam.id}:`);
        conflictingSchedules.forEach(schedule => {
          console.log(`   - ${schedule.section_name}: ${schedule.subject_name} (${schedule.start_time}-${schedule.end_time})`);
        });

        const scheduleIds = conflictingSchedules.map(s => s.id);

        // Delete related records first, then daily schedule
        deleteRelatedRecords(scheduleIds, (deleteErr) => {
          if (deleteErr) {
            console.error(`❌ Error deleting related records for exam ${exam.id}:`, deleteErr);
            return reject(deleteErr);
          }
          
          console.log(`✅ Successfully deleted ${conflictingSchedules.length} conflicting schedules for exam ${exam.id}`);
          resolve();
        });
      });
    });
  });
}

// Helper function to delete related records
function deleteRelatedRecords(scheduleIds, callback) {
  if (scheduleIds.length === 0) {
    return callback();
  }

  const placeholders = scheduleIds.map(() => '?').join(',');

  // Delete assessment sessions first
  const deleteAssessmentSessionsSql = `
    DELETE FROM assessment_sessions 
    WHERE dsa_id IN (${placeholders})
  `;

  db.query(deleteAssessmentSessionsSql, scheduleIds, (err) => {
    if (err) {
      console.error('Error deleting assessment sessions:', err);
    } else {
      console.log(`🗑️  Deleted assessment sessions for ${scheduleIds.length} schedules`);
    }
    
    // Delete academic sessions
    const deleteAcademicSessionsSql = `
      DELETE FROM academic_sessions 
      WHERE session_id IN (${placeholders})
    `;

    db.query(deleteAcademicSessionsSql, scheduleIds, (err) => {
      if (err) {
        console.error('Error deleting academic sessions:', err);
      } else {
        console.log(`🗑️  Deleted academic sessions for ${scheduleIds.length} schedules`);
      }
      
      // Finally delete daily schedule records
      const deleteDailyScheduleSql = `
        DELETE FROM daily_schedule 
        WHERE id IN (${placeholders})
      `;

      db.query(deleteDailyScheduleSql, scheduleIds, (err) => {
        if (err) {
          console.error('Error deleting daily schedule:', err);
          return callback(err);
        }
        
        console.log(`🗑️  Deleted daily schedule records for ${scheduleIds.length} schedules`);
        callback();
      });
    });
  });
}

module.exports = {
  runExamConflictDeletion
};
