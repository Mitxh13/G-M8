const express = require('express');
const { getClassMessages, sendClassMessage } = require('../controllers/classChatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:classId', protect, getClassMessages);
router.post('/:classId', protect, sendClassMessage);

module.exports = router;