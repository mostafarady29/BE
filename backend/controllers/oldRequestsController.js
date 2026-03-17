const { validationResult } = require('express-validator');
const db = require('../config/db');

// ─── List old requests (paginated, filterable) ────────────────────────────────
const list = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(200, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;

        const filters = [];
        const params = [];

        if (req.query.status_id) { params.push(req.query.status_id); filters.push(`r.status_id = $${params.length}`); }
        if (req.query.city) { params.push(`%${req.query.city}%`); filters.push(`r.city ILIKE $${params.length}`); }
        if (req.query.problem_type) { params.push(`%${req.query.problem_type}%`); filters.push(`r.problem_type ILIKE $${params.length}`); }
        if (req.query.ministry) { params.push(`%${req.query.ministry}%`); filters.push(`r.ministry ILIKE $${params.length}`); }
        if (req.query.name) { params.push(`%${req.query.name}%`); filters.push(`r.citizen_name ILIKE $${params.length}`); }
        if (req.query.national_id) { params.push(`%${req.query.national_id}%`); filters.push(`r.national_id ILIKE $${params.length}`); }

        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

        const dataQ = `
            SELECT r.id, r.citizen_name, r.national_id, r.phone,
                   r.problem_type, r.ministry, r.city, r.notes,
                   r.request_date, r.created_at,
                   s.name AS status
            FROM old_requests r
            LEFT JOIN statuses s ON s.id = r.status_id
            ${where}
            ORDER BY r.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await db.query(dataQ, params);

        const countParams = params.slice(0, params.length - 2);
        const countQ = `SELECT COUNT(*)::int AS total FROM old_requests r ${where}`;
        const { rows: cr } = await db.query(countQ, countParams);

        res.json({ success: true, data: rows, page, limit, total: cr[0].total });
    } catch (err) { next(err); }
};

// ─── Get single old request ───────────────────────────────────────────────────
const getById = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `SELECT r.*, s.name AS status_name
             FROM old_requests r
             LEFT JOIN statuses s ON s.id = r.status_id
             WHERE r.id = $1`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'الطلب القديم غير موجود.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Create old request ───────────────────────────────────────────────────────
const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

        const { citizen_name, national_id, phone, problem_type, ministry, city, notes, status_id, request_date } = req.body;

        // Get default "Pending" status if none provided
        let finalStatusId = status_id || null;
        if (!finalStatusId) {
            const sr = await db.query("SELECT id FROM statuses WHERE name = 'Pending' LIMIT 1");
            finalStatusId = sr.rows[0]?.id || null;
        }

        const { rows } = await db.query(
            `INSERT INTO old_requests (citizen_name, national_id, phone, problem_type, ministry, city, notes, status_id, request_date, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [citizen_name, national_id, phone || null, problem_type, ministry || null, city, notes || null,
                finalStatusId, request_date || null, req.user?.id || null]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Update status ────────────────────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
    try {
        const { status_id } = req.body;
        const { rows } = await db.query(
            'UPDATE old_requests SET status_id=$1 WHERE id=$2 RETURNING *',
            [status_id, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'الطلب القديم غير موجود.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Get attachments for an old request ──────────────────────────────────────
const getAttachments = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM old_request_attachments WHERE request_id=$1 ORDER BY uploaded_at DESC',
            [req.params.id]
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
};

// ─── Save attachment record (URL already uploaded to S3) ─────────────────────
const addAttachment = async (req, res, next) => {
    try {
        const { file_url, file_key, file_type } = req.body;
        const { rows } = await db.query(
            `INSERT INTO old_request_attachments (request_id, file_url, file_key, file_type) VALUES ($1,$2,$3,$4) RETURNING *`,
            [req.params.id, file_url, file_key || null, file_type || null]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

module.exports = { list, getById, create, updateStatus, getAttachments, addAttachment };
