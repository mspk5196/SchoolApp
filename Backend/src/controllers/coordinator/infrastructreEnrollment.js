const Venue = require('../../models/venue');
const db = require('../../config/db');

exports.getAllVenues = (req, res) => {
  Venue.findAll(req.query, (err, venues) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(venues);
  });
};

exports.getVenueById = (req, res) => {
  Venue.findById(req.params.id, (err, venue) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(venue);
  });
};

exports.createVenue = (req, res) => {
  Venue.create(req.body, (err, venue) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ message: 'Invalid data' });
    }
    res.status(201).json(venue);
  });
};

exports.updateVenue = (req, res) => {
  Venue.findById(req.params.id, (err, venue) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    Venue.update(req.params.id, req.body, (err, updatedVenue) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: 'Invalid data' });
      }
      res.json(updatedVenue);
    });
  });
};

exports.deleteVenue = (req, res) => {
  Venue.findById(req.params.id, (err, venue) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    Venue.delete(req.params.id, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      res.json({ message: 'Venue deleted successfully' });
    });
  });
};

exports.updateVenueStatus = (req, res) => {
  Venue.findById(req.params.id, (err, venue) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    Venue.updateStatus(req.params.id, req.body.status, (err, updatedVenue) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: 'Invalid data' });
      }
      res.json(updatedVenue);
    });
  });
};

exports.getGrades = (req, res) => {

  const sql = `
    SELECT *
    FROM Grades
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching grades data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Grades data fetched successfully", grades: results });
  });
};

exports.getSubjects = (req, res) => {

  const sql = `
    SELECT * FROM Subjects
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching subjects:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subjects fetched successfully", subjects: results });
  });
};
exports.getBlocks = (req, res) => {

  const sql = `
    SELECT * FROM Blocks
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching blocks:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Blocks fetched successfully", blocks: results });
  });
};