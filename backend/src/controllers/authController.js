/**
 * Auth controller.
 * Handles user registration and login.
 * JWT tokens are returned to the client for stateless authentication.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generates a signed JWT for the given user ID.
 * @param {string} id — MongoDB ObjectId of the user
 * @returns {string} signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user account.
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Guard: check if user already exists to return a friendlier message
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 400;
    return next(error);
  }

  const user = await User.create({ name, email, password });

  // Don't leak the hashed password in the response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    data: userResponse,
  });
};

/**
 * Log in with email + password, receive a JWT.
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Please provide email and password');
    error.statusCode = 400;
    return next(error);
  }

  // Explicitly select password since it's excluded by default in the schema
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    return next(error);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    return next(error);
  }

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    data: userResponse,
  });
};

/**
 * Get the currently authenticated user's profile.
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

/**
 * Handle Google OAuth callback.
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const googleCallback = (req, res) => {
  // Passport injects the authenticated user into req.user
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed`);
  }

  const token = generateToken(req.user._id);

  // Redirect to frontend AuthCallback page with token
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
};

module.exports = { register, login, getMe, googleCallback, generateToken };
