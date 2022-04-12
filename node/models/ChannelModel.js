const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
    channelId: String,
    addedAt: {type: Number, default: Date.now()},
    avatar: String,
    description: String,
    keywords: [String],
    title: String,
    userId: String, // owner
    subscribersCount: {type: Number, default: 0}
});

module.exports = mongoose.model('channel', ChannelSchema);
