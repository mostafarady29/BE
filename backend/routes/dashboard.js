const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/db');

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
    try {
        const [byStatus, byCity, byType, totals] = await Promise.all([
            db.query(`
        SELECT s.name AS status, COUNT(p.id)::int AS count
        FROM statuses s
        LEFT JOIN posts p ON p.status_id = s.id
        GROUP BY s.id, s.name ORDER BY s.id
      `),
            db.query(`
        SELECT city, COUNT(*)::int AS count
        FROM posts GROUP BY city ORDER BY count DESC LIMIT 10
      `),
            db.query(`
        SELECT problem_type, COUNT(*)::int AS count
        FROM posts GROUP BY problem_type ORDER BY count DESC LIMIT 10
      `),
            db.query(`
        SELECT
          COUNT(*)::int AS total_posts,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS posts_this_week,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS posts_this_month
        FROM posts
      `),
        ]);

        res.json({
            success: true,
            data: {
                by_status: byStatus.rows,
                top_cities: byCity.rows,
                top_types: byType.rows,
                totals: totals.rows[0],
            },
        });
    } catch (err) { next(err); }
});

// GET /api/dashboard/recent
router.get('/recent', async (req, res, next) => {
    try {
        const { rows } = await db.query(`
      SELECT p.id, p.problem_type, p.city, p.created_at,
             pe.first_name || ' ' || pe.last_name AS citizen_name,
             s.name AS status
      FROM posts p
      JOIN people pe ON pe.id = p.person_id
      JOIN statuses s ON s.id = p.status_id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

module.exports = router;
