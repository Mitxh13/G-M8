const Group = require('../models/Group');
const Class = require('../models/Class');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.createGroup = asyncHandler(async (req, res) => {
  const { name, classId } = req.body;
  if (!name || !classId) return res.status(400).json({ message: 'Name and classId required' });

  const cls = await Class.findById(classId);
  if (!cls) return res.status(404).json({ message: 'Class not found' });

  // leader defaults to the user who makes the grp
  const group = await Group.create({
    name,
    class: classId,
    leader: req.user._id,
    members: [req.user._id]
  });

  res.status(201).json(group);
});

exports.getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('leader', 'name email')
    .populate('members', 'name email')
    .populate('class', 'name code');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

exports.listGroupsForClass = asyncHandler(async (req, res) => {
  const groups = await Group.find({ class: req.params.classId }).populate('leader', 'name email');
  res.json(groups);
});

exports.requestToJoin = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  const userId = req.user._id;
  if (group.members.includes(userId)) return res.status(400).json({ message: 'Already a member' });
  if (group.joinRequests.includes(userId)) return res.status(400).json({ message: 'Already requested' });

  group.joinRequests.push(userId);
  await group.save();
  res.json({ message: 'Join request sent' });
});

exports.handleJoinRequest = asyncHandler(async (req, res) => {
  // only leader or class teacher can accept/reject
  const { id: groupId } = req.params;
  const { userId, action } = req.body; // action: 'accept' | 'reject'
  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // check authorized: leader or class teacher
  const cls = await Class.findById(group.class);
  const isLeader = group.leader.toString() === req.user._id.toString();
  const isTeacher = cls && cls.teacher.toString() === req.user._id.toString();
  if (!isLeader && !isTeacher) return res.status(403).json({ message: 'Not authorized' });

  // remove from joinRequests
  group.joinRequests = group.joinRequests.filter(u => u.toString() !== userId);
  if (action === 'accept') {
    if (!group.members.includes(userId)) group.members.push(userId);
  }
  await group.save();
  res.json({ message: `Request ${action}ed` });
});

exports.removeMember = asyncHandler(async (req, res) => {
  const { id: groupId, memberId } = req.params;
  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // leader or teacher only
  const cls = await Class.findById(group.class);
  const isLeader = group.leader.toString() === req.user._id.toString();
  const isTeacher = cls && cls.teacher.toString() === req.user._id.toString();
  if (!isLeader && !isTeacher) return res.status(403).json({ message: 'Not authorized' });

  group.members = group.members.filter(m => m.toString() !== memberId);
  await group.save();
  res.json({ message: 'Member removed' });
});
