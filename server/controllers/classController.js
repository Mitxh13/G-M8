const Class = require('../models/Class');
const User = require('../models/User');
const Group = require('../models/Group')

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// creating a class (teachers only do this)
exports.createClass = asyncHandler(async (req, res) => {
  const { name, description, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: 'Name and code are required' });
  }
  const user = await User.findOne({ _id: req.user._id, isTeacher: true });
  if (!user) {
    return res
      .status(400)
      .json({ message: "Only Teachers can create a class." });
  }
  const exists = await Class.findOne({ code });
  if (exists) {
    return res.status(409).json({ message: 'Class code already exists' });
  }
  const newClass = await Class.create({
    name,
    description,
    code,
    teacher: req.user._id,
    students: [],
  });

  res.status(201).json(newClass);
});

exports.getClass = asyncHandler(async (req, res) => {
  const cls = await Class.findById(req.params.id)
    .populate('teacher', 'name email')
    .populate('students', 'name email srn');

  if (!cls) {
    return res.status(404).json({ message: 'Class not found' });
  }

  const groups = await Group.find({ class: cls._id }).populate('members', 'name email srn');

  res.json({
    classInfo: {
      name: cls.name,
      description: cls.description,
      code: cls.code,
      teacher: cls.teacher,
    },
    members: {
      students: cls.students,
    },
    groups: groups.map((g) => ({
      _id: g._id,
      name: g.name,
      members: g.members,
    })),
  });
});

exports.getAllForTeacher = asyncHandler(async (req, res) => {
  const classes = await Class.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json(classes);
});

exports.getAllForStudent = asyncHandler(async (req, res) => {
  const classes = await Class.find({ students: req.user._id }).sort({ createdAt: -1 });
  res.json(classes);
});

//joining class for students
exports.joinClassByCode = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const cls = await Class.findOne({ code });
  if (!cls) {
    return res.status(404).json({ message: 'Invalid join code' });
  }

  const userId = req.user._id;

  //one account per srn
  if (cls.students.includes(userId)) {
    return res.status(200).json({ message: 'Already joined', class: cls });
  }

  cls.students.push(userId);
  await cls.save();

  res.json({ message: 'Joined class', class: cls });
});

//removing a student only teacher can do this
exports.removeStudent = asyncHandler(async (req, res) => {
  const { classId, studentId } = req.params;

  const cls = await Class.findById(classId);
  if (!cls) {
    return res.status(404).json({ message: 'Class not found' });
  }

  if (cls.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  cls.students = cls.students.filter(s => s.toString() !== studentId);
  await cls.save();

  res.json({ message: 'Student removed' });
});


//stu joining func
exports.joinClassByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    console.log("Join request received for code:", code, "by user:", userId);

    if (!code) {
      return res.status(400).json({ message: "Class code is required" });
    }

    const cls = await Class.findOne({ code });
    if (!cls) {
      return res.status(404).json({ message: "Invalid class code" });
    }

    // Prevent duplicate joins
    if (cls.students.includes(userId)) {
      return res.status(200).json({ message: "Already joined this class" });
    }

    cls.students.push(userId);
    await cls.save();

    res.status(200).json({
      message: "Joined class successfully!",
      class: cls,
    });
  } catch (err) {
    console.error("Error in joinClassByCode:", err.message);
    res.status(500).json({ message: "Failed to join class", error: err.message });
  }
};
