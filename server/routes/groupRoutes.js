const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, groupController.createGroup); // take { name, classId }
router.get('/:id', protect, groupController.getGroup);
router.get('/class/:classId', protect, groupController.listGroupsForClass);

router.post('/:id/request', protect, groupController.requestToJoin);
router.post('/:id/handle', protect, groupController.handleJoinRequest); // take { userId, action }
router.delete('/:id/member/:memberId', protect, groupController.removeMember);

module.exports = router;
