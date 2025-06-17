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
    socket.join(userId.toString()); // ensure userId is string
  });

  socket.on('sendMessage', (data) => {
    const { to, message } = data;
    if (to) {
      io.to(to.toString()).emit('receiveMessage', { message });
      // console.log(data);
    } else {
      console.error('sendMessage: "to" is undefined!', data);
    }
  });

  socket.on('markAsRead', async ({ messageIds, receiverId, senderId, senderType, receiverType }) => {
    try {
      await db.promise().query(`
  UPDATE messages 
  SET is_read = 1 
  WHERE message_id IN (?)
    AND receiver_id = ? AND receiver_type = ?
    AND sender_id = ? AND sender_type = ?
`, [messageIds, receiverId, receiverType, senderId, senderType]);

      io.to(senderId.toString()).emit('messagesRead', { messageIds });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('testSend', ({ to, message }) => {
    io.to(to.toString()).emit('receiveMessage', { message });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

module.exports.io = io;

// Remove the duplicate app.listen() - use the server instance only
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.io`);
});