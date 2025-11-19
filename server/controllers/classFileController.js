const ClassFile = require('../models/ClassFile');
const Class = require('../models/Class');
const path = require('path');
const fs = require('fs');

const uploadClassFiles = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    const classData = await Class.findById(classId);
    if (!classData || classData.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Only class teacher can upload files' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    for (const file of req.files) {
      const classFile = new ClassFile({
        fileName: file.filename,
        originalName: file.originalname,
        class: classId,
        uploadedBy: teacherId,
        fileSize: file.size
      });
      await classFile.save();
      uploadedFiles.push(classFile);
    }

    res.status(201).json({ message: 'Files uploaded successfully', files: uploadedFiles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassFiles = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const files = await ClassFile.find({ class: classId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadClassFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const file = await ClassFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join('uploads/class-files', file.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadClassFiles,
  getClassFiles,
  downloadClassFile
};