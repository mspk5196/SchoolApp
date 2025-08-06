// messageController.js
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
// const { io } = require('../../../server.js');

// Configure storage for message attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/message_attachments';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (!ext) {
      const mimeMap = {
        'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif',
        'application/pdf': '.pdf', 'audio/mp3': '.mp3', 'audio/mpeg': '.mp3',
      };
      ext = mimeMap[file.mimetype] || '';
    }
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

const uploadAttachment = multer({
  storage: attachmentStorage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// exports.getMessages = async (req, res) => {
//   try {
//     const { sender_id, receiver_id, sender_type, last_message_id = 0, receiver_type } = req.body;

//     // First, fetch the messages
//     const [messages] = await db.promise().query(`
//       SELECT m.*, 
//         CASE 
//             WHEN m.sender_type = 'student' THEN st.name
//             WHEN m.sender_type = 'mentor' THEN u_sender.name
//             WHEN m.sender_type = 'coordinator' THEN u_sender.name
//             WHEN m.sender_type = 'admin' THEN ad_sender.name
//         END as sender_name,
//         CASE 
//             WHEN m.sender_type = 'student' THEN st.profile_photo
//             WHEN m.sender_type IN ('mentor', 'coordinator', 'admin') THEN up_sender.file_path
//         END as sender_profile
//       FROM messages m
//       -- Joins for sender's details
//       LEFT JOIN students st ON m.sender_id = st.id AND m.sender_type = 'student'
//       LEFT JOIN mentors ment ON m.sender_id = ment.id AND m.sender_type = 'mentor'
//       LEFT JOIN coordinators co ON m.sender_id = co.id AND m.sender_type = 'coordinator'
//       LEFT JOIN admins ad_sender ON m.sender_id = ad_sender.id AND m.sender_type = 'admin'
//       LEFT JOIN Users u_sender ON (ment.phone = u_sender.phone OR co.phone = u_sender.phone OR ad_sender.phone = u_sender.phone)
//       LEFT JOIN User_photos up_sender ON u_sender.phone = up_sender.phone
//       WHERE (
//           (m.sender_id = ? AND m.sender_type = ? AND m.receiver_id = ? AND m.receiver_type = ?)
//           OR 
//           (m.sender_id = ? AND m.sender_type = ? AND m.receiver_id = ? AND m.receiver_type = ?)
//       )
//       AND m.message_id > ?
//       ORDER BY m.created_at ASC
//     `, [
//       sender_id, sender_type, receiver_id, receiver_type,
//       receiver_id, receiver_type, sender_id, sender_type,
//       last_message_id
//     ]);

//     // Then, mark the messages as read
//     const [messageRows] = await db.promise().query(`
//       SELECT message_id
//       FROM messages 
//       WHERE receiver_id = ? AND receiver_type = ?
//         AND sender_id = ? AND sender_type = ?
//         AND is_read = 0
//     `, [sender_id, sender_type, receiver_id, receiver_type]);

//     const messageIdsToMarkAsRead = messageRows.map(row => row.message_id);

//     if (messageIdsToMarkAsRead.length > 0) {
//       await db.promise().query(`
//         UPDATE messages
//         SET is_read = 1
//         WHERE message_id IN (?)
//       `, [messageIdsToMarkAsRead]);

//       // Emit read event back to the original sender
//       const { io } = require('../../../server.js');
//       io.to(receiver_id.toString()).emit('messagesRead', { 
//           messageIds: messageIdsToMarkAsRead,
//           // These fields identify who read the message, not strictly needed but good practice
//           readerId: sender_id, 
//           readerType: sender_type
//       });
//     }

//     res.json({ success: true, messages });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error fetching messages' });
//   }
// };

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { sender_id, receiver_id, sender_type, last_message_id = 0, receiver_type } = req.body;

    // Fetch the messages
    const [messages] = await db.promise().query(`
      SELECT m.*, 
        CASE 
            WHEN m.sender_type = 'student' THEN st.name
            WHEN m.sender_type IN ('mentor', 'coordinator', 'admin') THEN u_sender.name
        END as sender_name,
        CASE 
            WHEN m.sender_type = 'student' THEN st.profile_photo
            WHEN m.sender_type IN ('mentor', 'coordinator', 'admin') THEN up_sender.file_path
        END as sender_profile
      FROM messages m
      LEFT JOIN students st ON m.sender_id = st.id AND m.sender_type = 'student'
      LEFT JOIN mentors ment ON m.sender_id = ment.id AND m.sender_type = 'mentor'
      LEFT JOIN coordinators co ON m.sender_id = co.id AND m.sender_type = 'coordinator'
      LEFT JOIN admins ad ON m.sender_id = ad.id AND m.sender_type = 'admin'
      LEFT JOIN Users u_sender ON (ment.phone = u_sender.phone OR co.phone = u_sender.phone OR ad.phone = u_sender.phone)
      LEFT JOIN User_photos up_sender ON u_sender.phone = up_sender.phone
      WHERE (
          (m.sender_id = ? AND m.sender_type = ? AND m.receiver_id = ? AND m.receiver_type = ?)
          OR 
          (m.sender_id = ? AND m.sender_type = ? AND m.receiver_id = ? AND m.receiver_type = ?)
      )
      AND m.message_id > ?
      ORDER BY m.created_at ASC
    `, [
      sender_id, sender_type, receiver_id, receiver_type,
      receiver_id, receiver_type, sender_id, sender_type,
      last_message_id
    ]);

    // The client will mark messages as read via socket for real-time updates
    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

// exports.getMentorMessages = async (req, res) => {
//   try {
//     const { mentor_id, student_id } = req.body;
//     if (!mentor_id || !student_id) {
//       return res.status(400).json({ success: false, message: 'mentor_id and student_id required' });
//     }
//     const [rows] = await db.promise().query(`
//       SELECT * FROM messages
//       WHERE 
//         (sender_id = ? AND receiver_id = ? AND sender_type = 'mentor' AND receiver_type = 'student')
//         OR
//         (sender_id = ? AND receiver_id = ? AND sender_type = 'student' AND receiver_type = 'mentor')
//       ORDER BY created_at ASC
//     `, [mentor_id, student_id, student_id, mentor_id]);
//     res.json({ success: true, messages: rows });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error fetching messages' });
//   }
// };

// Send a text message

exports.getMentorMessages = async (req, res) => {
  try {
    const { mentor_id, student_id } = req.body;
    if (!mentor_id || !student_id) {
      return res.status(400).json({ success: false, message: 'mentor_id and student_id required' });
    }
    const [rows] = await db.promise().query(`
      SELECT * FROM messages
      WHERE 
        (sender_id = ? AND receiver_id = ? AND sender_type = 'mentor' AND receiver_type = 'student')
        OR
        (sender_id = ? AND receiver_id = ? AND sender_type = 'student' AND receiver_type = 'mentor')
      ORDER BY created_at ASC
    `, [mentor_id, student_id, student_id, mentor_id]);
    res.json({ success: true, messages: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

// exports.sendMessage = async (req, res) => {
//   try {
//     const { sender_id, receiver_id, sender_type, message_text, receiver_type } = req.body;

//     const [result] = await db.promise().query(`
//       INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, message_text, created_at)
//       VALUES (?, ?, ?, ?, ?, NOW())
//     `, [sender_id, receiver_id, sender_type, receiver_type, message_text]);

//     const [newMessage] = await db.promise().query(`
//       SELECT m.*, 
//         CASE 
//           WHEN m.sender_type = 'student' THEN s.name
//           WHEN m.sender_type = 'mentor' THEN u.name
//           WHEN m.sender_type = 'coordinator' THEN u.name
//           WHEN m.sender_type = 'admin' THEN u.name
//         END as sender_name,
//         CASE 
//           WHEN m.sender_type = 'student' THEN s.profile_photo
//           WHEN m.sender_type = 'mentor' THEN up.file_path
//           WHEN m.sender_type = 'coordinator' THEN up.file_path
//           WHEN m.sender_type = 'admin' THEN up.file_path
//         END as sender_profile
//       FROM messages m
//       LEFT JOIN students s ON m.sender_id = s.id AND m.sender_type = 'student'
//       LEFT JOIN mentors mt ON m.sender_id = mt.id AND m.sender_type = 'mentor'
//       LEFT JOIN coordinators c ON m.sender_id = c.id AND m.sender_type = 'coordinator'
//       LEFT JOIN admins adn ON m.sender_id = adn.id AND m.sender_type = 'admin'
//       LEFT JOIN Users u ON mt.phone = u.phone
//       LEFT JOIN User_photos up ON mt.phone = up.phone
//       WHERE m.message_id = ?
//     `, [result.insertId]);

//     res.json({ success: true, message: newMessage[0] });

//     // Notify receiver via WebSocket or push notification
//     notifyReceiver(receiver_id, receiver_type, newMessage[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error sending message' });
//   }
// };

// Send an attachment

exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, sender_type, message_text, receiver_type } = req.body;

    const [result] = await db.promise().query(`
      INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, message_text, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [sender_id, receiver_id, sender_type, receiver_type, message_text]);

    const [newMessage] = await db.promise().query(`
      SELECT * FROM messages WHERE message_id = ?
    `, [result.insertId]);

    res.json({ success: true, message: newMessage[0] });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
};

// exports.sendAttachment = async (req, res) => {
//   try {
//     const { sender_id, receiver_id, sender_type, receiver_type } = req.body;
//     const file = req.file;
//     console.log(file);

//     if (!file) {
//       return res.status(400).json({ success: false, message: 'No file uploaded' });
//     }

//     const fileType = getFileType(file.mimetype);
//     const filePath = `/message_attachments/${file.filename}`;



//     const [result] = await db.promise().query(`
//       INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, attachment_path, attachment_type, created_at)
//       VALUES (?, ?, ?, ?, ?, ?, NOW())
//     `, [sender_id, receiver_id, sender_type, receiver_type, filePath, fileType]);

//     const [newMessage] = await db.promise().query(`
//       SELECT m.*, 
//         CASE 
//           WHEN m.sender_type = 'student' THEN s.name
//           WHEN m.sender_type = 'mentor' THEN u.name
//           WHEN m.sender_type = 'coordinator' THEN u.name
//           WHEN m.sender_type = 'admin' THEN u.name
//         END as sender_name,
//         CASE 
//           WHEN m.sender_type = 'student' THEN s.profile_photo
//           WHEN m.sender_type = 'mentor' THEN up.file_path
//           WHEN m.sender_type = 'coordinator' THEN up.file_path
//           WHEN m.sender_type = 'admin' THEN up.file_path
//         END as sender_profile
//       FROM messages m
//       LEFT JOIN students s ON m.sender_id = s.id AND m.sender_type = 'student'
//       LEFT JOIN mentors mt ON m.sender_id = mt.id AND m.sender_type = 'mentor'
//       LEFT JOIN coordinators c ON m.sender_id = c.id AND m.sender_type = 'coordinator'
//       LEFT JOIN admins adn ON m.sender_id = adn.id AND m.sender_type = 'admin'
//       LEFT JOIN Users u ON mt.phone = u.phone
//       LEFT JOIN User_photos up ON mt.phone = up.phone
//       WHERE m.message_id = ?
//     `, [result.insertId]);

//     res.json({ success: true, message: newMessage[0] });

//     // Notify receiver via WebSocket or push notification
//     notifyReceiver(receiver_id, receiver_type, newMessage[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error sending attachment' });
//   }
// };

exports.sendAttachment = async (req, res) => {
  try {
    const { sender_id, receiver_id, sender_type, receiver_type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileType = getFileType(file.mimetype);
    const filePath = `/message_attachments/${file.filename}`;

    const [result] = await db.promise().query(`
      INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, attachment_path, attachment_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [sender_id, receiver_id, sender_type, receiver_type, filePath, fileType]);

    const [newMessage] = await db.promise().query(`
      SELECT * FROM messages WHERE message_id = ?
    `, [result.insertId]);

    res.json({ success: true, message: newMessage[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending attachment' });
  }
};

function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (mimetype === 'application/msword') return 'doc';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
  if (mimetype === 'application/vnd.ms-excel') return 'xls';
  return 'other';
}

// Delete messages
// exports.deleteMessages = async (req, res) => {
//   try {
//     const { message_ids } = req.body;

//     if (!message_ids || !Array.isArray(message_ids)) {
//       return res.status(400).json({ success: false, message: 'Invalid message IDs' });
//     }

//     // Delete messages from database
//     await db.promise().query(`
//       DELETE FROM messages 
//       WHERE message_id IN (?)
//     `, [message_ids]);

//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error deleting messages' });
//   }
// };

exports.deleteMessages = async (req, res) => {
  try {
    const { message_ids } = req.body;
    if (!message_ids || !Array.isArray(message_ids) || message_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid message IDs' });
    }
    await db.promise().query(`DELETE FROM messages WHERE message_id IN (?)`, [message_ids]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting messages' });
  }
};

const getInboxQuery = (user_type, user_id, grade_ids = []) => {
    const is_mentor_or_coord = ['mentor', 'coordinator'].includes(user_type);

    return `
    WITH conversations AS (
        SELECT 
            m1.*,
            IF(m1.sender_id = ? AND m1.sender_type = ?, m1.receiver_id, m1.sender_id) AS contact_id,
            IF(m1.sender_id = ? AND m1.sender_type = ?, m1.receiver_type, m1.sender_type) AS contact_type
        FROM messages m1
        INNER JOIN (
            SELECT MAX(message_id) AS max_id
            FROM messages
            WHERE (sender_id = ? AND sender_type = ?) OR (receiver_id = ? AND receiver_type = ?)
            GROUP BY LEAST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type)),
                     GREATEST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type))
        ) m2 ON m1.message_id = m2.max_id
    ),
    unread_counts AS (
        SELECT sender_id, sender_type, COUNT(*) AS unread_count
        FROM messages
        WHERE receiver_id = ? AND receiver_type = ? AND is_read = 0
        GROUP BY sender_id, sender_type
    )
    SELECT 
        c.*,
        COALESCE(uc.unread_count, 0) AS unread_received_count,
        st.name as student_name, st.profile_photo as student_profile,
        u.name as user_name, up.file_path as user_profile,
        s.grade_id, s.section_name,
        CASE
            WHEN c.contact_type = 'student' THEN st.name
            ELSE u.name
        END AS contact_name,
        CASE
            WHEN c.contact_type = 'student' THEN st.profile_photo
            ELSE up.file_path
        END AS contact_profile
    FROM conversations c
    LEFT JOIN unread_counts uc ON c.contact_id = uc.sender_id AND c.contact_type = uc.sender_type
    LEFT JOIN students st ON c.contact_id = st.id AND c.contact_type = 'student'
    LEFT JOIN mentors m ON c.contact_id = m.id AND c.contact_type = 'mentor'
    LEFT JOIN coordinators co ON c.contact_id = co.id AND c.contact_type = 'coordinator'
    LEFT JOIN admins ad ON c.contact_id = ad.id AND c.contact_type = 'admin'
    LEFT JOIN Users u ON u.phone IN (m.phone, co.phone, ad.phone)
    LEFT JOIN User_photos up ON up.phone = u.phone
    LEFT JOIN Sections s ON s.id IN (st.section_id, m.section_id)
    ORDER BY c.created_at DESC
    `;
};

// Get all conversations for a mentor (inbox)
exports.getMentorInbox = async (req, res) => {
  try {
    const { mentor_id } = req.body;

    if (!mentor_id) {
      return res.status(400).json({ success: false, message: 'Mentor ID is required.' });
    }

    const query = `
           WITH existing_conversations AS (
    SELECT
        last_msg.*,
        COALESCE(uc.unread_count, 0) AS unread_received_count,
        CASE
            WHEN last_msg.contact_type = 'student' THEN st.name
            WHEN last_msg.contact_type = 'coordinator' THEN u.name
            WHEN last_msg.contact_type = 'admin' THEN u.name
            WHEN last_msg.contact_type = 'mentor' THEN u.name
        END AS contact_name,
        CASE
            WHEN last_msg.contact_type = 'student' THEN st.profile_photo
            WHEN last_msg.contact_type IN ('coordinator', 'admin', 'mentor') THEN up.file_path
        END AS contact_profile,
        CASE 
            WHEN last_msg.contact_type = 'student' THEN sec.section_name 
            WHEN last_msg.contact_type = 'mentor' THEN sec.section_name
        END AS section_name,
        CASE WHEN last_msg.contact_type = 'student' THEN sec.grade_id
             WHEN last_msg.contact_type = 'mentor' THEN sec.grade_id
        END AS grade_id
         
    FROM (
        SELECT
            m1.*,
            IF(m1.sender_id = ? AND m1.sender_type = 'mentor', m1.receiver_id, m1.sender_id) AS contact_id,
            IF(m1.sender_id = ? AND m1.sender_type = 'mentor', m1.receiver_type, m1.sender_type) AS contact_type
        FROM messages m1
        INNER JOIN (
            SELECT MAX(message_id) AS max_id
            FROM messages
            WHERE (sender_id = ? AND sender_type = 'mentor') OR (receiver_id = ? AND receiver_type = 'mentor')
            GROUP BY
                LEAST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type)),
                GREATEST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type))
        ) m2 ON m1.message_id = m2.max_id
    ) AS last_msg
    LEFT JOIN (
        SELECT sender_id, sender_type, COUNT(*) AS unread_count
        FROM messages
        WHERE receiver_id = ? AND receiver_type = 'mentor' AND is_read = 0
        GROUP BY sender_id, sender_type
    ) AS uc ON uc.sender_id = last_msg.contact_id AND uc.sender_type = last_msg.contact_type
    LEFT JOIN students st ON last_msg.contact_type = 'student' AND last_msg.contact_id = st.id
    LEFT JOIN coordinators co ON last_msg.contact_type = 'coordinator' AND last_msg.contact_id = co.id
    LEFT JOIN admins ad ON last_msg.contact_type = 'admin' AND last_msg.contact_id = ad.id
    LEFT JOIN mentors mtr ON last_msg.contact_type = 'mentor' AND last_msg.contact_id = mtr.id
    LEFT JOIN Users u ON 
        (last_msg.contact_type = 'coordinator' AND co.phone = u.phone) OR
        (last_msg.contact_type = 'mentor' AND mtr.phone = u.phone) OR
        (last_msg.contact_type = 'admin' AND ad.phone = u.phone)
    LEFT JOIN Sections sec ON 
        (last_msg.contact_type = 'student' AND st.section_id = sec.id) OR
        (last_msg.contact_type = 'mentor' AND mtr.section_id = sec.id)
    LEFT JOIN User_photos up ON 
        (last_msg.contact_type = 'coordinator' AND co.phone = up.phone) OR
        (last_msg.contact_type = 'mentor' AND mtr.phone = up.phone) OR
        (last_msg.contact_type = 'admin' AND ad.phone = up.phone)
)

SELECT * FROM existing_conversations

UNION ALL

SELECT
    NULL AS message_id, NULL AS sender_id, ? AS receiver_id, 'student' AS sender_type, 'mentor' AS receiver_type,
    'Start a conversation...' AS message_text,
    NULL AS attachment_path, NULL AS attachment_type, NULL AS created_at, 0 AS is_read,
    st.id AS contact_id,
    'student' AS contact_type,
    0 AS unread_received_count,
    st.name AS contact_name,
    st.profile_photo AS contact_profile,
    sec.section_name,
    sec.grade_id
FROM students st
JOIN Sections sec ON st.section_id = sec.id
WHERE st.mentor_id = ?
AND st.id NOT IN (
    SELECT contact_id FROM existing_conversations WHERE contact_type = 'student'
)

ORDER BY
    CASE WHEN created_at IS NULL THEN 1 ELSE 0 END,
    created_at DESC,
    contact_name ASC;

        `;

    const params = [
      mentor_id, mentor_id, mentor_id, mentor_id, // for existing_conversations.last_msg
      mentor_id,                                  // for existing_conversations.uc
      mentor_id,                                  // for Part 2 (new students) receiver_id
      mentor_id                                   // for Part 2 (new students) WHERE st.mentor_id = ?
    ];

    const [inbox] = await db.promise().query(query, params);

    res.json({ success: true, inbox });
  } catch (error) {
    console.error('Error fetching mentor inbox:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getCoordinatorInbox = async (req, res) => {
  try {
    const { coordinator_id, coordinatorGrades } = req.body;

    if (!coordinator_id || !coordinatorGrades || !Array.isArray(coordinatorGrades)) {
      return res.status(400).json({ success: false, message: 'coordinator_id and coordinatorGrades array are required.' });
    }

    // Handle case where coordinator might not be assigned any grades yet
    const gradeIds = coordinatorGrades.map(g => g.grade_id);
    if (gradeIds.length === 0) {
      // No grades, but we can still show conversations with admins if they exist.
      // For simplicity, we can let the query run with an empty `IN ()`, which is valid.
    }

    const query = `
            -- CTE for all existing conversations for this coordinator
            WITH existing_conversations AS (
                SELECT
                    last_msg.*,
                    COALESCE(uc.unread_count, 0) AS unread_received_count,
                    CASE
                        WHEN last_msg.contact_type = 'mentor' THEN u.name
                        WHEN last_msg.contact_type = 'admin' THEN ad.name
                    END AS contact_name,
                    CASE
                        WHEN last_msg.contact_type = 'mentor' THEN up.file_path
                        WHEN last_msg.contact_type = 'admin' THEN up.file_path
                    END AS contact_profile,
                    -- For mentors, we also want grade/section info
                    sec.grade_id,
                    sec.section_name
                FROM (
                    -- Subquery to get the last message details for each conversation
                    SELECT
                        m1.*,
                        IF(m1.sender_id = ? AND m1.sender_type = 'coordinator', m1.receiver_id, m1.sender_id) AS contact_id,
                        IF(m1.sender_id = ? AND m1.sender_type = 'coordinator', m1.receiver_type, m1.sender_type) AS contact_type
                    FROM messages m1
                    INNER JOIN (
                        -- Finds the ID of the last message in each conversation
                        SELECT MAX(message_id) AS max_id
                        FROM messages
                        WHERE (sender_id = ? AND sender_type = 'coordinator') OR (receiver_id = ? AND receiver_type = 'coordinator')
                        GROUP BY
                            LEAST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type)),
                            GREATEST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type))
                    ) m2 ON m1.message_id = m2.max_id
                ) AS last_msg
                LEFT JOIN (
                    -- Subquery to count unread messages received by the coordinator
                    SELECT sender_id, sender_type, COUNT(*) AS unread_count
                    FROM messages
                    WHERE receiver_id = ? AND receiver_type = 'coordinator' AND is_read = 0
                    GROUP BY sender_id, sender_type
                ) AS uc ON uc.sender_id = last_msg.contact_id AND uc.sender_type = last_msg.contact_type
                
                -- Joins for Mentor details
                LEFT JOIN mentors ment ON last_msg.contact_type = 'mentor' AND last_msg.contact_id = ment.id
                LEFT JOIN Users u ON ment.phone = u.phone
                -- Joins for Admin details
                LEFT JOIN admins ad ON last_msg.contact_type = 'admin' AND last_msg.contact_id = ad.id
                LEFT JOIN User_photos up ON 
  (last_msg.contact_type = 'mentor' AND ment.phone = up.phone) OR 
  (last_msg.contact_type = 'admin' AND ad.phone = up.phone)

                LEFT JOIN Sections sec ON ment.section_id = sec.id
                
            )
            
            -- Part 1: Select all conversations that already exist
            SELECT * FROM existing_conversations
            
            UNION ALL
            
            -- Part 2: Select all mentors from assigned grades who DO NOT have an existing conversation
            SELECT
                NULL AS message_id, NULL AS sender_id, ? AS receiver_id, 'mentor' AS sender_type, 'coordinator' AS receiver_type,
                'Start a conversation...' AS message_text,
                NULL AS attachment_path, NULL AS attachment_type, NULL AS created_at, 0 AS is_read,
                mtr.id AS contact_id,
                'mentor' AS contact_type,
                0 AS unread_received_count,
                u.name AS contact_name,
                up.file_path AS contact_profile,
                sec.grade_id,
                sec.section_name
            FROM mentors mtr
            JOIN Users u ON mtr.phone = u.phone
            LEFT JOIN User_photos up ON u.phone = up.phone
            JOIN Sections sec ON mtr.section_id = sec.id
            WHERE mtr.grade_id IN (?)
            AND mtr.id NOT IN (
                SELECT contact_id FROM existing_conversations WHERE contact_type = 'mentor'
            )
            
            UNION ALL

            -- Part 3: Select all admins who DO NOT have an existing conversation
            SELECT
                NULL, NULL, ?, 'admin', 'coordinator', 'Start a conversation...',
                NULL, NULL, NULL, 0,
                ad.id, 'admin', 0, ad.name, up.file_path as profile_image,
                NULL, NULL -- No grade/section for admins
            FROM admins ad
            JOIN User_photos up ON ad.phone = up.phone
            WHERE ad.id NOT IN (
                SELECT contact_id FROM existing_conversations WHERE contact_type = 'admin'
            )

            ORDER BY
                CASE WHEN created_at IS NULL THEN 1 ELSE 0 END, -- Puts new contacts last
                created_at DESC,                               -- Sorts existing chats by recency
                contact_name ASC;                              -- Sorts new contacts alphabetically
        `;

    const params = [
      coordinator_id, coordinator_id, coordinator_id, coordinator_id, // for existing_conversations.last_msg
      coordinator_id,                                       // for existing_conversations.uc
      coordinator_id,                                       // for Part 2 (new mentors) receiver_id
      gradeIds.length > 0 ? gradeIds : [0],                 // for Part 2 (new mentors) grade_id IN (...), provide a dummy value if empty
      coordinator_id                                        // for Part 3 (new admins) receiver_id
    ];

    const [inbox] = await db.promise().query(query, params);

    res.json({ success: true, inbox });

  } catch (error) {
    console.error('Error fetching coordinator inbox:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAdminInbox = async (req, res) => {
  const { admin_id } = req.body;

  if (!admin_id) {
    return res.status(400).json({ success: false, message: 'Admin ID is required.' });
  }

  try {
    // This advanced query does two things:
    // 1. (last_msg) It gets the absolute latest message for each conversation thread.
    // 2. (uc) It gets a COUNT of messages that are unread AND were received by the admin.
    // It then joins them together to give you both pieces of information for each contact.
    const query = `
    WITH existing_conversations AS (
            SELECT
                last_msg.*,
                -- Use COALESCE to ensure unread_count is 0 instead of NULL if no unread messages exist
                COALESCE(uc.unread_count, 0) AS unread_received_count,
                CASE
                    WHEN last_msg.contact_type = 'mentor' THEN u.name
                    WHEN last_msg.contact_type = 'coordinator' THEN u.name
                    WHEN last_msg.contact_type = 'student' THEN st.name
                END AS contact_name,
                CASE
                    WHEN last_msg.contact_type = 'mentor' THEN up.file_path
                    WHEN last_msg.contact_type = 'coordinator' THEN up.file_path
                    WHEN last_msg.contact_type = 'student' THEN st.profile_photo
                END AS contact_profile
            FROM (
                -- Subquery to get the last message details for each conversation
                SELECT
                    m1.*,
                    IF(m1.sender_id = ? AND m1.sender_type = 'admin', m1.receiver_id, m1.sender_id) AS contact_id,
                    IF(m1.sender_id = ? AND m1.sender_type = 'admin', m1.receiver_type, m1.sender_type) AS contact_type
                FROM messages m1
                INNER JOIN (
                    -- This subquery finds the ID of the last message in each conversation thread
                    SELECT MAX(message_id) AS max_id
                    FROM messages
                    WHERE (sender_id = ? AND sender_type = 'admin') OR (receiver_id = ? AND receiver_type = 'admin')
                    GROUP BY
                        LEAST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type)),
                        GREATEST(CONCAT(sender_id, sender_type), CONCAT(receiver_id, receiver_type))
                ) m2 ON m1.message_id = m2.max_id
            ) AS last_msg
            LEFT JOIN (
                -- Subquery to count unread messages received by the admin from each sender
                SELECT
                    sender_id,
                    sender_type,
                    COUNT(*) AS unread_count
                FROM messages
                WHERE receiver_id = ? AND receiver_type = 'admin' AND is_read = 0
                GROUP BY sender_id, sender_type
            ) AS uc ON uc.sender_id = last_msg.contact_id AND uc.sender_type = last_msg.contact_type
            LEFT JOIN mentors ment ON last_msg.contact_type = 'mentor' AND last_msg.contact_id = ment.id
            LEFT JOIN coordinators co ON last_msg.contact_type = 'coordinator' AND last_msg.contact_id = co.id
            LEFT JOIN students st ON last_msg.contact_type = 'student' AND last_msg.contact_id = st.id
            LEFT JOIN Users u ON (
          (last_msg.contact_type = 'coordinator' AND co.phone = u.phone) OR
          (last_msg.contact_type = 'mentor' AND ment.phone = u.phone)
        )
            LEFT JOIN User_photos up ON (
          (last_msg.contact_type = 'coordinator' AND co.phone = up.phone) OR
          (last_msg.contact_type = 'mentor' AND ment.phone = up.phone)
        )
  )

  SELECT * FROM existing_conversations

            UNION ALL

            -- PART 2: Select all coordinators that DO NOT have an existing conversation
            SELECT
                NULL AS message_id,       -- No message history, so these are NULL
                NULL AS sender_id,
                ? AS receiver_id,         -- The receiver would be the admin
                'coordinator' AS sender_type,
                'admin' AS receiver_type,
                'Start a conversation...' AS message_text, -- Placeholder text
                NULL AS attachment_path,
                NULL AS attachment_type,
                NULL AS created_at,       -- No creation date for the message
                0 AS is_read,
                co.id AS contact_id,
                'coordinator' AS contact_type,
                0 AS unread_received_count, -- No unread messages
                u.name AS contact_name,
                up.file_path AS contact_profile
            FROM coordinators co
            LEFT JOIN Users u ON co.phone = u.phone
            LEFT JOIN User_photos up ON co.phone = up.phone
            WHERE co.id NOT IN (
                SELECT contact_id FROM existing_conversations WHERE contact_type = 'coordinator'
            )
            
            -- Sort by putting conversations with messages first, ordered by recency.
            -- Then, list all new contacts alphabetically.
            ORDER BY
                CASE WHEN created_at IS NULL THEN 1 ELSE 0 END, -- Puts NULL created_at (new contacts) last
                created_at DESC,                                 -- Sorts existing chats by most recent
                contact_name ASC;             
        `;

    const [inbox] = await db.promise().query(query, [admin_id, admin_id, admin_id, admin_id, admin_id, admin_id]);
    console.log(inbox);

    res.json({ success: true, inbox });

  } catch (error) {
    console.error('Error fetching admin inbox:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// WebSocket or push notification implementation would go here
function notifyReceiver(receiver_id, receiver_type, message) {
  const { io } = require('../../../server.js');
  if (io && receiver_id) {
    io.to(receiver_id.toString()).emit('receiveMessage', { message });
  } else {
    console.error('notifyReceiver: receiver_id is undefined!', { receiver_id, receiver_type });
  }
}


// Simple direct messaging - no encryption

module.exports = {
  getMessages: exports.getMessages,
  sendMessage: exports.sendMessage,
  sendAttachment: exports.sendAttachment,
  deleteMessages: exports.deleteMessages,
  getMentorInbox: exports.getMentorInbox,
  getMentorMessages: exports.getMentorMessages,
  getCoordinatorInbox: exports.getCoordinatorInbox,
  getAdminInbox: exports.getAdminInbox,
  uploadAttachment
};