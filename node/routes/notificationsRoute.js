const express = require('express');
const NotificationsRoute = express.Router()
const Notifications = require('../models/NotificationsModel');

NotificationsRoute.route('/getMyMsgNotifications').get(async (req, res) => {
    try {
        const notif = await Notifications.find(
            {
                'to.receiverId': req.query.userId,
                'to.read_date': { $eq: 0 },
                'message': 'message'
            })
            .select('senderId -_id')
        res.status(200).send(notif);
    } catch (error) {
        console.error(error)
        res.json(error);
    }
})
NotificationsRoute.route('/markMsgRead').get(async (req, res) => {
    try {
        await Notifications.deleteMany(
            { 'to.receiverId': req.query.receiverId, senderId: req.query.senderId, message: 'message' },
            { session }
        )
        res.status(200).send(notif);
    } catch (error) {
        console.error(error)
        res.json(error);
    }
})


module.exports = NotificationsRoute;