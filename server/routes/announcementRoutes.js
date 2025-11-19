const express = require('express');
const { getClassAnnouncements, getTeacherAnnouncements, createAnnouncement, updateAnnouncement, downloadAnnouncementFile } = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/announcements';
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

const router = express.Router();

router.get('/class/:classId', protect, getClassAnnouncements);
router.post('/class/:classId', protect, upload.array('files', 10), createAnnouncement);
router.put('/:announcementId', protect, updateAnnouncement);
router.get('/teacher', protect, getTeacherAnnouncements);
router.get('/download/:announcementId/:fileIndex', protect, downloadAnnouncementFile);

module.exports = router;