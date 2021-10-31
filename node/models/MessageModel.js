const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        conversationId: {
            type: String,
        },
        senderId: {
            type: String,
        },
        text: {
            type: String
        },
        timestamp: {
            type: Number
        },
        receiverHasRead: {
            type: Boolean
        }
    }
);

module.exports = mongoose.model("Message", MessageSchema);
