const Room = require('../models/Room');

// Create a room
exports.createRoom = async (req, res) => {
  try {
    const { name, creator } = req.body;
    const room = new Room({ name, creator, members: [creator] });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Join a room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId } },
      { new: true }
    );
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Leave a room
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { members: userId } },
      { new: true }
    );
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get room messages
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ 
      room: roomId,
      deleted: false 
    }).populate('sender', 'nickname');
    
    // Decrypt messages
    const decryptedMessages = messages.map(msg => ({
      ...msg.toObject(),
      text: msg.text ? decryptMessage(msg.text) : null
    }));
    
    res.json(decryptedMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};