/**
 * JWT authentication middleware.
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded user to req.user.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes that require a valid JWT.
 * Responds with 401 if the token is missing or invalid.
 */
const protect = async (req, _res, next) => {
  let token;

  // Standard Bearer token format: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized — no token provided');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) so downstream handlers can use it
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      const error = new Error('User belonging to this token no longer exists');
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (err) {
    // jwt.verify throws on expiry / tampering — wrap it in a 401
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      const error = new Error('Not authorized — invalid or expired token');
      error.statusCode = 401;
      throw error;
    }
    throw err;
  }
};

/**
 * Restricts access to users with specific roles.
 * Must be used AFTER the `protect` middleware.
 * @param  {...string} roles — allowed roles (e.g. 'admin')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Role '${req.user.role}' is not authorized to access this route`
      );
      error.statusCode = 403;
      throw error;
    }
    next();
  };
};

module.exports = { protect, authorize };
