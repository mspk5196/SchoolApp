const db = require('../../config/db');

exports.getUserRoles = async (req, res) => {
    const { phoneNumber } = req.body;

    const sql = `SELECT u.id, GROUP_CONCAT(DISTINCT r.role SEPARATOR ', ') AS roles
                 FROM Users u
                 JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = 1
                 JOIN roles r ON  r.id = ur.role_id
                 WHERE phone = ?
                 GROUP BY u.id;`;

    try {
        const [results] = await db.query(sql, [phoneNumber]);
        if (!results || results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const rolesArray = results[0].roles.split(', ').map(r => r.trim());
        return res.json({ success: true, data: rolesArray });
    } catch (err) {
        console.error('Error fetching user roles:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getGeneralData = async (req, res) => {
    const { phoneNumber, selectedRole } = req.body;

    const sql1 = `SELECT f.* 
                 FROM faculty f
                 WHERE f.phone = ?`;

    const sql2 = `SELECT s.*
                  FROM students s
                  WHERE s.mobile = ?`;

    try {
        if (selectedRole != 'Parent') {
            const [results] = await db.query(sql1, [phoneNumber]);
            return res.json({ success: true, message: 'User data fetched successfully', data: results[0] });
        }
        if (selectedRole === 'Parent') {
            const [results] = await db.query(sql2, [phoneNumber]);
            return res.json({ success: true, message: 'Student data fetched successfully', data: results[0] });
        }
        return res.status(400).json({ success: false, message: 'Invalid role' });
    } catch (err) {
        console.error('Error fetching general data:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getGrades = async (req, res) => {
    const sql = `SELECT g.id, g.grade_name
                 FROM grades g
                 ORDER BY g.id;`;
    try {
        const [results] = await db.query(sql);
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching grades:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getSections = async (req, res) => {
    const sql = `SELECT s.id as section_id, s.section_name, g.grade_name, s.grade_id
                 FROM sections s
                 JOIN grades g ON s.grade_id = g.id
                 ORDER BY g.id;`;
    try {
        const [results] = await db.query(sql);
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching sections:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getCoordinatorGrades = async (req, res) => {
    const { facultyId } = req.body;

    const sql = `SELECT cga.grade_id, g.grade_name
                 FROM coordinator_grade_assignments cga
                 JOIN grades g ON cga.grade_id = g.id
                 JOIN coordinators c ON c.id = cga.coordinator_id
                 WHERE c.faculty_id = ?`;

    try {
        const [results] = await db.query(sql, [facultyId]);
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching coordinator grades:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getGradeSections = async (req, res) => {
    const { gradeID } = req.body;
    const sql = `SELECT s.id as section_id, s.section_name
                 FROM sections s
                 WHERE s.grade_id = ?   
    `;
    try {
        const [results] = await db.query(sql, [gradeID]);
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error("Error fetching grade sections:", err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};