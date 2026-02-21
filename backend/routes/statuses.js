const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Public: returns all available statuses (for dropdowns)
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT id, name FROM statuses ORDER BY id');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

module.exports = router;
