const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/attachmentsController');

// Presigned URL request (can be public for submission flow)
router.post('/posts/:id/attachments/presign', ctrl.presign);

// List attachments for a post
router.get('/posts/:id/attachments', authenticateToken, ctrl.list);

// Delete an attachment (admin only)
router.delete('/attachments/:id', authenticateToken, requireRole('admin'), ctrl.remove);

module.exports = router;
