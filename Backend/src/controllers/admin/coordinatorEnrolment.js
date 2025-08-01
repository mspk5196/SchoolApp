const bcrypt = require('bcrypt');
const db = require('../../config/db');

exports.enrollCoordinator = async (req, res) => {
    try {
        const { name, dob, mobileNumber, specification, gender } = req.body;
        const grades = req.body.grades || [];
        const profilePhoto = req.file;

        if (!profilePhoto) {
            return res.status(400).json({ success: false, message: "Profile photo is required" });
        }

        if (!Array.isArray(grades) || grades.length === 0) {
            return res.status(400).json({ success: false, message: "At least one grade must be selected" });
        }

        const trx = await db.promise().beginTransaction();

        try {
            const countResult = await trx.query(
                `SELECT COUNT(*) as coordinator_count FROM Coordinators`
            );

            const coordinatorCount = countResult ? countResult[0].coordinator_count + 1 : 1;
            console.log(countResult);
            
            const newRoll = `C${String(coordinatorCount).padStart(3, '0')}`;
            const photoPath = profilePhoto.path;

            const existingUser = await trx.query(
                `SELECT * FROM Users WHERE phone = ?`,
                [mobileNumber]
            );
            
            if (existingUser.length > 0) {
                let roles = existingUser[0].roles;
                if (!roles.includes('Coordinator')) {
                    roles = roles + ',Coordinator';
                }
                await trx.query(`UPDATE Users SET roles = ? WHERE phone = ?`, [roles, mobileNumber]);
            } else {
                const hashedPassword = await bcrypt.hash(dob, 12);
                await trx.query(
                    `INSERT INTO Users (name, email, phone, password_hash, roles)
             VALUES (?, ?, ?, ?, ?)`,
                    [name, `${newRoll}@school.com`, mobileNumber, hashedPassword, 'Coordinator']
                );
                await trx.query(
                    `INSERT INTO facultyattendance (phone, total_days, on_duty_days, leave_days)
             VALUES (?, '1', '0', '0')`,
                    [mobileNumber]
                );
            }

            await trx.query(
                `INSERT INTO Coordinators (roll, phone, user_type, specification, dob, gender)
           VALUES (?, ?, ?, ?, ?, ?)`,
                [newRoll, mobileNumber, 'Coordinator', specification, dob, gender]
            );

            const coordinatorResult = await trx.query(
                `SELECT id FROM Coordinators WHERE roll = ?`,
                [newRoll]
            );
            const coordinatorId = coordinatorResult[0].id;
            console.log(coordinatorResult);
            

            for (const gradeId of grades) {
                await trx.query(
                    `INSERT INTO coordinator_grade_assignments (coordinator_id, grade_id)
             VALUES (?, ?)`,
                    [coordinatorId, gradeId]
                );
            }

            await trx.query(
                `INSERT INTO user_photos (phone, roll, file_path, is_profile_photo)
           VALUES (?, ?, ?, ?)`,
                [mobileNumber, newRoll, photoPath, 1]
            );

            await trx.commit();

            res.json({ success: true, message: "Coordinator enrolled successfully", roll: newRoll });

        } catch (err) {
            await trx.rollback();
            console.error("DB Insert Error:", err);
            res.status(500).json({ success: false, message: "Database error" });
        }
    } catch (error) {
        console.error("Enrollment error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
