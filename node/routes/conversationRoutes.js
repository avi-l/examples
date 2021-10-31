const express = require('express');
const ConversationRoute = express.Router()
const Conversation = require('../models/ConversationModel');

ConversationRoute.route('/newConversation').post(async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.body.senderId, req.body.receiverId] }
        });
        if (!conversation) {
            const newConversation = new Conversation({
                members: [req.body.senderId, req.body.receiverId],
                timestamp: Date.now()
            })
            const savedConversation = await newConversation.save();
            res.status(200).json({ conversation: savedConversation, newChat: true })
        }
        else {
            res.status(200).json({ conversation, newChat: false })
        }
    }
    catch (err) {
        res.status(500).json(err)
    }
})

ConversationRoute.route('/getConversation/').get(async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.query.userId] }
        })
        .select('-__v')
        .sort({ 'timestamp': -1})
        res.status(200).json(conversation)
    }
    catch (err) {
        res.status(500).json(err)
    }
})

module.exports = ConversationRoute;