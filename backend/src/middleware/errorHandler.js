/**
 * Centralized error handler.
 * Catches all errors forwarded via next(error) and returns
 * a consistent JSON response shape.
 *
 * In development mode the full stack trace is included;
 * in production only the message is sent to avoid leaking internals.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Default to 500 if no status code was set on the error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose-specific error transforms ──────────────────────────
  // Duplicate key (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  // Validation errors (required fields, min/max, enum, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ');
  }

  // Invalid ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  const response = {
    success: false,
    message,
  };

  // Include stack trace only in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
