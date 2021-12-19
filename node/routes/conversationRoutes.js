const express = require('express');
const ConversationRoute = express.Router()
const Conversation = require('../models/ConversationModel');
const Users = require('../models/UserModel');
const mongoose = require('mongoose');

ConversationRoute.route('/newConversation').post(async (req, res) => {
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            let conversation = await Conversation.findOne({
                members: { $all: [req.body.senderId, req.body.receiverId] }
            });
            if (!conversation) {
                const newConversation = new Conversation({
                    members: [req.body.senderId, req.body.receiverId],
                    timestamp: Date.now()
                })
                conversation = await newConversation.save();
            }
            const friendObj = await Users.findOne({ userId: req.body.receiverId }, null, { session })
                .select("userId userHandle avatar firstName lastName")
            const timestamp = conversation.timestamp
            const conv_id = conversation._id
            const conversationData = await { ...friendObj._doc, timestamp, conv_id }
            res.status(200).json(conversationData)
        })
        session.endSession();
    }
    catch (err) {
        res.status(500).json(err)
    }
})

ConversationRoute.route('/getConversation/').get(async (req, res) => {
    Conversation.aggregate([
        { $match: { members: { $in: [req.query.userId] } } },
        { $project: { members: 1, timestamp: 1, _id: 1 } },
        // { $nin: [req.query.userId] }, // $nin unavailable on atlas free tier
        { $sort: { timestamp: -1 } },
        {
            $lookup: {
                from: 'users',
                let: { 'lookupId': '$members' },
                pipeline: [
                    { $match: { $expr: { '$in': ['$userId', '$$lookupId'] } } },
                    { $project: { 'userId': 1, 'avatar': 1, 'firstName': 1, 'lastName': 1, 'userHandle': 1 } }
                ],
                as: 'userData'
            },
        }
    ]).exec(async (err, convArrOfObjs) => {
        if (err) {
            console.error(err)
            res.json(err);
        } else {
            res.json(convArrOfObjs);
        }
    })
})

module.exports = ConversationRoute;