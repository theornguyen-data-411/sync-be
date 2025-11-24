/**
 * Express Application Setup
 *
 * Exports an initialized Express app without starting the HTTP server.
 * Used by both the production entry point (index.js) and automated tests.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// ==================== Middleware ====================
app.use(cors());
app.use(express.json({ extended: false }));

// ==================== Routes ====================
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
      },
      tasks: {
        create: 'POST /api/tasks',
        list: 'GET /api/tasks',
        detail: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        remove: 'DELETE /api/tasks/:id',
        aiPreview: 'POST /api/tasks/ai/preview'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

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
    },
    tasks: {
      create: 'POST /api/tasks',
      list: 'GET /api/tasks',
      detail: 'GET /api/tasks/:id',
      update: 'PUT /api/tasks/:id',
      remove: 'DELETE /api/tasks/:id',
      aiPreview: 'POST /api/tasks/ai/preview'
    }
  });
});

module.exports = app;

