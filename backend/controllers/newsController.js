const { validationResult } = require('express-validator');
const db = require('../config/db');

// ─── Public: List published news ─────────────────────────────────────────────
const listPublic = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `SELECT id, title, content, tag, image_url, is_featured, created_at
             FROM news
             WHERE is_published = TRUE
             ORDER BY is_featured DESC, created_at DESC
             LIMIT 20`
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
};

// ─── Admin: List all news ─────────────────────────────────────────────────────
const list = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `SELECT id, title, tag, is_published, is_featured, created_at
             FROM news
             ORDER BY created_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
};

// ─── Admin: Create news ───────────────────────────────────────────────────────
const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

        const { title, content, tag, image_url, is_published, is_featured } = req.body;

        const { rows } = await db.query(
            `INSERT INTO news (title, content, tag, image_url, is_published, is_featured, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [title.trim(), content.trim(), tag?.trim() || null, image_url?.trim() || null,
            is_published ?? false, is_featured ?? false, req.user?.id || null]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Admin: Update news ───────────────────────────────────────────────────────
const update = async (req, res, next) => {
    try {
        const { title, content, tag, image_url, is_published, is_featured } = req.body;
        const { rows } = await db.query(
            `UPDATE news
             SET title=$1, content=$2, tag=$3, image_url=$4, is_published=$5, is_featured=$6
             WHERE id=$7
             RETURNING *`,
            [title?.trim(), content?.trim(), tag?.trim() || null, image_url?.trim() || null,
            is_published ?? false, is_featured ?? false, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'News not found.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Admin: Delete news ───────────────────────────────────────────────────────
const remove = async (req, res, next) => {
    try {
        const { rows } = await db.query('DELETE FROM news WHERE id=$1 RETURNING id', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'News not found.' });
        res.json({ success: true, message: 'News deleted.' });
    } catch (err) { next(err); }
};

module.exports = { listPublic, list, create, update, remove };
