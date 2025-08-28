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
    SELECT id, name, block, floor, capacity, type, venue_status, is_accepted
    FROM venues
    WHERE (grade_id = ? OR grade_id IS NULL)
    ORDER BY is_accepted DESC, venue_status ASC, name`;

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
      grade_id: venueData.grade_id || null, // Single grade
      type: venueData.type,
      status: venueData.status || 'InActive',
      created_by: venueData.created_by || '9876543201',
    };
    
    // Add the subjects array separately to be handled in the model
    if (venueData.subject_ids && venueData.subject_ids.length) {
      preparedData.subject_ids = venueData.subject_ids;
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
  console.log('Update venue request for ID:', req.params.id);
  console.log('Request body:', req.body);
  
  Venue.findById(req.params.id, (err, venue) => {
    if (err) {
      console.error('Error finding venue:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!venue) {
      console.log('Venue not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Venue not found' });
    }

    console.log('Found venue, updating...');
    Venue.update(req.params.id, req.body, (err, updatedVenue) => {
      if (err) {
        console.error('Error updating venue:', err);
        return res.status(400).json({ message: 'Invalid data' });
      }
      console.log('Venue updated successfully');
      res.json(updatedVenue);
    });
  });
};

exports.deleteVenue = (req, res) => {
  try {
    const venueId = req.params.id;
    
    if (!venueId) {
      return res.status(400).json({ success: false, message: 'Venue ID is required' });
    }

    Venue.findById(venueId, (err, venue) => {
      if (err) {
        console.error('Error finding venue for deletion:', err);
        return res.status(500).json({ success: false, message: 'Server error while finding venue' });
      }
      
      if (!venue) {
        return res.status(404).json({ success: false, message: 'Venue not found' });
      }

      Venue.delete(venueId, (err, result) => {
        if (err) {
          console.error('Error deleting venue:', err);
          return res.status(500).json({ success: false, message: 'Server error while deleting venue' });
        }
        
        console.log('Venue deleted successfully:', venueId);
        res.status(200).json({ 
          success: true, 
          message: 'Venue deleted successfully',
          deletedVenueId: venueId
        });
      });
    });
  } catch (error) {
    console.error('Unexpected error in deleteVenue:', error);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
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

// Admin approval endpoints
exports.approveVenue = (req, res) => {
  const { id } = req.params;
  
  Venue.approveVenue(id, (err, venue) => {
    if (err) {
      console.error('Error approving venue:', err);
      return res.status(500).json({ success: false, message: 'Failed to approve venue' });
    }
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, message: 'Venue approved successfully', venue });
  });
};

exports.rejectVenue = (req, res) => {
  const { id } = req.params;
  
  Venue.rejectVenue(id, (err, venue) => {
    if (err) {
      console.error('Error rejecting venue:', err);
      return res.status(500).json({ success: false, message: 'Failed to reject venue' });
    }
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, message: 'Venue rejected successfully', venue });
  });
};

exports.getPendingVenues = (req, res) => {
  Venue.getPendingVenues((err, venues) => {
    if (err) {
      console.error('Error fetching pending venues:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch pending venues' });
    }
    res.json({ success: true, venues });
  });
};