const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserResourcesSchema = new Schema({
    userId: String,
    email: String,
    mobilePhone: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    cardNumber: String,
    expiration: String,
    cvc: String,
    nameOnCard: String,
    totalReplies: {type: Number, default: 0}, 
    totalComments: {type: Number, default: 0}, 
    totalPosFeedbacks: {type: Number, default: 0},
    totalNegFeedbacks: {type: Number, default: 0},
    totalReputations: {type: Number, default: 0},
    totalSubscriptions: {type: Number, default: 0},
    totalFollowers: {type: Number, default: 0},
    totalFollowing: {type: Number, default: 0},
});

module.exports = mongoose.model('userresources', UserResourcesSchema);