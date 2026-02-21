/**
 * Global Express error handler.
 * Returns a consistent JSON response for all errors.
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

    // Validation errors (express-validator)
    if (err.type === 'validation') {
        return res.status(422).json({
            success: false,
            message: 'Validation failed.',
            errors: err.errors,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    // PostgreSQL unique constraint violation
    if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'A record with this value already exists.' });
    }

    // PostgreSQL FK violation
    if (err.code === '23503') {
        return res.status(400).json({ success: false, message: 'Referenced record does not exist.' });
    }

    const status = err.statusCode || err.status || 500;
    const message = status < 500 ? err.message : 'Internal server error.';

    res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
