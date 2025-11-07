const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, chatController.sendMessage);
router.get('/group/:id', protect, chatController.getMessagesForGroup);
router.get('/class/:classId', protect, chatController.getMessagesForClass);
router.post('/read/:messageId', protect, chatController.markAsRead);

module.exports = router;
