const db = require('../config/db');

class Venue {
  static findAll(filters, callback) {
    let query = 'SELECT v.*, g.grade_name as grade, s.subject_name as subject FROM venues v ';
    query += 'LEFT JOIN grades g ON v.grade_id = g.id ';
    query += 'LEFT JOIN subjects s ON v.subject_id = s.id ';

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
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    db.query(query, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  }

  static findById(id, callback) {
    const query = `
      SELECT v.*, 
        GROUP_CONCAT(DISTINCT g.grade_name) as grade_names,
        GROUP_CONCAT(DISTINCT g.id) as grade_ids,
        s.subject_name as subject
      FROM venues v
      LEFT JOIN venue_grades vg ON v.id = vg.venue_id
      LEFT JOIN grades g ON vg.grade_id = g.id
      LEFT JOIN subjects s ON v.subject_id = s.id
      WHERE v.id = ?
      GROUP BY v.id`;

    db.query(query, [id], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, null);

      const venue = results[0];
      if (venue.grade_ids) {
        venue.grades = venue.grade_ids.split(',').map(id => parseInt(id));
      } else {
        venue.grades = [];
      }
      callback(null, venue);
    });
  }

  static create(venueData, callback) {
    // Extract grades array and remove from venueData to prevent SQL error
    const grades = venueData.grade_ids || [];
    delete venueData.grade_ids;

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

            if (grades.length > 0) {
              const gradeValues = grades.map(gradeId => [venueId, gradeId]);
              conn.query('INSERT INTO venue_grades (venue_id, grade_id) VALUES ?', [gradeValues], (err) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    reject(err);
                  });
                }

                conn.commit(err => {
                  conn.release();
                  if (err) return reject(err);
                  resolve(venueId);
                });
              });
            } else {
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
    const grades = venueData.grades || [];
    delete venueData.grades;

    // Use the promise-based transaction
    db.beginTransaction()
      .then(transaction => {
        // Update venue
        return transaction.query('UPDATE venues SET ? WHERE id = ?', [venueData, id])
          .then(() => {
            // Delete existing grade associations
            return transaction.query('DELETE FROM venue_grades WHERE venue_id = ?', [id]);
          })
          .then(() => {
            if (grades.length > 0) {
              const gradeValues = grades.map(gradeId => [id, gradeId]);
              return transaction.query('INSERT INTO venue_grades (venue_id, grade_id) VALUES ?', [gradeValues]);
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

      db.query('DELETE FROM venue_grades WHERE venue_id = ?', [id], err => {
        if (err) return db.rollback(() => callback(err));

        db.query('DELETE FROM venues WHERE id = ?', [id], err => {
          if (err) return db.rollback(() => callback(err));
          db.commit(err => {
            if (err) return db.rollback(() => callback(err));
            callback(null, true);
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
      WHERE vg.grade_id = ? OR v.grade_id = ? OR (vg.grade_id IS NULL AND v.grade_id IS NULL)
      ORDER BY v.name`;

    db.query(query, [gradeId, gradeId], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }

  static getActiveVenues(callback) {
    const query = `
      SELECT v.* 
      FROM venues v
      WHERE v.status = 'Active'`;

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
}

module.exports = Venue;