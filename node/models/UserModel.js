const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: String,
    addedAt: Number,
    authProvider: String,
    avatar: String,
    contributorCode: String,
    firstName: String,
    lastName: String,
    isContributor: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
    userHandle: String,
});

module.exports = mongoose.model('users', UserSchema);
