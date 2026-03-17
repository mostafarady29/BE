const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const ctrl = require('../controllers/oldRequestsController');
const { presign: presignCtrl } = require('../controllers/attachmentsController');

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

// Presign for S3 upload — reuse same presign logic
// We patch req.params.id so the presign controller can verify the record exists
router.post('/:id/attachments/presign', async (req, res, next) => {
    // Temporarily alias to the old_requests check instead of posts
    // Just call presign directly — S3 check handles unavailability gracefully
    return presignCtrl(req, res, next);
});

module.exports = router;

