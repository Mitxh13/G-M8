const Group = require('../models/Group');
const Class = require('../models/Class');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.createGroup = asyncHandler(async (req, res) => {
  const { name, classId, members } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });

  let classRef = null;
  if (classId) {
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    classRef = classId;
  }

  // Build members array: always include leader
  const membersArr = [req.user._id];
  if (Array.isArray(members)) {
    // Add unique members excluding leader
    for (const m of members) {
      const ms = m.toString();
      if (ms !== req.user._id.toString() && !membersArr.map(String).includes(ms)) {
        membersArr.push(ms);
      }
    }
  }

  const group = await Group.create({
    name,
    class: classRef,
    leader: req.user._id,
    members: membersArr,
  });

  res.status(201).json(group);
});

exports.getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('leader', 'name email srn')
    .populate('members', 'name email srn')
    .populate('joinRequests', 'name email srn')
    .populate('invitations.user', 'name email srn')
    .populate('class', 'name code');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

exports.listGroupsForClass = asyncHandler(async (req, res) => {
  const groups = await Group.find({ class: req.params.classId }).populate('leader', 'name email srn');
  res.json(groups);
});

exports.listGroupsForUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // groups where user is leader or member or has pending invitation
  const groups = await Group.find({
    $or: [
      { leader: userId },
      { members: userId },
      { 'invitations.user': userId, 'invitations.status': 'pending' }
    ]
  })
    .populate('leader', 'name email srn')
    .populate('members', 'name email srn')
    .populate('invitations.user', 'name email srn')
    .populate('class', 'name code');
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

exports.inviteMember = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;
  const { userId } = req.body;
  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // leader or teacher only
  const cls = await Class.findById(group.class);
  const isLeader = group.leader.toString() === req.user._id.toString();
  const isTeacher = cls && cls.teacher.toString() === req.user._id.toString();
  if (!isLeader && !isTeacher) return res.status(403).json({ message: 'Not authorized' });

  if (group.members.includes(userId)) return res.status(400).json({ message: 'User is already a member' });
  if (group.invitations.some(inv => inv.user.toString() === userId && inv.status === 'pending')) return res.status(400).json({ message: 'Invitation already sent' });

  group.invitations.push({ user: userId, status: 'pending' });
  await group.save();
  res.json({ message: 'Invitation sent' });
});

exports.handleInvitation = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  const userId = req.user._id;
  const invitationIndex = group.invitations.findIndex(inv => inv.user.toString() === userId.toString() && inv.status === 'pending');
  if (invitationIndex === -1) return res.status(400).json({ message: 'No pending invitation' });

  group.invitations[invitationIndex].status = action === 'accept' ? 'accepted' : 'rejected';
  if (action === 'accept') {
    if (!group.members.includes(userId)) group.members.push(userId);
  }
  await group.save();
  res.json({ message: `Invitation ${action}ed` });
});

exports.addMember = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;
  const { userId } = req.body;
  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // leader or teacher only
  const cls = await Class.findById(group.class);
  const isLeader = group.leader.toString() === req.user._id.toString();
  const isTeacher = cls && cls.teacher.toString() === req.user._id.toString();
  if (!isLeader && !isTeacher) return res.status(403).json({ message: 'Not authorized' });

  if (group.members.includes(userId)) return res.status(400).json({ message: 'User is already a member' });

  group.members.push(userId);
  await group.save();
  res.json({ message: 'Member added' });
});
