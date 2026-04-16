/**
 * User schema.
 * Handles authentication credentials and role-based access.
 * Password is hashed automatically before save via a pre-save hook.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    /** Stored as a bcrypt hash — never exposed in API responses */
    password: {
      type: String,
      required: [
        function() {
          return !this.googleId; // Required only if not signing up via Google
        },
        'Password is required'
      ],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // excluded from queries by default
    },
    googleId: {
      type: String,
      sparse: true, // allows multiple nulls
      index: true
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: hash the password only when it has been modified.
 * Avoids re-hashing on unrelated document updates.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compares a plaintext candidate against the stored hash.
 * @param {string} candidatePassword — the plaintext password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
