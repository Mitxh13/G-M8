const ClassMessage = require('../models/ClassMessage');
const Class = require('../models/Class');

const getClassMessages = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const messages = await ClassMessage.find({ class: classId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendClassMessage = async (req, res) => {
  try {
    const { classId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    // Check if user is teacher of this class
    const classData = await Class.findById(classId);
    if (!classData || classData.teacher.toString() !== senderId) {
      return res.status(403).json({ message: 'Only teachers can send messages to class chat' });
    }

    const message = new ClassMessage({
      sender: senderId,
      class: classId,
      content
    });

    await message.save();
    await message.populate('sender', 'name email');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClassMessages,
  sendClassMessage
};