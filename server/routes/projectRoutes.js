const express = require('express');
const { createProject, getClassProjects, updateProject, downloadProjectFile } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/projects';
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

router.post('/class/:classId', protect, upload.array('files', 10), createProject);
router.get('/class/:classId', protect, getClassProjects);
router.put('/:projectId', protect, updateProject);
router.get('/download/:projectId/:fileIndex', protect, downloadProjectFile);

module.exports = router;