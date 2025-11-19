const express = require('express');
const { uploadClassFiles, getClassFiles, downloadClassFile } = require('../controllers/classFileController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/class-files';
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

router.post('/class/:classId/upload', protect, upload.array('files', 20), uploadClassFiles);
router.get('/class/:classId', protect, getClassFiles);
router.get('/download/:fileId', protect, downloadClassFile);

module.exports = router;