const Project = require('../models/Project');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const Group = require('../models/Group');

const getStudentDeadlines = async (req, res) => {
  try {
    const userId = req.user.id;
    const deadlines = [];

    // Get student's classes
    const classes = await Class.find({ students: userId });
    
    // Get class projects
    for (const classItem of classes) {
      const projects = await Project.find({ class: classItem._id })
        .populate('class', 'name')
        .sort({ deadline: 1 });
      
      projects.forEach(project => {
        deadlines.push({
          _id: project._id,
          title: project.title,
          deadline: project.deadline,
          type: 'project',
          source: project.class.name,
          description: project.description
        });
      });
    }

    // Get student's groups and their assignments
    const groups = await Group.find({ members: userId });
    
    for (const group of groups) {
      const assignments = await Assignment.find({ group: group._id })
        .populate('group', 'name')
        .sort({ deadline: 1 });
      
      assignments.forEach(assignment => {
        deadlines.push({
          _id: assignment._id,
          title: assignment.title,
          deadline: assignment.deadline,
          type: 'assignment',
          source: assignment.group.name,
          description: assignment.description
        });
      });
    }

    // Sort all deadlines by date
    deadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentDeadlines
};