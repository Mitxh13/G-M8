const Announcement = require('../models/Announcement');

const getClassAnnouncements = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const announcements = await Announcement.find({ class: classId })
      .populate('teacher', 'name email')
      .populate('project', 'title deadline')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherAnnouncements = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const announcements = await Announcement.find({ teacher: teacherId })
      .populate('teacher', 'name email')
      .populate('class', 'name')
      .populate('project', 'title deadline')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, content } = req.body;
    const teacherId = req.user.id;

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

    const announcement = new Announcement({
      title,
      content,
      class: classId,
      teacher: teacherId,
      type: 'general',
      files
    });

    await announcement.save();
    await announcement.populate('teacher', 'name email');

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { title, content } = req.body;
    const teacherId = req.user.id;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: 'Only announcement creator can update' });
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;

    await announcement.save();
    await announcement.populate('teacher', 'name email');
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadAnnouncementFile = async (req, res) => {
  try {
    const { announcementId, fileIndex } = req.params;
    
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const file = announcement.files[fileIndex];
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = require('path').join('uploads/announcements', file.fileName);
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClassAnnouncements,
  getTeacherAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  downloadAnnouncementFile
};