// ---------------------- Infrastructure / Venues APIs ----------------------
const db = require('../../config/db');
// Get infra blocks
exports.getBlocks = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, block_name FROM infra_blocks ORDER BY block_name');
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching blocks:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch blocks', error: error.message });
    }
};

// Get all venues with latest status and usage
exports.getAllVenues = async (req, res) => {
    try {
        const sql = `
                SELECT v.id, v.name, v.block AS block_id, b.block_name, v.floor, v.capacity, v.type, v.created_by,
                             vs.status as venue_status, vs.is_usable, vs.approved_at, vs.rejected_at, vs.rejection_reason,
                             vu.is_under_use
                FROM venues v
                LEFT JOIN infra_blocks b ON v.block = b.id
                LEFT JOIN (
                    SELECT vs1.* FROM venue_status vs1
                    JOIN (SELECT venue_id, MAX(id) as maxid FROM venue_status GROUP BY venue_id) mx ON vs1.venue_id = mx.venue_id AND vs1.id = mx.maxid
                ) vs ON vs.venue_id = v.id
                LEFT JOIN (
                    SELECT vu1.* FROM venue_usage vu1
                    JOIN (SELECT venue_id, MAX(id) as maxid FROM venue_usage GROUP BY venue_id) mv ON vu1.venue_id = mv.venue_id AND vu1.id = mv.maxid
                ) vu ON vu.venue_id = v.id
                ORDER BY b.block_name, v.name
            `;

        const [rows] = await db.query(sql);
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching venues:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch venues', error: error.message });
    }
};

// Create a new venue
exports.createVenue = async (req, res) => {
    try {
        const { name, block_id, floor, capacity, type } = req.body;
        // created_by should come from authenticated user
        const createdBy = req.user && req.user.id ? req.user.id : null;

        if (!name || !block_id || !floor || !capacity) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const [result] = await db.query(
            `INSERT INTO venues (name, block, floor, capacity, type, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [name, block_id, floor, capacity, type || 'Academic class', createdBy]
        );

        return res.json({ success: true, message: 'Venue created', venueId: result.insertId });
    } catch (error) {
        console.error('Error creating venue:', error);
        return res.status(500).json({ success: false, message: 'Failed to create venue', error: error.message });
    }
};

// Update venue
exports.updateVenue = async (req, res) => {
    try {
        const venueId = req.params.id;
        const { name, block_id, floor, capacity, type } = req.body;

        if (!venueId) return res.status(400).json({ success: false, message: 'Venue id is required' });

        const updates = [];
        const values = [];
        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (block_id !== undefined) { updates.push('block = ?'); values.push(block_id); }
        if (floor !== undefined) { updates.push('floor = ?'); values.push(floor); }
        if (capacity !== undefined) { updates.push('capacity = ?'); values.push(capacity); }
        if (type !== undefined) { updates.push('type = ?'); values.push(type); }

        if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

        values.push(venueId);
        const sql = `UPDATE venues SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
        await db.query(sql, values);

        return res.json({ success: true, message: 'Venue updated' });
    } catch (error) {
        console.error('Error updating venue:', error);
        return res.status(500).json({ success: false, message: 'Failed to update venue', error: error.message });
    }
};

// Delete venue
exports.deleteVenue = async (req, res) => {
    try {
        const venueId = req.params.id;
        if (!venueId) return res.status(400).json({ success: false, message: 'Venue id is required' });

        await db.query('DELETE FROM venues WHERE id = ?', [venueId]);
        return res.json({ success: true, message: 'Venue deleted' });
    } catch (error) {
        console.error('Error deleting venue:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete venue', error: error.message });
    }
};

// Update venue status (maps front-end Active/InActive to venue_status rows)
exports.updateVenueStatus = async (req, res) => {
    try {
        const venueId = req.params.id;
        const { status } = req.body; // expects 'Active' or 'InActive'
        const userId = req.user && req.user.id ? req.user.id : null;

        if (!venueId || !status) return res.status(400).json({ success: false, message: 'Venue id and status required' });

        // Map to venue_status values
        const isUsable = status === 'Active' ? 1 : 0;
        const vsStatus = isUsable ? 'Accepted' : 'Rejected';

        await db.query(
            `INSERT INTO venue_status (venue_id, status, approved_by, approved_at, is_usable, status_updated_by, created_at) VALUES (?, ?, ?, NOW(), ?, ?, NOW())`,
            [venueId, vsStatus, userId, isUsable, userId]
        );

        return res.json({ success: true, message: 'Venue status updated' });
    } catch (error) {
        console.error('Error updating venue status:', error);
        return res.status(500).json({ success: false, message: 'Failed to update venue status', error: error.message });
    }
};
