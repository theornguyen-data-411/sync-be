const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    fullName: {
        type: String,
        default: ''
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    authType:{
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
},
    { timestamps: true });

module.exports = mongoose.model('User', UserSchema);