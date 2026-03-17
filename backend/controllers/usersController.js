const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');

const list = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `SELECT id, username, phone, national_id, role, is_active, created_at
       FROM users ORDER BY created_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
};

const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

        const { username, password, phone, national_id, role } = req.body;
        const hashed = await bcrypt.hash(password, 10);

        const { rows } = await db.query(
            `INSERT INTO users (username, password, phone, national_id, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, phone, national_id, role, created_at`,
            [username.trim(), hashed, phone, national_id, role]
        );
        res.status(201).json({ success: true, message: 'تم إنشاء المستخدم بنجاح.', data: rows[0] });
    } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `SELECT id, username, phone, national_id, role, is_active, created_at
       FROM users WHERE id = $1`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

const update = async (req, res, next) => {
    try {
        const { username, phone, national_id, role } = req.body;
        const { rows } = await db.query(
            `UPDATE users
       SET username    = COALESCE($1, username),
           phone       = COALESCE($2, phone),
           national_id = COALESCE($3, national_id),
           role        = COALESCE($4, role)
       WHERE id = $5
       RETURNING id, username, phone, national_id, role, is_active`,
            [username, phone, national_id, role, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

const deactivate = async (req, res, next) => {
    try {
        // Prevent self-deactivation
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ success: false, message: 'لا يمكنك تعطيل حسابك الخاص.' });
        }
        const { rows } = await db.query(
            'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING id',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
        res.json({ success: true, message: 'تم تعطيل المستخدم.' });
    } catch (err) { next(err); }
};

module.exports = { list, create, getById, update, deactivate };
