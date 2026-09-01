const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utlis/encryption');;


// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { sender, recipient, room, text, file } = req.body;
    
    const messageData = {
      sender,
      text: text ? encryptMessage(text) : null,
      recipient,
      room
    };

    if (file) {
      messageData.file = file;
    }

    const message = new Message(messageData);
    await message.save();
    
    // Return decrypted text for immediate use
    const decryptedMessage = {
      ...message.toObject(),
      text: text ? decryptMessage(message.text) : null
    };
    
    res.status(201).json(decryptedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { messageId, newText } = req.body;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { 
        text: encryptMessage(newText),
        edited: true 
      },
      { new: true }
    );
    
    // Return decrypted text
    const decryptedMessage = {
      ...message.toObject(),
      text: decryptMessage(message.text)
    };
    
    res.json(decryptedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search messages
exports.searchMessages = async (req, res) => {
  try {
    const { query } = req.query;
    const messages = await Message.find({
      text: { $regex: query, $options: 'i' },
      deleted: false
    }).populate('sender', 'nickname');
    
    // Decrypt messages
    const decryptedMessages = messages.map(msg => ({
      ...msg.toObject(),
      text: decryptMessage(msg.text)
    }));
    
    res.json(decryptedMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};