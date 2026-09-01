const User = require('../socket/models/User');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, age, nickname, city } = req.body;
    const user = new User({ name, age, nickname, city });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const { userId, blockedUserId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: blockedUserId } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get online users
exports.getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ online: true });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};