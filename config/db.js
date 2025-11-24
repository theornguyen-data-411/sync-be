/**
 * Database Configuration Module
 * 
 * Handles MongoDB connection using Mongoose ODM.
 * Exports an async function that connects to MongoDB Atlas or local MongoDB instance.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 * 
 * Establishes connection to MongoDB using the connection string from environment variables.
 * Exits the application if connection fails or MONGO_URI is not provided.
 * 
 * @async
 * @function connectDB
 * @throws {Error} Exits process if MONGO_URI is missing or connection fails
 * 
 * @example
 * // In index.js
 * connectDB(); // Will connect using process.env.MONGO_URI
 */
const connectDB = async (customUri) => {
    // Get MongoDB connection string from parameter or environment variables
    const uri = customUri || process.env.MONGO_URI;
    
    // Validate that MONGO_URI is provided
    if (!uri) {
        console.error('Missing MONGO_URI environment variable. Set MONGO_URI in your .env or environment.');
        process.exit(1);
    }

    try {
        // Attempt to connect to MongoDB
        // Mongoose will handle connection pooling and reconnection automatically
        await mongoose.connect(uri);
        console.log('MongoDB Connection Succeeded.');
    } catch (error) {
        // Log error and exit application if connection fails
        // This prevents the app from running without database access
        console.error('Error in DB connection: ' + error);
        throw error;
    }
};

module.exports = connectDB;
