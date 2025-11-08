const db = require('../../config/db');

exports.getUserRoles = (req, res) => {
    const { phoneNumber } = req.body;

    const sql = `SELECT u.id, GROUP_CONCAT(DISTINCT r.role SEPARATOR ', ') AS roles
                 FROM Users u
                 JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = 1
                 JOIN roles r ON  r.id = ur.role_id
                 WHERE phone = ?
                 GROUP BY u.id;`;

    db.query(sql, [phoneNumber], (err, results) => {
        if (err) {
            console.error('Error fetching user roles:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log(results);

        const rolesArray = results[0].roles.split(', ').map(r => r.trim());
        console.log(rolesArray);

        res.json({ success: true, data: rolesArray });
    });
};

exports.getGeneralData = (req, res) => {
    const { phoneNumber, selectedRole } = req.body;

    const sql1 = `SELECT f.* 
                 FROM faculty f
                 WHERE f.phone = ?`;

    const sql2 = `SELECT s.*
                  FROM students s
                  WHERE s.mobile = ?`;

    if (selectedRole != 'Parent') {
        db.query(sql1, [phoneNumber], (err, results) => {
            if (err) {
                console.error('Error fetching faculty data:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            // console.log(results[0]);
            
            res.json({ success: true, message: 'User data fetched successfully', data: results[0] });
        });
    }
    if(selectedRole === 'Parent') {
        db.query(sql2, [phoneNumber], (err, results) => {
            if (err) {
                console.error('Error fetching student data:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ success: true, message: 'Student data fetched successfully', data: results[0] });
        });
    }
};

exports.getGrades = (req, res) => {
    const sql = `SELECT g.id, g.grade_name
                 FROM grades g
                 ORDER BY g.id;`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching grades:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, data: results });
    });
};

exports.getSections = (req, res) => {
    const sql = `SELECT s.id as section_id, s.section_name, g.grade_name, s.grade_id
                 FROM sections s
                 JOIN grades g ON s.grade_id = g.id
                 ORDER BY g.id;`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching sections:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, data: results });
    });
};

exports.getCoordinatorGrades = (req, res) => {
    const { facultyId } = req.body;

    const sql = `SELECT cga.grade_id, g.grade_name
                 FROM coordinator_grade_assignments cga
                 JOIN grades g ON cga.grade_id = g.id
                 JOIN coordinators c ON c.id = cga.coordinator_id
                 WHERE c.faculty_id = ?`;

    db.query(sql, [facultyId], (err, results) => {
        if (err) {
            console.error('Error fetching coordinator grades:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, data: results });
    });
};

exports.getGradeSections = (req, res) => {
    const { gradeID } = req.body;
    const sql = `SELECT s.id as section_id, s.section_name
                 FROM sections s
                 WHERE s.grade_id = ?   
    `;
    db.query(sql, [gradeID], (err, results) => {
        if (err) {
            console.error("Error fetching grade sections:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, data: results });
    });
};