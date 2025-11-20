const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

// User registration and login routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/profile', authMiddleware, authController.getProfile); // Protected route
router.post('/google', authController.googleSignin); // API mới

module.exports = router;