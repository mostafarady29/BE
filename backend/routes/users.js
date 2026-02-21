const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/usersController');

const userValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['admin', 'moderator']).withMessage('Role must be admin or moderator'),
];

router.use(authenticateToken, requireRole('admin'));

router.get('/', ctrl.list);
router.post('/', userValidation, ctrl.create);
router.get('/:id', ctrl.getById);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.deactivate);

module.exports = router;
