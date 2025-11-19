const Project = require('../models/Project');
const Announcement = require('../models/Announcement');
const Class = require('../models/Class');

const createProject = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, deadline } = req.body;
    const teacherId = req.user.id;

    const classData = await Class.findById(classId);
    if (!classData || classData.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Only class teacher can create projects' });
    }

    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        files.push({
          fileName: file.filename,
          originalName: file.originalname,
          uploadedBy: teacherId
        });
      });
    }

    const project = new Project({
      title,
      description,
      class: classId,
      teacher: teacherId,
      deadline,
      files
    });

    await project.save();

    // Create announcement for the project
    const announcement = new Announcement({
      title: `New Project: ${title}`,
      content: `A new project "${title}" has been assigned. Deadline: ${new Date(deadline).toLocaleDateString()}`,
      class: classId,
      teacher: teacherId,
      type: 'project',
      project: project._id
    });

    await announcement.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassProjects = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const projects = await Project.find({ class: classId })
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, deadline } = req.body;
    const teacherId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Only project creator can update' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.deadline = deadline || project.deadline;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadProjectFile = async (req, res) => {
  try {
    const { projectId, fileIndex } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const file = project.files[fileIndex];
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = require('path').join('uploads/projects', file.fileName);
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getClassProjects,
  updateProject,
  downloadProjectFile
};