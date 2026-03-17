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
            message: 'فشل التحقق من صحة البيانات.',
            errors: err.errors,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'الجلسة غير صالحة أو منتهية. يرجى تسجيل الدخول مجدداً.' });
    }

    // PostgreSQL unique constraint violation
    if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'يوجد سجل بهذه القيمة مسبقاً.' });
    }

    // PostgreSQL FK violation
    if (err.code === '23503') {
        return res.status(400).json({ success: false, message: 'السجل المرتبط غير موجود.' });
    }

    const status = err.statusCode || err.status || 500;
    const message = status < 500 ? err.message : 'خطأ داخلي في الخادم.';

    res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
