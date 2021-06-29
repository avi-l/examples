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
    authProvider: String,
    active: Boolean,
    deprecated: Boolean,
    documentId: String,
    followers:[
        {
            userId: String,
            avatar: String,
            userHandle: String,
            firstName: String,
            lastName: String,
        }
    ],
    following:[
        {
            userId: String,
            avatar: String,
            userHandle: String,
            firstName: String,
            lastName: String,
        }
    ]
});

module.exports = mongoose.model('Users', UserSchema);
