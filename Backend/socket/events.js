const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { encryptMessage, decryptMessage } = require('../utlis/encryption');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // User management
    socket.on('create-user', async (userData) => {
      try {
        const user = new User({ ...userData, online: true });
        await user.save();
        socket.userId = user._id;
        socket.emit('user-created', user);
        io.emit('user-online', user);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    socket.on('update-user', async (updateData) => {
      try {
        const user = await User.findByIdAndUpdate(
          updateData.userId,
          updateData,
          { new: true }
        );
        socket.emit('user-updated', user);
        io.emit('user-updated', user);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    socket.on('block-user', async ({ userId, blockedUserId }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { $addToSet: { blockedUsers: blockedUserId } },
          { new: true }
        );
        socket.emit('user-blocked', blockedUserId);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    // Room management
    socket.on('create-room', async ({ name, creatorId }) => {
      try {
        const room = new Room({ name, creator: creatorId, members: [creatorId] });
        await room.save();
        socket.join(room._id.toString());
        io.emit('room-created', room);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    socket.on('join-room', async ({ roomId, userId }) => {
      try {
        const room = await Room.findByIdAndUpdate(
          roomId,
          { $addToSet: { members: userId } },
          { new: true }
        );
        socket.join(roomId);
        socket.emit('room-joined', room);
        io.to(roomId).emit('user-joined-room', { userId, roomId });
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    socket.on('leave-room', async ({ roomId, userId }) => {
      try {
        const room = await Room.findByIdAndUpdate(
          roomId,
          { $pull: { members: userId } },
          { new: true }
        );
        socket.leave(roomId);
        socket.emit('room-left', room);
        io.to(roomId).emit('user-left-room', { userId, roomId });
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    // Messaging
    socket.on('send-message', async (messageData) => {
      try {
        const { sender, recipient, room, text, file } = messageData;
        
        // Check if recipient has blocked the sender
        const recipientUser = await User.findById(recipient);
        if (recipientUser && recipientUser.blockedUsers.includes(sender)) {
          socket.emit('message-blocked', { recipient, reason: 'You are blocked by this user' });
          return;
        }
        
        const message = new Message({
          sender,
          text: text ? encryptMessage(text) : null,
          recipient,
          room,
          file
        });
        
        await message.save();
        
        // Populate sender data
        const populatedMessage = await message.populate('sender', 'nickname');
        
        // Decrypt for sending
        const decryptedMessage = {
          ...populatedMessage.toObject(),
          text: text ? decryptMessage(populatedMessage.text) : null
        };
        
        if (recipient) {
          // Private message
          socket.to(recipient).emit('private-message', decryptedMessage);
          socket.emit('private-message', decryptedMessage);
        } else if (room) {
          // Room message
          io.to(room).emit('room-message', decryptedMessage);
        }
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    socket.on('edit-message', async ({ messageId, newText }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { 
            text: encryptMessage(newText),
            edited: true 
          },
          { new: true }
        ).populate('sender', 'nickname');
        
        // Decrypt for sending
        const decryptedMessage = {
          ...message.toObject(),
          text: decryptMessage(message.text)
        };
        
        if (message.recipient) {
          // Private message
          io.emit('message-edited', decryptedMessage);
        } else if (message.room) {
          // Room message
          io.to(message.room.toString()).emit('message-edited', decryptedMessage);
        }
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    socket.on('delete-message', async (messageId) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { deleted: true },
          { new: true }
        );
        
        io.emit('message-deleted', messageId);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    // File sharing
    socket.on('send-file', async (fileData) => {
      try {
        const { sender, recipient, room, file } = fileData;
        
        const message = new Message({
          sender,
          recipient,
          room,
          file
        });
        
        await message.save();
        
        // Populate sender data
        const populatedMessage = await message.populate('sender', 'nickname');
        
        if (recipient) {
          // Private file
          socket.to(recipient).emit('file-received', populatedMessage);
          socket.emit('file-received', populatedMessage);
        } else if (room) {
          // Room file
          io.to(room).emit('file-received', populatedMessage);
        }
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    // Presence
    socket.on('user-online', async (userId) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { online: true, lastSeen: null },
          { new: true }
        );
        io.emit('user-online', user);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    socket.on('user-offline', async (userId) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { online: false, lastSeen: Date.now() },
          { new: true }
        );
        io.emit('user-offline', user);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    
    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.userId) {
        try {
          const user = await User.findByIdAndUpdate(
            socket.userId,
            { online: false, lastSeen: Date.now() },
            { new: true }
          );
          io.emit('user-offline', user);
        } catch (err) {
          console.error('Error updating user status on disconnect:', err);
        }
      }
    });
  });
};