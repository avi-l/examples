const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
    follower: String,
    following: String,
});

module.exports = mongoose.model('follow', FollowSchema);