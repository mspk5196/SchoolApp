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
    db.query('SELECT * FROM venues WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }

  static create(venueData, callback) {
    db.query('INSERT INTO venues SET ?', venueData, (err, result) => {
      if (err) return callback(err);
      Venue.findById(result.insertId, callback);
    });
  }

  static update(id, venueData, callback) {
    db.query('UPDATE venues SET ? WHERE id = ?', [venueData, id], (err) => {
      if (err) return callback(err);
      Venue.findById(id, callback);
    });
  }

  static delete(id, callback) {
    db.query('DELETE FROM venues WHERE id = ?', [id], (err) => {
      if (err) return callback(err);
      callback(null, true);
    });
  }

  static updateStatus(id, status, callback) {
    db.query('UPDATE venues SET status = ? WHERE id = ?', [status, id], (err) => {
      if (err) return callback(err);
      Venue.findById(id, callback);
    });
  }
}

module.exports = Venue;
