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