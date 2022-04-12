const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    messageId: String,
    conversationId: String,
    quotedMessageId: String,
    quotedMessageUserId: String,
    quotedMessageText: String,
    quotedMessageDeleted: {type: Boolean, default: false},
    senderId: String,
    receiverId: String,
    text: String,
    timestamp: Number,
});

module.exports = mongoose.model("Message", MessageSchema);
