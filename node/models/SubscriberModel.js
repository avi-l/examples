const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberSchema = new Schema({
    addedAt: Number,
    channelId: String,
    userId: String,
});

module.exports = mongoose.model('subscriber', SubscriberSchema);