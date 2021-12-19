const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    address1: String,
    address2: String,
    avatar: String,
    cardNumber: String,
    city: String,
    country: String,
    creator: Boolean,
    cvc: String,
    email: String,
    expiration: String,
    firstName: String,
    lastName: String,
    mobilePhone: String,
    nameOnCard: String,
    reputation: Number,
    state: String,
    userHandle: String,
    userId: String,
    zip: String,
    contributorCode: String,
    isAssistant: Boolean,
    authProvider: String,
    active: Boolean,
    deprecated: Boolean,
    documentId: String,
    isAssistant: Boolean,
    assistantRecord: [Schema.Types.Mixed],
    followers: [],
    following: [],
    unreadMsgsUserIds: []
});

module.exports = mongoose.model('Users', UserSchema);
