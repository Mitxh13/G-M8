const express = require('express');
const { getPrivateMessages, sendPrivateMessage, getRecentChats } = require('../controllers/privateChatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recent', protect, getRecentChats);
router.get('/:userId', protect, getPrivateMessages);
router.post('/:userId', protect, sendPrivateMessage);

module.exports = router;