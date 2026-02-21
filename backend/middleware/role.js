/**
 * Role-based access control middleware factory.
 * Usage: router.delete('/:id', authenticateToken, requireRole('admin'), handler)
 *
 * @param {...string} allowedRoles
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Requires role: ${allowedRoles.join(' or ')}.`,
        });
    }
    next();
};

module.exports = { requireRole };
