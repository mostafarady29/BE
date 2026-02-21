const db = require('../config/db');

const lookup = async (req, res, next) => {
    try {
        const { national_id } = req.body;
        if (!national_id) return res.status(400).json({ success: false, message: 'national_id is required.' });

        const { rows } = await db.query(
            'SELECT id, national_id, first_name, last_name, phone FROM people WHERE national_id = $1',
            [national_id.trim()]
        );
        // Always return the same shape to avoid enumeration
        res.json({ success: true, found: rows.length > 0, data: rows[0] || null });
    } catch (err) { next(err); }
};

const list = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;

        const { rows } = await db.query(
            `SELECT p.*, COUNT(posts.id)::int AS post_count
       FROM people p
       LEFT JOIN posts ON posts.person_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const { rows: total } = await db.query('SELECT COUNT(*)::int AS total FROM people');
        res.json({ success: true, data: rows, page, limit, total: total[0].total });
    } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `SELECT p.id, p.national_id, p.first_name, p.last_name, p.phone, p.created_at,
              JSON_AGG(JSON_BUILD_OBJECT(
                'id', posts.id, 'problem_type', posts.problem_type,
                'city', posts.city, 'status', s.name, 'created_at', posts.created_at
              ) ORDER BY posts.created_at DESC) AS posts
       FROM people p
       LEFT JOIN posts ON posts.person_id = p.id
       LEFT JOIN statuses s ON s.id = posts.status_id
       WHERE p.id = $1
       GROUP BY p.id`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Citizen not found.' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
};

module.exports = { lookup, list, getById };
