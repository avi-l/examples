const express = require('express');
const MessageRoutes = express.Router()
const Message = require('../models/MessageModel');
const Conversation = require('../models/ConversationModel');
const Users = require('../models/UserModel');
const mongoose = require('mongoose');

//add
MessageRoutes.route('/sendMessage').post(async (req, res) => {
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            const newMessage = new Message(req.body)
            const savedMessage = await newMessage.save({ session })
            await Conversation.updateOne(
                { '_id': { $eq: req.body.conversationId } },
                {
                    $set: { timestamp: Date.now() }
                },
                { session }
            )
            await Users.updateOne(
                { userId: req.body.receiverId },
                {
                    $push: { unreadMsgsUserIds: req.body.senderId }
                },
                { session }
            )
            res.status(200).json('Message Saved')
        });
        session.endSession();
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
//delete
MessageRoutes.route('/deleteMessage').post(async (req, res) => {
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            const result = await Message.deleteOne({ _id: req.body._id }, { session })
            if (!result.deletedCount) {
                res.status(400).send('Unable to Delete Message')
                return
            }
            await Conversation.updateOne(
                { '_id': { $eq: req.body.conversationId } },
                { $set: { timestamp: Date.now() } },
                { session }
            )
            res.status(200).send('Message deleted');
        });
        session.endSession();
    } catch (err) {
        console.log(err)
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
            const totalMsgs = await Message.countDocuments({ conversationId: req.query.conversationId })
            await Users.updateOne(
                { 'userId': { $eq: req.query.receiverId } },
                { $pull: { unreadMsgsUserIds: req.query.senderId } },
                { session }
            )
            Message.aggregate([
                { $match: { conversationId: req.query.conversationId } },
                { $project: { __v: 0 } },
                { $sort: { timestamp: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'messages',
                        let: {
                            'lookupId': {
                                $convert: {
                                    input: '$quotedMessageId',
                                    to: 'objectId',
                                    onError: { error: true },
                                    onNull: { isnull: true }
                                }
                            }
                        },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$$lookupId', '$_id'] } } },
                            { $project: { text: 1, _id: 1, senderId: 1 } }
                        ],
                        as: 'replyQuote'
                    },
                },
                {
                    $addFields: {
                        replyQuoteText: { $arrayElemAt: ["$replyQuote", 0] }
                    }
                },
                {
                    $project: {
                        replyQuote: 0
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { 'lookupId': '$replyQuoteText.senderId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$$lookupId', '$userId'] } } },
                            { $project: { userHandle: 1, _id: 0, avatar: 1 } }
                        ],
                        as: 'replyUserDetails'
                    },
                },
                {
                    $addFields: {
                        replyQuoteUserDetails: { $arrayElemAt: ["$replyUserDetails", 0] }
                    }
                },
                {
                    $project: {
                        replyUserDetails: 0
                    }
                }
            ]).exec((err, messages) => {
                if (err) {
                    console.error(err)
                    res.status(500).json(err);
                } else {
                    res.json({ messages, totalMsgs });
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

module.exports = MessageRoutes;