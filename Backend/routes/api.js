// backend/routes/api.js
const Message = require('../models/Message');
// const { decryptMessage } = require('../utils/encryption'); // Fixed path
const { decryptMessage } = require('../utlis/encryption') // Updated path
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');
const roomController = require('../controllers/roomController');

// User routes
router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);
router.post('/users/block', userController.blockUser);
router.get('/users/online', userController.getOnlineUsers);

// Message routes
router.post('/messages', messageController.sendMessage);
router.put('/messages/edit', messageController.editMessage);
router.delete('/messages/:id', messageController.deleteMessage);
router.get('/messages/search', messageController.searchMessages);

// Get messages for a specific conversation
router.get('/messages', async (req, res) => {
  try {
    const { sender, recipient, room } = req.query;
    let query = { deleted: false };
    
    if (recipient) {
      query.$or = [
        { sender, recipient },
        { sender: recipient, recipient: sender }
      ];
    } else if (room) {
      query.room = room;
    } else {
      return res.status(400).json({ error: 'Missing conversation parameters' });
    }

    const messages = await Message.find(query)
      .populate('sender', 'nickname')
      .sort('timestamp');
    
    const decryptedMessages = messages.map(msg => ({
      ...msg.toObject(),
      text: msg.text ? decryptMessage(msg.text) : null
    }));
    
    res.json(decryptedMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Room routes
router.post('/rooms', roomController.createRoom);
router.post('/rooms/join', roomController.joinRoom);
router.post('/rooms/leave', roomController.leaveRoom);
router.get('/rooms/:roomId/messages', roomController.getRoomMessages);

module.exports = router;