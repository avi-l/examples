const express = require('express');
const MessageRoutes = express.Router()
const { v4: uuidv4 } = require('uuid');
const Message = require('../models/MessageModel');
const Conversation = require('../models/ConversationModel');
const Users = require('../models/UserModel');
const mongoose = require('mongoose');
const Notification = require('../models/NotificationsModel')

//add
MessageRoutes.route('/sendMessage').post(async (req, res) => {
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            const newMessage = new Message({
                ...req.body,
                messageId: uuidv4()
            })
            const savedMessage = await newMessage.save({ session })
            const newNotification = await new Notification({
                to: [{ receiverId: req.body.receiverId }],
                messageId: savedMessage.messageId,
                senderId: req.body.senderId,
                messageType: 'message'
            })
            await newNotification.save({ session })
            await Conversation.updateOne({ conversationId: { $eq: req.body.conversationId } },
                { $set: { timestamp: req.body.timestamp } }, { session })
            res.status(200).send(savedMessage)
        });
        await session.endSession();
    } catch (err) {
        res.status(500).json(err)
    }
})
//delete
MessageRoutes.route('/deleteMessage').post(async (req, res) => {
    try {
        await Promise.allSettled([
            Message.updateMany({ quotedMessageId: req.body.messageId },
                { $set: { quotedMessageDeleted: true } }),
            Message.deleteOne({ messageId: req.body.messageId }),
            Notification.deleteOne({ messageId: req.body.messageId }),
            Conversation.updateOne({ conversationId: { $eq: req.body.conversationId } },
                { $set: { timestamp: Date.now() } }),
        ])
        res.status(200).send('Message deleted');
    } catch (err) {
        res.status(500).json(err)
    }
})


//get
MessageRoutes.route('/getMessage').get(async (req, res) => {
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            const limit = parseInt(req.query.limit); // Make sure to parse the limit to number
            const skip = parseInt(req.query.skip);// Make sure to parse the skip to number
            if (skip === 0) {
                await Notification.deleteMany(
                    { 'to.receiverId': req.query.receiverId, senderId: req.query.senderId, message: 'message' },
                    { session }
                )
            }
            Message.aggregate([
                { $match: { conversationId: req.query.conversationId } },
                { $project: { __v: 0 } },
                { $sort: { timestamp: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        let: { 'lookupId': '$quotedMessageUserId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$$lookupId', '$userId'] } } },
                            { $project: { userHandle: 1, _id: 0, avatar: 1 } }
                        ],
                        as: 'replyUserDetailsArr'
                    },
                },
                {
                    $addFields: {
                        replyQuoteUserDetails: { $arrayElemAt: ["$replyUserDetailsArr", 0] }
                    }
                },
                {
                    $project: {
                        replyUserDetailsArr: 0,
                    }
                }
            ]).exec((err, messages) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.json({ messages });
                }
            })
        })
        session.endSession();
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
MessageRoutes.route('/getRecentMessages').get(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // Make sure to parse the limit to number
        const skip = parseInt(req.query.skip);// Make sure to parse the skip to number
        Conversation.aggregate([
            { $match: { members: { $in: [req.query.userId] } } },
            { $project: { members: 1, timestamp: 1, conversationId: 1, _id: 0 } },
            // { $nin: [req.query.userId] }, // $nin unavailable on atlas free tier
            { $sort: { timestamp: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'messages',
                    let: { 'convId': '$conversationId', 'userId': req.query.userId },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ['$$convId', '$conversationId'] } },
                                    { $expr: { $ne: ['$$userId', '$senderId'] } },
                                ]
                            }
                        },
                        { $project: { __v: 0, _id: 0 } },
                        { $sort: { timestamp: -1 } },
                        { $limit: 1 },
                    ],
                    as: 'messagesArr'
                },
            },
            {
                $addFields: {
                    messages: { $arrayElemAt: ['$messagesArr', 0] }
                }
            },
            {
                $project: {
                    messagesArr: 0
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { 'lookupId': '$messages.senderId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$$lookupId', '$userId'] } } },
                        { $project: { _id: 0, 'userId': 1, 'avatar': 1, 'firstName': 1, 'lastName': 1, 'userHandle': 1 } }
                    ],
                    as: 'userDetailsArr'
                },
            },
            {
                $addFields: {
                    userDetails: { $arrayElemAt: ['$userDetailsArr', 0] }
                }
            },
            {
                $project: {
                    messages: 1, userDetails: 1, conversationId: 1
                }
            }
        ]).exec((err, msgData) => {
            if (err) {
                console.error(err)
                res.json(err);
            } else {
                res.json(msgData);
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

module.exports = MessageRoutes;