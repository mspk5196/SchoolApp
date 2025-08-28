const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  sendAttachment,
  uploadAttachment,
  deleteMessages,
  getMentorInbox,
  getMentorMessages,
  getCoordinatorInbox,
  getAdminInbox
} = require('../controllers/messaging/messageController');


router.post('/messages/get', getMessages);
router.post('/messages/getMentorMessages', getMentorMessages);
router.post('/messages/send', sendMessage);
router.post('/messages/delete', deleteMessages);
router.post('/mentor-inbox', getMentorInbox);
router.post('/coordinator-inbox', getCoordinatorInbox);
router.post('/admin-inbox', getAdminInbox);
router.post('/messages/send-attachment', uploadAttachment.single('file'), sendAttachment);

module.exports = router;