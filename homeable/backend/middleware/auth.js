const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');

/**
 * Protect routes - requires a valid JWT sent either as a Bearer token
 * in the Authorization header, or as an httpOnly cookie named "token".
 */
async function protect(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
    }

    const decoded = verifyToken(token);

    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, phone FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Restrict a route to specific roles, e.g. restrictTo('admin')
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

/**
 * Attach req.user if a valid token exists, but does not block the request
 * if no token is present. Useful for optionally-personalized public routes.
 */
async function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) return next();

    const decoded = verifyToken(token);
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, phone FROM users WHERE id = ?',
      [decoded.id]
    );
    if (rows.length) req.user = rows[0];
    next();
  } catch (err) {
    next();
  }
}

module.exports = { protect, restrictTo, optionalAuth };
