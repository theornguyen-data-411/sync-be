/**
 * Authentication Middleware Module
 * 
 * Express middleware that validates JWT tokens for protected routes.
 * Extracts user ID from token and attaches it to request object.
 */

const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * 
 * Validates JWT token from Authorization header.
 * If valid, extracts user ID and attaches to req.userId.
 * If invalid or missing, returns 401 Unauthorized.
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * // Usage in routes
 * router.get('/profile', authMiddleware, controller.getProfile);
 */
module.exports = (req, res, next) => {
    // Extract token from Authorization header
    // Format: "Bearer <token>"
    // Optional chaining (?.) prevents error if header doesn't exist
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Check if token exists
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify and decode JWT token
    try {
        // Verify token signature and expiration
        // If valid, returns decoded payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user ID to request object for use in controllers
        // The token payload contains { userId: ... } from signin/googleSignin
        req.userId = decoded.userId;
        
        // Call next middleware/controller
        next();
    } catch (err) {
        // Token is invalid, expired, or malformed
        res.status(401).json({ msg: 'Token is not valid' });
    }
};