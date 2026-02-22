const { validationResult } = require('express-validator');
const db = require('../config/db');

// ─── Submit a new post (citizen-facing, public) ───────────────────────────────
const submit = async (req, res, next) => {
    const client = await db.getClient();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

        const { national_id, first_name, last_name, phone, problem_type, problem_description, city } = req.body;

        await client.query('BEGIN');

        // Upsert citizen
        const personResult = await client.query(
            `INSERT INTO people (national_id, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (national_id) DO UPDATE
         SET first_name = EXCLUDED.first_name,
             last_name  = EXCLUDED.last_name,
             phone      = COALESCE(EXCLUDED.phone, people.phone)
       RETURNING id`,
            [national_id.trim(), first_name.trim(), last_name.trim(), phone]
        );
        const personId = personResult.rows[0].id;

        // Get default "Pending" status
        const statusResult = await client.query("SELECT id FROM statuses WHERE name = 'Pending' LIMIT 1");
        const statusId = statusResult.rows[0]?.id;
        if (!statusId) throw new Error('Default status "Pending" not found. Run seed.sql first.');

        // Create post
        const postResult = await client.query(
            `INSERT INTO posts (person_id, status_id, problem_type, problem_description, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
            [personId, statusId, problem_type.trim(), problem_description.trim(), city.trim()]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Your request has been submitted successfully.',
            data: {
                post_id: postResult.rows[0].id,
                created_at: postResult.rows[0].created_at,
            },
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// ─── List posts (paginated, filterable) ──────────────────────────────────────
const list = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;

        const filters = [];
        const params = [];

        if (req.query.status_id) { params.push(req.query.status_id); filters.push(`p.status_id = $${params.length}`); }
        if (req.query.city) { params.push(`%${req.query.city}%`); filters.push(`p.city ILIKE $${params.length}`); }
        if (req.query.assigned_to) { params.push(req.query.assigned_to); filters.push(`p.assigned_to = $${params.length}`); }
        if (req.query.problem_type) { params.push(`%${req.query.problem_type}%`); filters.push(`p.problem_type ILIKE $${params.length}`); }
        if (req.query.from) { params.push(req.query.from); filters.push(`p.created_at >= $${params.length}`); }
        if (req.query.to) { params.push(req.query.to); filters.push(`p.created_at <= $${params.length}`); }

        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

        const dataQuery = `
      SELECT p.id, p.problem_type, p.city, p.created_at,
             pe.first_name || ' ' || pe.last_name AS citizen_name,
             pe.national_id,
             s.name AS status,
             u.username AS assigned_to
      FROM posts p
      JOIN people pe ON pe.id = p.person_id
      JOIN statuses s ON s.id = p.status_id
      LEFT JOIN users u ON u.id = p.assigned_to
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
        params.push(limit, offset);

        const { rows } = await db.query(dataQuery, params);

        const countParams = filters.length ? params.slice(0, params.length - 2) : [];
        const countQuery = `SELECT COUNT(*)::int AS total FROM posts p ${where}`;
        const { rows: countRows } = await db.query(countQuery, countParams);

        res.json({ success: true, data: rows, page, limit, total: countRows[0].total });
    } catch (err) { next(err); }
};

// ─── Get single post ─────────────────────────────────────────────────────────
const getById = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `SELECT p.*,
              pe.first_name, pe.last_name, pe.national_id, pe.phone,
              s.name AS status_name,
              u.username AS assigned_username,
              u.id AS assigned_user_id,
              JSON_AGG(
                CASE WHEN a.id IS NOT NULL THEN
                  JSON_BUILD_OBJECT('id', a.id, 'file_url', a.file_url, 'file_type', a.file_type, 'uploaded_at', a.uploaded_at)
                END
              ) FILTER (WHERE a.id IS NOT NULL) AS attachments
       FROM posts p
       JOIN people pe ON pe.id = p.person_id
       JOIN statuses s ON s.id = p.status_id
       LEFT JOIN users u ON u.id = p.assigned_to
       LEFT JOIN attachments a ON a.post_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, pe.id, s.id, u.id`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Update status ────────────────────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
    try {
        const { status_id } = req.body;
        const { rows } = await db.query(
            `UPDATE posts SET status_id = $1 WHERE id = $2
       RETURNING id, status_id`,
            [status_id, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
        res.json({ success: true, message: 'Status updated.', data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Assign to user ───────────────────────────────────────────────────────────
const assign = async (req, res, next) => {
    try {
        const { assigned_to } = req.body;
        const { rows } = await db.query(
            `UPDATE posts SET assigned_to = $1 WHERE id = $2
       RETURNING id, assigned_to`,
            [assigned_to ?? null, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
        res.json({ success: true, message: 'Post assigned.', data: rows[0] });
    } catch (err) { next(err); }
};

// ─── Soft delete (via is_deleted flag would be ideal; using hard delete here) ─
const remove = async (req, res, next) => {
    try {
        const { rows } = await db.query('DELETE FROM posts WHERE id = $1 RETURNING id', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
        res.json({ success: true, message: 'Post deleted.' });
    } catch (err) { next(err); }
};

// ─── Public track by national_id + post_id ──────────────────────────────────
const track = async (req, res, next) => {
    try {
        const { national_id, post_id } = req.body;
        if (!national_id || !post_id) {
            return res.status(400).json({ success: false, message: 'national_id and post_id are required.' });
        }

        const { rows } = await db.query(
            `SELECT p.id, p.problem_type, p.problem_description, p.city, p.created_at,
                    s.name AS status_name,
                    u.username AS assigned_username,
                    pe.national_id
             FROM posts p
             JOIN people pe ON pe.id = p.person_id
             JOIN statuses s ON s.id = p.status_id
             LEFT JOIN users u ON u.id = p.assigned_to
             WHERE p.id = $1 AND pe.national_id = $2`,
            [post_id, national_id.trim()]
        );

        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'لم يتم العثور على الطلب. تأكد من صحة الرقم القومي ورقم الطلب.' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

module.exports = { submit, track, list, getById, updateStatus, assign, remove };
