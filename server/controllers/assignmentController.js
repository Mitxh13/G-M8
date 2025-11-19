const Assignment = require('../models/Assignment');
const Group = require('../models/Group');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/assignments';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.createAssignment = asyncHandler(async (req, res) => {
  const { title, description, deadline, workDivision } = req.body;
  const { groupId } = req.params;

  if (!title || !description || !deadline) {
    return res.status(400).json({ message: 'Title, description, and deadline are required' });
  }

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // Check if user is group leader
  if (group.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only group leader can create assignments' });
  }

  const assignment = await Assignment.create({
    title,
    description,
    deadline,
    group: groupId,
    createdBy: req.user._id,
    workDivision: workDivision || []
  });

  await assignment.populate('createdBy', 'name email').populate('workDivision.member', 'name email srn');
  res.status(201).json(assignment);
});

exports.getGroupAssignments = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  
  const assignments = await Assignment.find({ group: groupId })
    .populate('createdBy', 'name email')
    .populate('workDivision.member', 'name email srn')
    .populate('uploads.user', 'name email srn')
    .sort({ createdAt: -1 });

  res.json(assignments);
});

exports.updateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { workDivision } = req.body;

  const assignment = await Assignment.findById(id).populate('group');
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  // Check if user is group leader
  if (assignment.group.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only group leader can update assignments' });
  }

  assignment.workDivision = workDivision;
  await assignment.save();
  await assignment.populate('workDivision.member', 'name email srn');

  res.json(assignment);
});

exports.uploadFile = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const userId = req.user._id;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  assignment.uploads.push({
    user: userId,
    fileName: req.file.originalname,
    filePath: req.file.path
  });

  await assignment.save();
  await assignment.populate('uploads.user', 'name email srn');
  res.json({ message: 'File uploaded successfully', assignment });
});

exports.downloadFile = asyncHandler(async (req, res) => {
  const { assignmentId, uploadId } = req.params;
  
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  const upload = assignment.uploads.id(uploadId);
  if (!upload) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.download(upload.filePath, upload.fileName);
});

exports.deleteFile = asyncHandler(async (req, res) => {
  const { assignmentId, uploadId } = req.params;
  const userId = req.user._id;
  
  const assignment = await Assignment.findById(assignmentId).populate('group');
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  const upload = assignment.uploads.id(uploadId);
  if (!upload) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Check if user is uploader or group leader
  const isUploader = upload.user.toString() === userId.toString();
  const isLeader = assignment.group.leader.toString() === userId.toString();
  
  if (!isUploader && !isLeader) {
    return res.status(403).json({ message: 'Not authorized to delete this file' });
  }

  // Delete file from filesystem
  if (fs.existsSync(upload.filePath)) {
    fs.unlinkSync(upload.filePath);
  }

  assignment.uploads.pull(uploadId);
  await assignment.save();
  
  res.json({ message: 'File deleted successfully' });
});

exports.getMyAssignments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const groups = await Group.find({
    $or: [
      { leader: userId },
      { members: userId }
    ]
  });
  
  const groupIds = groups.map(g => g._id);
  
  const assignments = await Assignment.find({ group: { $in: groupIds } })
    .populate('group', 'name')
    .populate('createdBy', 'name')
    .sort({ deadline: 1 });
    
  res.json(assignments);
});

exports.getMyFiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const assignments = await Assignment.find({ 'uploads.user': userId })
    .populate('group', 'name')
    .select('title uploads group');
    
  const myFiles = [];
  assignments.forEach(assignment => {
    assignment.uploads.forEach(upload => {
      if (upload.user.toString() === userId.toString()) {
        myFiles.push({
          _id: upload._id,
          fileName: upload.fileName,
          filePath: upload.filePath,
          uploadedAt: upload.uploadedAt,
          assignment: { _id: assignment._id, title: assignment.title },
          group: assignment.group
        });
      }
    });
  });
  
  myFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(myFiles);
});

exports.upload = upload;