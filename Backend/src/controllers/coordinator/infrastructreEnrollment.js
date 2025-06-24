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

exports.getVenuesByGrade = (req, res) => {
  const { gradeId } = req.query;

  const sql = `
    SELECT id, name, block, floor, capacity, type
    FROM venues
    WHERE (grade_id = ? OR grade_id IS NULL) AND is_accepted = 1
    ORDER BY name`;

  db.query(sql, [gradeId], (err, results) => {
    if (err) {
      console.error("Error fetching venues:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    console.log(results);
    
    res.json({ success: true, venues: results });
  });
};

exports.createVenue = async (req, res) => {
  try {
    const venueData = req.body;
    
    // Prepare the venue data for database insertion
    const preparedData = {
      name: venueData.name,
      block: venueData.block,
      floor: parseInt(venueData.floor, 10),
      capacity: parseInt(venueData.capacity, 10),
      subject_id: venueData.subject_id || null,
      type: venueData.type,
      status: venueData.status || 'InActive',
      created_by: venueData.created_by || '9876543201', // Default to 'admin' if not provided
    };
    
    // Add the grades array separately to be handled in the model
    if (venueData.grade_ids && venueData.grade_ids.length) {
      preparedData.grade_ids = venueData.grade_ids;
    }

    Venue.create(preparedData, (err, venue) => {
      if (err) {
        console.error('Error creating venue:', err);
        return res.status(500).json({ success: false, message: 'Failed to create venue' });
      }
      res.json({ success: true, venue });
    });
  } catch (error) {
    console.error('Error in createVenue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
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