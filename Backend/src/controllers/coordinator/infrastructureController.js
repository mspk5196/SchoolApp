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
                SELECT 
                    v.id,
                    v.name,
                    v.block AS block_id,
                    b.block_name,
                    b.block_name AS block,
                    v.floor,
                    v.capacity,
                    v.type,
                    v.created_by,
                    vs.status AS venue_status,
                    CASE WHEN vs.status = 'Accepted' THEN 1 ELSE 0 END AS is_accepted,
                    CASE WHEN vu.is_under_use = 1 THEN 'Active' ELSE 'InActive' END AS status,
                    vs.is_usable,
                    vs.approved_at,
                    vs.rejected_at,
                    vs.rejection_reason,
                    vu.is_under_use,
                    v.created_at
                FROM venues v
                LEFT JOIN infra_blocks b ON v.block = b.id
                LEFT JOIN (
                    SELECT vs1.* FROM venue_status vs1
                    JOIN (SELECT venue_id, MAX(id) AS maxid FROM venue_status GROUP BY venue_id) mx 
                        ON vs1.venue_id = mx.venue_id AND vs1.id = mx.maxid
                ) vs ON vs.venue_id = v.id
                LEFT JOIN (
                    SELECT vu1.* FROM venue_usage vu1
                    JOIN (SELECT venue_id, MAX(id) AS maxid FROM venue_usage GROUP BY venue_id) mv 
                        ON vu1.venue_id = mv.venue_id AND vu1.id = mv.maxid
                ) vu ON vu.venue_id = v.id
                ORDER BY b.block_name, v.name
            `;

        const [rows] = await db.query(sql);
        return res.json({ success: true,  rows });
    } catch (error) {
        console.error('Error fetching venues:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch venues', error: error.message });
    }
};

// Create a new venue (and initialize related tables)
exports.createVenue = async (req, res) => {
    let conn;
    try {
        const { name, block_id, floor, capacity, type } = req.body;
        // created_by should come from authenticated user
        const createdBy = req.user && req.user.id ? req.user.id : null;

        if (!name || !block_id || floor === undefined || !capacity) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1) Insert into venues
        const [venueResult] = await conn.query(
            `INSERT INTO venues (name, block, floor, capacity, type, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [name, block_id, floor, capacity, type || 'Academic class', createdBy]
        );

        const venueId = venueResult.insertId;

        // 2) Initialize venue_status with a Pending, usable status
        await conn.query(
            `INSERT INTO venue_status (venue_id, status, is_usable, status_updated_by, created_at)
             VALUES (?, 'Pending', 1, ?, NOW())`,
            [venueId, createdBy]
        );

        // 3) Initialize venue_usage with not under use
        await conn.query(
            `INSERT INTO venue_usage (venue_id, is_under_use, updated_at)
             VALUES (?, 0, NOW())`,
            [venueId]
        );

        await conn.commit();

        return res.json({ success: true, message: 'Venue created', venueId });
    } catch (error) {
        if (conn) {
            try {
                await conn.rollback();
            } catch (rollbackErr) {
                console.error('Error rolling back venue creation transaction:', rollbackErr);
            }
        }
        console.error('Error creating venue:', error);
        return res.status(500).json({ success: false, message: 'Failed to create venue', error: error.message });
    } finally {
        if (conn) {
            conn.release();
        }
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

// ---------------------- Venue Mapping APIs ----------------------
// Get available grades
exports.getGradesForMapping = async (req, res) => {
    try {
        // grades table does not have is_active; return all with id and grade_name
        const [rows] = await db.query('SELECT id, grade_name FROM grades ORDER BY grade_name');
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching grades:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch grades', error: error.message });
    }
};

// Get sections by grade
exports.getSectionsForMapping = async (req, res) => {
    try {
        const { gradeId } = req.body;
        if (!gradeId) return res.status(400).json({ success: false, message: 'Grade id is required' });

        const [rows] = await db.query(
            'SELECT id, section_name FROM sections WHERE grade_id = ? AND is_active = 1 ORDER BY section_name',
            [gradeId]
        );
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch sections', error: error.message });
    }
};

// Get batches
exports.getBatchesForMapping = async (req, res) => {
    const {sectionId} = req.body;
    try {
        const [rows] = await db.query(`
            SELECT sb.id, sb.batch_name, ssa.subject_id, s.subject_name 
            FROM section_batches sb 
            JOIN subject_section_assignments ssa ON sb.subject_section_id = ssa.id
            JOIN subjects s ON ssa.subject_id = s.id 
            WHERE sb.is_active = 1 AND ssa.section_id = ?
            ORDER BY sb.batch_name
            `, [sectionId]);
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching batches:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch batches', error: error.message });
    }
};

// Get activities (context activities) as hierarchy for a given section and subject
exports.getActivitiesForMapping = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.body || {};
        if (!sectionId || !subjectId) {
            return res.status(400).json({ success: false, message: 'sectionId and subjectId are required' });
        }

        // Fetch all context activities for section + subject with their names and parents
        const [rows] = await db.query(
            `SELECT 
                ca.id,
                ca.parent_context_id,
                a.name AS activity_name
             FROM context_activities ca
             JOIN activities a ON ca.activity_id = a.id
             WHERE ca.section_id = ? AND ca.subject_id = ?
             ORDER BY a.name`
            , [sectionId, subjectId]
        );

        // Build a tree structure on the server side
        const nodeMap = new Map();
        rows.forEach(r => {
            nodeMap.set(r.id, { id: r.id, activity_name: r.activity_name, parent_context_id: r.parent_context_id, children: [] });
        });
        const roots = [];
        nodeMap.forEach(node => {
            if (node.parent_context_id && nodeMap.has(node.parent_context_id)) {
                nodeMap.get(node.parent_context_id).children.push(node);
            } else {
                roots.push(node);
            }
        });

        return res.json({ success: true, data: roots });
    } catch (error) {
        console.error('Error fetching activities:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
    }
};

// Get existing mappings for a venue (both active and inactive)
exports.getVenueMappings = async (req, res) => {
    try {
        const { venueId } = req.body;
        if (!venueId) return res.status(400).json({ success: false, message: 'Venue id is required' });

        const sql = `
            SELECT 
                vm.id,
                vm.venue_id,
                vm.grade_id,
                vm.section_id,
                vm.batch_id,
                vm.context_activity_id,
                g.grade_name,
                s.section_name,
                b.batch_name,
                a.name AS activity_name,
                vm.is_active,
                vm.created_at
            FROM venue_mappings vm
            LEFT JOIN grades g ON vm.grade_id = g.id
            LEFT JOIN sections s ON vm.section_id = s.id
            LEFT JOIN section_batches b ON vm.batch_id = b.id
            LEFT JOIN context_activities ca ON vm.context_activity_id = ca.id
            LEFT JOIN activities a ON ca.activity_id = a.id
            WHERE vm.venue_id = ?
            ORDER BY vm.is_active DESC, vm.created_at DESC
        `;

        const [rows] = await db.query(sql, [venueId]);
        return res.json(rows);
    } catch (error) {
        console.error('Error fetching venue mappings:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch venue mappings', error: error.message });
    }
};

// Create venue mapping
exports.createVenueMapping = async (req, res) => {
    try {
        const { venueId, gradeId, sectionId, batchId, contextActivityId } = req.body;
        const userId = req.user && req.user.id ? req.user.id : null;

        if (!venueId) return res.status(400).json({ success: false, message: 'Venue id is required' });

        // At least one mapping target should be provided
        if (!gradeId && !sectionId && !batchId && !contextActivityId) {
            return res.status(400).json({ success: false, message: 'At least one mapping target is required' });
        }

        const [result] = await db.query(
            `INSERT INTO venue_mappings (venue_id, grade_id, section_id, batch_id, context_activity_id, is_active, mapped_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
            [venueId, gradeId || null, sectionId || null, batchId || null, contextActivityId || null, userId]
        );

        return res.json({ success: true, message: 'Venue mapping created', mappingId: result.insertId });
    } catch (error) {
        console.error('Error creating venue mapping:', error);
        return res.status(500).json({ success: false, message: 'Failed to create venue mapping', error: error.message });
    }
};

// Deactivate (soft delete) venue mapping
exports.deleteVenueMapping = async (req, res) => {
    try {
        const { mappingId } = req.body;
        if (!mappingId) return res.status(400).json({ success: false, message: 'Mapping id is required' });

        await db.query('UPDATE venue_mappings SET is_active = 0, updated_at = NOW() WHERE id = ?', [mappingId]);
        return res.json({ success: true, message: 'Venue mapping deactivated' });
    } catch (error) {
        console.error('Error deleting venue mapping:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete venue mapping', error: error.message });
    }
};

// Activate venue mapping
exports.activateVenueMapping = async (req, res) => {
    try {
        const { mappingId } = req.body;
        if (!mappingId) return res.status(400).json({ success: false, message: 'Mapping id is required' });

        await db.query('UPDATE venue_mappings SET is_active = 1, updated_at = NOW() WHERE id = ?', [mappingId]);
        return res.json({ success: true, message: 'Venue mapping activated' });
    } catch (error) {
        console.error('Error activating venue mapping:', error);
        return res.status(500).json({ success: false, message: 'Failed to activate venue mapping', error: error.message });
    }
};
