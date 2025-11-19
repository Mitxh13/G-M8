const express = require('express');
const { getStudentDeadlines } = require('../controllers/deadlineController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/student', protect, getStudentDeadlines);

module.exports = router;