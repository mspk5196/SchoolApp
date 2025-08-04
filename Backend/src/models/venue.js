const db = require('../config/db');

class Venue {
  static findAll(filters, callback) {
    let query = `SELECT v.*, g.grade_name as grade, 
                 GROUP_CONCAT(DISTINCT s.subject_name) as subject_names
                 FROM venues v `;
    query += 'LEFT JOIN grades g ON v.grade_id = g.id ';
    query += 'LEFT JOIN venue_subjects vs ON v.id = vs.venue_id ';
    query += 'LEFT JOIN subjects s ON vs.subject_id = s.id ';
    query += 'WHERE 1=1 ';

    const whereClauses = [];
    const params = [];

    if (filters.grade_id) {
      whereClauses.push('v.grade_id = ?');
      params.push(filters.grade_id);
    }
    if (filters.type) {
      whereClauses.push('v.type = ?');
      params.push(filters.type);
    }
    if (filters.status) {
      whereClauses.push('v.status = ?');
      params.push(filters.status);
    }
    if (filters.block) {
      whereClauses.push('v.block = ?');
      params.push(filters.block);
    }

    if (whereClauses.length > 0) {
      query += ' AND ' + whereClauses.join(' AND ');
    }

    // Group by venue and order by approval status (approved first, then by name)
    query += ' GROUP BY v.id ORDER BY v.is_accepted DESC, v.venue_status ASC, v.name';

    db.query(query, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  }

  static findById(id, callback) {
    const query = `
      SELECT v.*, 
        g.grade_name as grade,
        GROUP_CONCAT(DISTINCT s.subject_name) as subject_names,
        GROUP_CONCAT(DISTINCT s.id) as subject_ids
      FROM venues v
      LEFT JOIN grades g ON v.grade_id = g.id
      LEFT JOIN venue_subjects vs ON v.id = vs.venue_id
      LEFT JOIN subjects s ON vs.subject_id = s.id
      WHERE v.id = ?
      GROUP BY v.id`;

    db.query(query, [id], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, null);

      const venue = results[0];
      if (venue.subject_ids) {
        venue.subjects = venue.subject_ids.split(',').map(id => parseInt(id));
      } else {
        venue.subjects = [];
      }
      callback(null, venue);
    });
  }

  static create(venueData, callback) {
    // Extract subjects array and remove from venueData to prevent SQL error
    const subjects = venueData.subject_ids || [];
    delete venueData.subject_ids;

    console.log('Creating venue with data:', venueData);
    console.log('Subjects to associate:', subjects);

    // Set default venue_status if not provided
    if (!venueData.venue_status) {
      venueData.venue_status = 'Requested';
    }
    
    // Set is_accepted to 0 by default (will be approved by admin)
    venueData.is_accepted = 0;

    // Convert to promise-based approach
    new Promise((resolve, reject) => {
      db.getConnection((err, conn) => {
        if (err) return reject(err);

        conn.beginTransaction(err => {
          if (err) {
            conn.release();
            return reject(err);
          }

          // Insert venue
          conn.query('INSERT INTO venues SET ?', venueData, (err, result) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                reject(err);
              });
            }

            const venueId = result.insertId;

            if (subjects.length > 0) {
              const subjectValues = subjects.map(subjectId => [venueId, subjectId]);
              console.log('Inserting venue-subject relationships:', subjectValues);
              conn.query('INSERT INTO venue_subjects (venue_id, subject_id) VALUES ?', [subjectValues], (err) => {
                if (err) {
                  console.error('Error inserting venue-subject relationships:', err);
                  return conn.rollback(() => {
                    conn.release();
                    reject(err);
                  });
                }

                console.log('Successfully inserted venue-subject relationships');
                conn.commit(err => {
                  conn.release();
                  if (err) return reject(err);
                  resolve(venueId);
                });
              });
            } else {
              console.log('No subjects to associate, committing venue creation');
              conn.commit(err => {
                conn.release();
                if (err) return reject(err);
                resolve(venueId);
              });
            }
          });
        });
      });
    })
      .then(venueId => {
        Venue.findById(venueId, callback);
      })
      .catch(err => {
        callback(err);
      });
  }

  static update(id, venueData, callback) {
    const subjects = venueData.subjects || [];
    delete venueData.subjects;

    // Use the promise-based transaction
    db.promise().beginTransaction()
      .then(transaction => {
        // Update venue
        return transaction.query('UPDATE venues SET ? WHERE id = ?', [venueData, id])
          .then(() => {
            // Delete existing subject associations
            return transaction.query('DELETE FROM venue_subjects WHERE venue_id = ?', [id]);
          })
          .then(() => {
            if (subjects.length > 0) {
              const subjectValues = subjects.map(subjectId => [id, subjectId]);
              return transaction.query('INSERT INTO venue_subjects (venue_id, subject_id) VALUES ?', [subjectValues]);
            }
          })
          .then(() => {
            return transaction.commit()
              .then(() => Venue.findById(id, callback));
          })
          .catch(err => {
            return transaction.rollback()
              .then(() => callback(err))
              .catch(rollbackErr => callback(rollbackErr));
          });
      })
      .catch(err => callback(err));
  }

  static delete(id, callback) {
    db.beginTransaction(err => {
      if (err) return callback(err);

      // Delete venue_subjects associations
      db.query('DELETE FROM venue_subjects WHERE venue_id = ?', [id], err => {
        if (err) return db.rollback(() => callback(err));

        // Delete venue_grades associations (if any exist)
        db.query('DELETE FROM venue_grades WHERE venue_id = ?', [id], err => {
          if (err) return db.rollback(() => callback(err));

          // Delete the venue
          db.query('DELETE FROM venues WHERE id = ?', [id], err => {
            if (err) return db.rollback(() => callback(err));
            db.commit(err => {
              if (err) return db.rollback(() => callback(err));
              callback(null, true);
            });
          });
        });
      });
    });
  }

  static updateStatus(id, status, callback) {
    db.query('UPDATE venues SET status = ? WHERE id = ?', [status, id], (err) => {
      if (err) return callback(err);
      Venue.findById(id, callback);
    });
  }

  static getByGrade(gradeId, callback) {
    const query = `
      SELECT DISTINCT v.*
      FROM venues v
      LEFT JOIN venue_grades vg ON v.id = vg.venue_id
      WHERE (vg.grade_id = ? OR v.grade_id = ? OR (vg.grade_id IS NULL AND v.grade_id IS NULL))
      ORDER BY v.is_accepted DESC, v.venue_status ASC, v.name`;

    db.query(query, [gradeId, gradeId], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }

  static getActiveVenues(callback) {
    const query = `
      SELECT v.* 
      FROM venues v
      WHERE v.status = 'Active'
      ORDER BY v.is_accepted DESC, v.venue_status ASC, v.name`;

    db.query(query, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }

  static updateStatusBasedOnSchedule(callback) {
    // Get current day and time
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = now.toTimeString().substring(0, 8); // HH:MM:SS format

    // Query to find active sessions
    const query = `
      SELECT venue 
      FROM weekly_schedule 
      WHERE day = ? 
      AND start_time <= ? 
      AND end_time >= ?
      AND venue IS NOT NULL`;

    db.query(query, [currentDay, currentTime, currentTime], (err, results) => {
      if (err) return callback(err);

      // Get all venue IDs that should be active
      const activeVenueIds = results.map(r => r.venue);

      // Update all venues - set active if in use, inactive otherwise
      const updateQuery = `
        UPDATE venues 
        SET status = CASE 
          WHEN id IN (?) THEN 'Active' 
          ELSE 'InActive' 
        END`;

      db.query(updateQuery, [activeVenueIds], callback);
    });
  }

  // Admin approval methods
  static approveVenue(id, callback) {
    const query = 'UPDATE venues SET is_accepted = 1, venue_status = "Approved" WHERE id = ?';
    db.query(query, [id], (err) => {
      if (err) return callback(err);
      Venue.findById(id, callback);
    });
  }

  static rejectVenue(id, callback) {
    const query = 'UPDATE venues SET is_accepted = 0, venue_status = "Rejected" WHERE id = ?';
    db.query(query, [id], (err) => {
      if (err) return callback(err);
      Venue.findById(id, callback);
    });
  }

  static getPendingVenues(callback) {
    const query = `
      SELECT v.*, g.grade_name as grade,
             GROUP_CONCAT(DISTINCT s.subject_name) as subject_names
      FROM venues v
      LEFT JOIN grades g ON v.grade_id = g.id
      LEFT JOIN venue_subjects vs ON v.id = vs.venue_id
      LEFT JOIN subjects s ON vs.subject_id = s.id
      WHERE v.venue_status = 'Requested'
      GROUP BY v.id
      ORDER BY v.created_at ASC`;
    
    db.query(query, callback);
  }
}

module.exports = Venue;