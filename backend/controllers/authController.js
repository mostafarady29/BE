const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;

        const { rows } = await db.query(
            'SELECT id, username, password, role, phone FROM users WHERE username = $1 AND is_active = TRUE',
            [username.trim()]
        );

        if (!rows.length) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: { id: user.id, username: user.username, role: user.role, phone: user.phone },
        });
    } catch (err) {
        next(err);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ success: false, errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });

        const match = await bcrypt.compare(currentPassword, rows[0].password);
        if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        next(err);
    }
};

module.exports = { login, changePassword };
