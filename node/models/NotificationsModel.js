const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationsSchema = new Schema(
    {
        messageId: String,
        messageType: String, // type of notification (could be 'message', 'feedback', etc)
        //intentionally generic so schema can be used for any kind of notification
        //not just for chat messages
        senderId: String,
        to: [{
            receiverId: String,
            read_date: {type: Number, default: 0}
        }],
    },
    {timestamps: true}
);

module.exports = mongoose.model('Notifications', NotificationsSchema);
