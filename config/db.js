const mongoose = require('mongoose');

// Connect MongoDB at default port 27017.
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('Missing MONGO_URI environment variable. Set MONGO_URI in your .env or environment.');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('MongoDB Connection Succeeded.');
    } catch (error) {
        console.log('Error in DB connection: ' + error);
        process.exit(1); // Stop app if DB connection fails
    }
};

module.exports = connectDB;
