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
            res.status(200).json(savedMessage)
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
            await Message.deleteOne({ '_id': { $eq: req.body._id } }, { session })
            await Conversation.updateOne(
                { '_id': { $eq: req.body.conversationId } },
                { $set: { timestamp: Date.now() } },
                { session }
            )
            res.status(200).send('Message deleted');
        });
        session.endSession();
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
            const totalMsgs = await Message.countDocuments({ conversationId: req.query.conversationId })
            const messages = await Message.find({ conversationId: req.query.conversationId })
                .select('-__v')
                .sort({ 'timestamp': -1 })
                .skip(skip)
                .limit(limit)
            await Users.updateOne(
                { 'userId': { $eq: req.query.receiverId } },
                { $pull: { unreadMsgsUserIds: req.query.senderId } },
                { session }
            )
            res.status(200).json({ messages, totalMsgs })
        })
        session.endSession();
    }
    catch (err) {
        res.status(500).json(err)
    }
})

module.exports = MessageRoutes;