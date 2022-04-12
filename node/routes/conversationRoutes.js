const express = require('express');
const { v4: uuidv4 } = require('uuid');
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
                    conversationId: uuidv4(),
                    members: [req.body.senderId, req.body.receiverId],
                    timestamp: Date.now()
                })
                conversation = await newConversation.save();
            }
            const friendObj = await Users.findOne({ userId: req.body.receiverId }, null, { session })
                .select("userId userHandle avatar firstName lastName")
            const timestamp = conversation.timestamp
            const conversationId = conversation.conversationId
            const conversationData = await { ...friendObj._doc, timestamp, conversationId }
            res.status(200).send(conversationData)
        })
        session.endSession();
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

ConversationRoute.route('/getConversation/').get(async (req, res) => {
    Conversation.aggregate([
        { $match: { members: { $in: [req.query.userId] } } },
        { $project: { members: 1, timestamp: 1, conversationId: 1 } },
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

ConversationRoute.route('/getRecentMessages').get(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // Make sure to parse the limit to number
        const skip = parseInt(req.query.skip);// Make sure to parse the skip to number
        Conversation.aggregate([
            { $match: { members: { $in: [req.query.userId] } } },
            { $project: { members: 1, timestamp: 1, conversationId: 1 } },
            { $sort: { timestamp: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'messages',
                    let: { 'lookupId': '$conversationId'},
                    pipeline: [
                        { $match: { $expr: { $eq: ['$$lookupId', '$conversationId'] } } },
                        { $sort: { timestamp: -1 } },
                        { $limit: limit },
                    ],
                    as: 'messageArr'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { 'lookupId': $in ['$messageArr.senderId'] },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$$lookupId', '$userId']} } },
                        { $project: { 'userId': 1, 'avatar': 1, 'firstName': 1, 'lastName': 1, 'userHandle': 1 } }
                    ],
                    as: 'userData'
                },
            }
        ]).exec(async (err, messages) => {
            if (err) {
                console.error(err)
                res.json(err);
            } else {
                res.json(messages);
            }
        })
    } catch (error) {
        
    }
})

module.exports = ConversationRoute;