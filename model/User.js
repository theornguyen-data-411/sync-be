/**
 * User Model Module
 * 
 * Defines the User schema and model for MongoDB using Mongoose ODM.
 * Supports both local (email/password) and Google OAuth authentication.
 */

const mongoose = require('mongoose');

/**
 * User Schema Definition
 * 
 * Defines the structure and validation rules for User documents.
 * Supports multiple authentication methods (local and Google OAuth).
 * 
 * @typedef {Object} UserSchema
 * @property {string} email - User email address (required, unique)
 * @property {string} password - Hashed password (optional for OAuth users)
 * @property {string} googleId - Google user ID (optional, unique, sparse index)
 * @property {string} fullName - User's full name
 * @property {string} avatarUrl - URL to user's avatar image
 * @property {string} authType - Authentication method: 'local' or 'google'
 * @property {Date} createdAt - Document creation timestamp (auto-generated)
 * @property {Date} updatedAt - Document last update timestamp (auto-generated)
 */
const UserSchema = new mongoose.Schema({
    /**
     * User Email Address
     * Required field, must be unique across all users
     */
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Store emails in lowercase for consistency
        trim: true // Remove whitespace
    },
    
    /**
     * Hashed Password
     * Optional because Google OAuth users don't have passwords
     * Required for local authentication users
     */
    password: {
        type: String,
        required: false
    },
    
    /**
     * Google User ID
     * Unique identifier from Google OAuth
     * Sparse index allows multiple null values (for local-only users)
     */
    googleId: {
        type: String,
        unique: true,
        sparse: true // Only enforce uniqueness for non-null values
    },
    
    /**
     * User's Full Name
     * Can be set during registration or from Google OAuth
     */
    fullName: {
        type: String,
        default: '',
        trim: true
    },
    
    /**
     * Avatar Image URL
     * URL to user's profile picture
     * Can be from Google OAuth or uploaded by user
     */
    avatarUrl: {
        type: String,
        default: '',
        trim: true
    },
    
    /**
     * Authentication Type
     * Indicates how the user authenticates
     * 'local' = email/password
     * 'google' = Google OAuth
     */
    authType: {
        type: String,
        enum: ['local', 'google'], // Only allow these two values
        default: 'local'
    }
}, {
    // Enable automatic timestamps
    // Mongoose will automatically add createdAt and updatedAt fields
    timestamps: true
});

/**
 * User Model
 * 
 * Mongoose model for User collection in MongoDB.
 * Provides methods for CRUD operations and querying.
 * 
 * @model User
 * @collection users (Mongoose automatically pluralizes model name)
 */
module.exports = mongoose.model('User', UserSchema);