// messageController.js
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

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
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadAttachment = multer({ 
  storage: attachmentStorage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { sender_id, receiver_id, sender_type, last_message_id = 0 } = req.body;
    
    const [messages] = await db.promise().query(`
      SELECT m.*, 
        CASE 
          WHEN m.sender_type = 'student' THEN s.name
          WHEN m.sender_type = 'mentor' THEN mt.name
        END as sender_name,
        CASE 
          WHEN m.sender_type = 'student' THEN s.profile_photo
          WHEN m.sender_type = 'mentor' THEN mt.profile_photo
        END as sender_profile
      FROM messages m
      LEFT JOIN students s ON m.sender_id = s.student_id AND m.sender_type = 'student'
      LEFT JOIN mentors mt ON m.sender_id = mt.mentor_id AND m.sender_type = 'mentor'
      WHERE ((m.sender_id = ? AND m.sender_type = ? AND m.receiver_id = ? AND m.receiver_type = 'mentor')
         OR (m.sender_id = ? AND m.sender_type = 'mentor' AND m.receiver_id = ? AND m.receiver_type = ?))
      AND m.message_id > ?
      ORDER BY m.created_at ASC
    `, [sender_id, sender_type, receiver_id, receiver_id, sender_id, sender_type, last_message_id]);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

// Send a text message
exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, sender_type, message_text } = req.body;
    
    const [result] = await db.promise().query(`
      INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, message_text, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [sender_id, receiver_id, sender_type, 'mentor', message_text]);
    
    const [newMessage] = await db.promise().query(`
      SELECT m.*, 
        CASE 
          WHEN m.sender_type = 'student' THEN s.name
          WHEN m.sender_type = 'mentor' THEN mt.name
        END as sender_name,
        CASE 
          WHEN m.sender_type = 'student' THEN s.profile_photo
          WHEN m.sender_type = 'mentor' THEN mt.profile_photo
        END as sender_profile
      FROM messages m
      LEFT JOIN students s ON m.sender_id = s.student_id AND m.sender_type = 'student'
      LEFT JOIN mentors mt ON m.sender_id = mt.mentor_id AND m.sender_type = 'mentor'
      WHERE m.message_id = ?
    `, [result.insertId]);
    
    res.json({ success: true, message: newMessage[0] });
    
    // Notify receiver via WebSocket or push notification
    notifyReceiver(receiver_id, 'mentor', newMessage[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
};

// Send an attachment
exports.sendAttachment = async (req, res) => {
  try {
    const { sender_id, receiver_id, sender_type } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const fileType = getFileType(file.mimetype);
    const filePath = `/message_attachments/${file.filename}`;
    
    const [result] = await db.promise().query(`
      INSERT INTO messages (sender_id, receiver_id, sender_type, receiver_type, attachment_path, attachment_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [sender_id, receiver_id, sender_type, 'mentor', filePath, fileType]);
    
    const [newMessage] = await db.promise().query(`
      SELECT m.*, 
        CASE 
          WHEN m.sender_type = 'student' THEN s.name
          WHEN m.sender_type = 'mentor' THEN mt.name
        END as sender_name,
        CASE 
          WHEN m.sender_type = 'student' THEN s.profile_photo
          WHEN m.sender_type = 'mentor' THEN mt.profile_photo
        END as sender_profile
      FROM messages m
      LEFT JOIN students s ON m.sender_id = s.student_id AND m.sender_type = 'student'
      LEFT JOIN mentors mt ON m.sender_id = mt.mentor_id AND m.sender_type = 'mentor'
      WHERE m.message_id = ?
    `, [result.insertId]);
    
    res.json({ success: true, message: newMessage[0] });
    
    // Notify receiver via WebSocket or push notification
    notifyReceiver(receiver_id, 'mentor', newMessage[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending attachment' });
  }
};

// Helper function to determine file type
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

// WebSocket or push notification implementation would go here
function notifyReceiver(receiver_id, receiver_type, message) {
  // Implementation depends on your real-time solution (Socket.io, Firebase, etc.)
  // This would notify the receiver that a new message has arrived
}