const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, assignmentController.getMyAssignments);
router.get('/my-files', protect, assignmentController.getMyFiles);
router.post('/group/:groupId', protect, assignmentController.createAssignment);
router.get('/group/:groupId', protect, assignmentController.getGroupAssignments);
router.put('/:id', protect, assignmentController.updateAssignment);
router.post('/:assignmentId/upload', protect, assignmentController.upload.single('file'), assignmentController.uploadFile);
router.get('/:assignmentId/download/:uploadId', protect, assignmentController.downloadFile);
router.delete('/:assignmentId/upload/:uploadId', protect, assignmentController.deleteFile);

module.exports = router;