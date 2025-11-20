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
 * Root Endpoint
 * Returns API information and available endpoints
 * 
 * @route GET /
 * @returns {Object} API information and available endpoints
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Sync Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: {
        signup: 'POST /api/auth/signup',
        signin: 'POST /api/auth/signin',
        google: 'POST /api/auth/google',
        profile: 'GET /api/auth/profile (Protected)'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

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

/**
 * 404 Handler for undefined routes
 * Returns a helpful error message for routes that don't exist
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /health',
      signup: 'POST /api/auth/signup',
      signin: 'POST /api/auth/signin',
      google: 'POST /api/auth/google',
      profile: 'GET /api/auth/profile (Protected)'
    }
  });
});

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
