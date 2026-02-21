const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ctrl = require('../controllers/citizensController');

// Public: check if a citizen exists by national_id
router.post('/lookup', ctrl.lookup);

// Protected: list & detail
router.get('/', authenticateToken, ctrl.list);
router.get('/:id', authenticateToken, ctrl.getById);

module.exports = router;
