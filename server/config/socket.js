const { Server } = require('socket.io');
const Message = require('../models/Message');

// initialize socket with http server
function initSocket(server, options = {}) {
  const io = new Server(server, {
    cors: {
      origin: options.origin || '*',
    },
  });

  io.on('connection', (socket) => {
    // join group room
    socket.on('joinRoom', ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
    });

    socket.on('leaveRoom', ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId);
    });

    // sending message
    socket.on('sendMessage', async (payload) => {
      try {
        const { senderId, content, groupId, classId, type = 'text', attachments = [] } = payload;
        if (!senderId || (!content && attachments.length === 0)) return;

        const message = await Message.create({
          sender: senderId,
          content,
          type,
          group: groupId || undefined,
          classRoom: classId || undefined,
          attachments
        });

        await message.populate('sender', 'name email').execPopulate?.();

        const room = groupId || classId;
        if (room) {
          io.to(room).emit('newMessage', message);
        } else {
          io.emit('newMessage', message);
        }
      } catch (err) {
        console.error('socket sendMessage error:', err);
      }
    });

    socket.on('disconnect', () => {
      //removinng the chache from socket
    });
  });

  return io;
}

module.exports = initSocket;
