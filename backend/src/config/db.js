/**
 * MongoDB connection helper.
 * Uses Mongoose with the Atlas connection string from MONGO_URI.
 */
const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB Atlas.
 * Logs success / failure for operational visibility.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
