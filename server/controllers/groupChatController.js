const GroupMessage = require('../models/GroupMessage');
const Group = require('../models/Group');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // Check if user is member
  const isMember = group.members.includes(userId) || group.leader.toString() === userId.toString();
  if (!isMember) return res.status(403).json({ message: 'Not a group member' });

  const messages = await GroupMessage.find({ group: groupId })
    .populate('sender', 'name')
    .sort({ createdAt: 1 })
    .limit(50);

  res.json(messages);
});

exports.sendGroupMessage = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { message } = req.body;
  const userId = req.user._id;

  if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // Check if user is member
  const isMember = group.members.includes(userId) || group.leader.toString() === userId.toString();
  if (!isMember) return res.status(403).json({ message: 'Not a group member' });

  const newMessage = await GroupMessage.create({
    group: groupId,
    sender: userId,
    message: message.trim()
  });

  await newMessage.populate('sender', 'name');
  res.status(201).json(newMessage);
});