const db = require('../../config/db');

exports.getCoordinatorGrades = (req, res) => {

    const sql = `SELECT 
    f.id AS faculty_id,
    f.name AS faculty_name,
    f.email,
    f.phone,
    f.roll,
    f.profile_photo,
    f.user_id,
    f.specification,
    GROUP_CONCAT(DISTINCT cg.grade_id ORDER BY g.id SEPARATOR ', ') AS assigned_grade_ids,
    GROUP_CONCAT(DISTINCT g.grade_name ORDER BY g.id SEPARATOR ', ') AS assigned_grades
FROM faculty f
JOIN coordinators c ON f.id = c.faculty_id
JOIN coordinator_grade_assignments cg ON c.id = cg.coordinator_id
JOIN grades g ON cg.grade_id = g.id
GROUP BY f.id
ORDER BY f.id;
`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching coordinator grades:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, data: results });
    });
};