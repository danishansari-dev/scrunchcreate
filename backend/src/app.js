/**
 * Express application setup.
 * Mounts middleware, routes, and the centralized error handler.
 * Exported separately from server.js so tests can import the app without starting a listener.
 */
const express = require('express');
const cors = require('cors');

// Patches Express to forward async errors to the error handler automatically
require('express-async-errors');

const helmet = require('helmet');
const compression = require('compression');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust the reverse proxy (Render) so rate limiters use the real client IP
// Without this, the rate limiter would block all users globally if deployed on the cloud
app.set('trust proxy', 1);

// ─── Global Middleware ───────────────────────────────────────────────
// Set HTTP security headers
app.use(helmet());

require('./config/passport'); // Initialize passport strategies
const passport = require('passport');
app.use(passport.initialize());

// Compress response bodies
app.use(compression());
// Parse incoming JSON bodies
app.use(express.json());

// Allow the React frontend to call this API
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Health Check ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((_req, _res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
});

// ─── Centralized Error Handler (must be last) ────────────────────────
app.use(errorHandler);

module.exports = app;
