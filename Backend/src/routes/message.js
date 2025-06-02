const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messaging/messageController')


router.post('/messages/get', messageController.getMessages);
router.post('/messages/send', messageController.sendMessage);
router.post('/messages/send-attachment', uploadAttachment.single('file'), messageController.sendAttachment);