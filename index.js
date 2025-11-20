// Load environment variables from .env early
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Define Routes
app.use('/api/auth', authRoutes);   

// Run Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
