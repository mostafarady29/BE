const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/login',
    [
        body('username').trim().notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    ctrl.login
);

router.post('/change-password',
    authenticateToken,
    [
        body('currentPassword').notEmpty(),
        body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    ctrl.changePassword
);

module.exports = router;
