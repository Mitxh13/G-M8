const Message = require('../models/Message');
const Group = require('../models/Group');
const Class = require('../models/Class');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// send message to group or classRoom
exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, groupId, classId, type = 'text', attachments = [] } = req.body;
  if (!content && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ message: 'Message content or attachment required' });
  }

  // basic permission checks
  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
  }
  if (classId) {
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
  }

  const message = await Message.create({
    sender: req.user._id,
    content,
    type,
    group: groupId || undefined,
    classRoom: classId || undefined,
    attachments
  });

  // optionally populate sender for immediate response
  await message.populate('sender', 'name email srn').execPopulate?.();

  res.status(201).json(message);
});

exports.getMessagesForGroup = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;
  const limit = parseInt(req.query.limit || '50', 10);
  const messages = await Message.find({ group: groupId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email srn');
  res.json(messages.reverse()); // orderinng the messages from old to new 
});

exports.getMessagesForClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const limit = parseInt(req.query.limit || '50', 10);
  const messages = await Message.find({ classRoom: classId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email srn');
  res.json(messages.reverse());
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const msg = await Message.findById(messageId);
  if (!msg) return res.status(404).json({ message: 'Message not found' });

  const userId = req.user._id;
  if (!msg.readBy.map(String).includes(String(userId))) {
    msg.readBy.push(userId);
    await msg.save();
  }
  res.json({ message: 'Marked read' });
});
