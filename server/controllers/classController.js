const Class = require('../models/Class');
const User = require('../models/User');
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.createClass = asyncHandler(async (req, res) => {
  const { name, description, code } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'Name and code required' });
  
  //edited 7-11 tahir teacher_auth
  const user = await User.findOne({_id: req.user._id})
  if(!user.isTeacher){
    return res.status(400).json({ message: 'Only Teachers can create a class.' });
  }
  const exists = await Class.findOne({ code });
  if (exists) return res.status(409).json({ message: 'Class code already exists' });

  const newClass = await Class.create({
    name,
    description,
    code,
    teacher: req.user._id,
    students: []
  });

  res.status(201).json(newClass);
});

exports.getClass = asyncHandler(async (req, res) => {
  const cls = await Class.findById(req.params.id)
    .populate('teacher', 'name email')
    .populate('students', 'name email');
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  res.json(cls);
});

exports.getAllForTeacher = asyncHandler(async (req, res) => {
  const classes = await Class.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json(classes);
});

exports.joinClassByCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cls = await Class.findOne({ code });
  if (!cls) return res.status(404).json({ message: 'Invalid join code' });

  const userId = req.user._id;
  if (cls.students.includes(userId)) return res.status(200).json({ message: 'Already joined', class: cls });

  cls.students.push(userId);
  await cls.save();
  res.json({ message: 'Joined class', class: cls });
});

exports.removeStudent = asyncHandler(async (req, res) => {
  // giving access to teacher to remove stu 
  const { classId, studentId } = req.params;
  const cls = await Class.findById(classId);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (cls.teacher.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

  cls.students = cls.students.filter(s => s.toString() !== studentId);
  await cls.save();
  res.json({ message: 'Student removed' });
});
