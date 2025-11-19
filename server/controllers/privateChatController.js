const PrivateMessage = require('../models/PrivateMessage');
const User = require('../models/User');

const getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await PrivateMessage.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendPrivateMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    const message = new PrivateMessage({
      sender: senderId,
      recipient: userId,
      content
    });

    await message.save();
    await message.populate('sender', 'name email');
    await message.populate('recipient', 'name email');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } }).select('_id name email');
    
    // Get last message for each user
    const chatsWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await PrivateMessage.findOne({
          $or: [
            { sender: currentUserId, recipient: user._id },
            { sender: user._id, recipient: currentUserId }
          ]
        })
        .populate('sender', 'name email')
        .sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          lastMessage,
          lastMessageTime: lastMessage ? lastMessage.createdAt : new Date(0)
        };
      })
    );

    // Sort by last message time (most recent first)
    chatsWithLastMessage.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json(chatsWithLastMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPrivateMessages,
  sendPrivateMessage,
  getRecentChats
};