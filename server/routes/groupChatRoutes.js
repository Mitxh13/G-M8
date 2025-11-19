const express = require('express');
const router = express.Router();
const groupChatController = require('../controllers/groupChatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:groupId/messages', protect, groupChatController.getGroupMessages);
router.post('/:groupId/messages', protect, groupChatController.sendGroupMessage);

module.exports = router;