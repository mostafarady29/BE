const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/oldRequestsController');

const createValidation = [
    body('citizen_name').trim().notEmpty().withMessage('الاسم مطلوب'),
    body('national_id').trim().notEmpty().withMessage('الرقم القومي مطلوب'),
    body('problem_type').trim().notEmpty().withMessage('نوع الطلب مطلوب'),
    body('city').trim().notEmpty().withMessage('المركز مطلوب'),
];

// All routes require authentication
router.use(authenticateToken);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', createValidation, ctrl.create);
router.patch('/:id/status', body('status_id').isInt(), ctrl.updateStatus);

// Attachments
router.get('/:id/attachments', ctrl.getAttachments);
router.post('/:id/attachments', ctrl.addAttachment);

// Presign route for S3 uploads (reuse attachments route pattern)
const attachmentsRouter = require('./attachments');
router.post('/:id/attachments/presign', (req, res, next) => {
    // forward presign to the generic handler
    req.params.postId = req.params.id; // alias
    next();
}, attachmentsRouter);

module.exports = router;
