/**
 * Entry point — boots the Express server after establishing the DB connection.
 * Separated from app.js so the Express app can be imported independently for testing.
 */
const dotenv = require('dotenv');

// Load env vars before anything else touches process.env
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

/**
 * Starts the server only after a successful database connection.
 * Exits the process on connection failure to avoid silent degradation.
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
