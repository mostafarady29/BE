const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/newsController');

const newsValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
];

// Public: get published news (must be before /:id)
router.get('/public', ctrl.listPublic);

// Admin: list all news (published + drafts)
router.get('/', authenticateToken, ctrl.list);

// Admin: create
router.post('/', authenticateToken, requireRole('admin'), newsValidation, ctrl.create);

// Admin: update
router.put('/:id', authenticateToken, requireRole('admin'), ctrl.update);

// Admin: delete
router.delete('/:id', authenticateToken, requireRole('admin'), ctrl.remove);

module.exports = router;
