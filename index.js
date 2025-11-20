/**
 * Application Entry Point
 * 
 * Main server file that initializes Express application,
 * connects to MongoDB, and sets up routes and middleware.
 */

// Load environment variables from .env file early (before other imports)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Initialize Express application
const app = express();

// Connect to MongoDB database
// This must be called before setting up routes
connectDB();

// ==================== Middleware Configuration ====================

/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Allows frontend applications from different origins to access this API
 */
app.use(cors());

/**
 * Body Parser Middleware
 * Parses incoming JSON requests and makes data available in req.body
 * extended: false uses the classic encoding (querystring library)
 */
app.use(express.json({ extended: false }));

// ==================== Routes ====================

/**
 * Health Check Endpoint
 * Used to verify that the API is running and accessible
 * Useful for monitoring and deployment verification
 * 
 * @route GET /health
 * @returns {Object} Status object with OK message
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

/**
 * Authentication Routes
 * All authentication-related endpoints are prefixed with /api/auth
 * Includes: signup, signin, google OAuth, and profile
 */
app.use('/api/auth', authRoutes);

// ==================== Server Configuration ====================

/**
 * Server Port Configuration
 * Uses PORT from environment variables (set by hosting platform)
 * Falls back to 3000 for local development
 */
const PORT = process.env.PORT || 3000;

/**
 * Start Express Server
 * Listens on the configured PORT and logs server start message
 */
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
