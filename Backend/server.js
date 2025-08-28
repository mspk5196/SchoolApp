const app = require('./src/app');
const PORT = process.env.PORT || 5000;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const db = require('./src/config/db')

const io = new Server(server, {
  cors: {
    origin: '*', // set to your frontend origin in production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', ({ userId }) => {
    if (userId) {
      socket.join(userId.toString()); // ensure userId is string
      console.log(`User ${userId} joined room ${userId.toString()}`);
    }
  });

  socket.on('sendMessage', (data) => {
    const { to, message } = data;
    if (to && message) {
      io.to(to.toString()).emit('receiveMessage', { message });
      io.to(message.sender_id.toString()).emit('receiveMessage', { message });
    } else {
      console.error('sendMessage: "to" or "message" is undefined!', data);
    }
  });

  socket.on('markAsRead', async ({ messageIds, receiverId, receiverType, senderId, senderType }) => {
    if (!messageIds || !receiverId || !receiverType || !senderId || !senderType || messageIds.length === 0) {
      console.error('markAsRead: Invalid payload received.');
      return;
    }
    try {
      // Securely update only the intended messages
      await db.promise().query(`
        UPDATE messages 
        SET is_read = 1 
        WHERE message_id IN (?)
          AND receiver_id = ? AND receiver_type = ?
          AND sender_id = ? AND sender_type = ?
      `, [messageIds, receiverId, receiverType, senderId, senderType]);

      // Notify the original sender that their messages have been read
      io.to(senderId.toString()).emit('messagesRead', { messageIds });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

module.exports.io = io;

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.io`);
});