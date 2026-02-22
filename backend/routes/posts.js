const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/postsController');
const rateLimit = require('express-rate-limit');

const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { success: false, message: 'Too many submissions. Please wait before submitting again.' },
});

const submitValidation = [
    body('national_id').trim().notEmpty().withMessage('National ID is required'),
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
    body('problem_type').trim().notEmpty(),
    body('problem_description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    body('city').trim().notEmpty(),
];

// Public: submit a new request
router.post('/', submitLimiter, submitValidation, ctrl.submit);

// Public: track a request by national_id + post_id
router.post('/track', submitLimiter, ctrl.track);


// Protected: list, detail, update status, assign, delete
router.get('/', authenticateToken, ctrl.list);
router.get('/:id', authenticateToken, ctrl.getById);

router.patch('/:id/status',
    authenticateToken,
    body('status_id').isInt().withMessage('status_id must be an integer'),
    ctrl.updateStatus
);

router.patch('/:id/assign',
    authenticateToken,
    requireRole('admin'),
    body('assigned_to').optional({ nullable: true }).isInt(),
    ctrl.assign
);

router.delete('/:id',
    authenticateToken,
    requireRole('admin'),
    ctrl.remove
);

module.exports = router;
