/**
 * Authentication Controller Module
 * 
 * Contains business logic for user authentication operations:
 * - User registration (email/password)
 * - User login (email/password)
 * - Google OAuth authentication
 * - User profile retrieval
 */

const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth2 Client
// Used to verify Google ID tokens from client applications
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * User Registration Controller
 * 
 * Creates a new user account with email and password.
 * Password is hashed using bcrypt before storing in database.
 * 
 * @route POST /api/auth/signup
 * @access Public
 * @param {Object} req.body - Request body containing email and password
 * @param {string} req.body.email - User email address
 * @param {string} req.body.password - User password (plain text)
 * @returns {Object} Success message or error
 */
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // Hash password with bcrypt (10 salt rounds)
        // Higher salt rounds = more secure but slower
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user instance
        const newUser = new User({ 
            email, 
            password: hashedPassword,
            authType: 'local'
        });

        // Save user to database
        await newUser.save();

        // Return success response
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
        // Handle any errors during registration
        res.status(500).json({ error: error.message });
    }
};

/**
 * User Login Controller
 * 
 * Authenticates user with email and password.
 * Returns JWT token for subsequent authenticated requests.
 * 
 * @route POST /api/auth/signin
 * @access Public
 * @param {Object} req.body - Request body containing email and password
 * @param {string} req.body.email - User email address
 * @param {string} req.body.password - User password (plain text)
 * @returns {Object} JWT token and user information
 */
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Verify user exists and password matches
        // bcrypt.compare hashes the provided password and compares with stored hash
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Wrong password or email" });
        }

        // Generate JWT token
        // Token contains user ID and expires in 7 days
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Return token and user information (without password)
        res.json({
            message: "Login successful",
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                fullName: user.fullName 
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get User Profile Controller
 * 
 * Retrieves current authenticated user's profile information.
 * Requires valid JWT token (handled by authMiddleware).
 * 
 * @route GET /api/auth/profile
 * @access Private
 * @param {string} req.userId - User ID from JWT token (set by authMiddleware)
 * @returns {Object} User profile information
 */
exports.getProfile = async (req, res) => {
    try {
        // Find user by ID from JWT token
        // .select('-password') excludes password field from response
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Google OAuth Login Controller
 * 
 * Authenticates user using Google OAuth ID token.
 * Creates new user if doesn't exist, or updates existing user with Google ID.
 * Returns JWT token for subsequent authenticated requests.
 * 
 * @route POST /api/auth/google
 * @access Public
 * @param {Object} req.body - Request body containing Google ID token
 * @param {string} req.body.idToken - Google ID token from client (iOS/Android/Web)
 * @returns {Object} JWT token and user information
 */
exports.googleSignin = async (req, res) => {
    try {
        const { idToken } = req.body;

        // Step 1: Verify Google ID token with Google servers
        // This ensures the token is valid and not tampered with
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        
        // Extract user information from verified token
        const payload = ticket.getPayload();
        // payload contains: { email, name, picture, sub (googleId), ... }
        const { email, name, picture, sub } = payload;

        // Step 2: Check if user already exists in database
        let user = await User.findOne({ email });

        if (user) {
            // User exists - update with Google ID if not already set
            // This handles case where user registered with email/password first
            if (!user.googleId) {
                user.googleId = sub;
                user.authType = 'google';
                // Update avatar if not set
                if (!user.avatarUrl) {
                    user.avatarUrl = picture;
                }
                // Update fullName if not set
                if (!user.fullName) {
                    user.fullName = name;
                }
                await user.save();
            }
        } else {
            // Step 3: User doesn't exist - create new user account
            // Password is null because Google OAuth doesn't use passwords
            user = new User({
                email,
                fullName: name,
                avatarUrl: picture,
                googleId: sub,
                authType: 'google',
                password: null // No password needed for OAuth users
            });
            await user.save();
        }

        // Step 4: Generate JWT token (same as regular login)
        // This allows the user to access protected routes
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Return token and user information
        res.json({
            message: "Google Login successful",
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                fullName: user.fullName, 
                avatarUrl: user.avatarUrl 
            }
        });

    } catch (error) {
        // Handle invalid token or other errors
        console.error('Google OAuth error:', error);
        res.status(400).json({ message: "Google Token không hợp lệ" });
    }
};