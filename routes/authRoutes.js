/**
 * Authentication Routes Module
 * 
 * Defines all authentication-related API endpoints.
 * Routes are prefixed with /api/auth in the main application.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

// ==================== Public Routes ====================

/**
 * User Registration Endpoint
 * 
 * @route POST /api/auth/signup
 * @access Public
 * @param {string} email - User email address
 * @param {string} password - User password (will be hashed)
 */
router.post('/signup', authController.signup);

/**
 * User Login Endpoint
 * 
 * @route POST /api/auth/signin
 * @access Public
 * @param {string} email - User email address
 * @param {string} password - User password (plain text)
 * @returns {Object} JWT token and user information
 */
router.post('/signin', authController.signin);

/**
 * Google OAuth Login Endpoint
 * 
 * @route POST /api/auth/google
 * @access Public
 * @param {string} idToken - Google ID token from client
 * @returns {Object} JWT token and user information
 */
router.post('/google', authController.googleSignin);

// ==================== Protected Routes ====================

/**
 * Get User Profile Endpoint
 * 
 * @route GET /api/auth/profile
 * @access Private (requires JWT token)
 * @middleware authMiddleware - Validates JWT token
 * @returns {Object} User profile information (without password)
 */
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;