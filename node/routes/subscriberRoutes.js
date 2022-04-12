const express = require('express');
const SubscriberRoutes = express.Router();
const Subscriber = require('../models/SubscriberModel');
const Channel = require('../models/ChannelModel');
const UserResources = require('../models/UserResourcesModel')

SubscriberRoutes.route('/amIsubscribed').get((req, res) => {
    Subscriber.exists({ 'channelId': req.query.channelId, 'userId': req.query.userId })
        .then(isSubscribed => {
            res.json(isSubscribed)
        }
        ).catch(err => res.json(err));
});

SubscriberRoutes.route('/getSubscriber').get((req, res) => {
    try {
        
    } catch (error) {
        
    }
   
    // Channel.aggregate([
    //     { $match: { channelId: req.query.channelId } },
    //     { $project: { __v: 0 } },
    //     {
    //         $lookup: {
    //             from: 'subscribers',
    //             localField: 'channelId',
    //             foreignField: 'channelId',
    //             as: 'subscribers'
    //         },
    //     },
    //     {
    //         $addFields: {
    //             subscriberCount: { $size: "$subscribers" },
    //             isSubscribed: { $in: [req.query.userId, "$subscribers.userId"] }
    //         }
    //     },
    //     {
    //         $project: { subscribers: 0 }
    //     }
    // ]).exec((err, channel) => {
    //     if (err) {
    //         console.log(err)
    //         res.json(err)
    //     }
    //     else {
    //         res.json(channel[0])
    //     }
    // });
});

SubscriberRoutes.route('/addSubscriber').post(async (req, res) => {
    try {
        const [sub, inc] = await Promise.allSettled([
            Subscriber.create({ 'channelId': req.body.channelId, 'userId': req.body.userId }),
            UserResources.updateOne({'userId': req.body.userId}, { $inc: { totalSubscriptions: +1 } }),
            Channel.updateOne({ channelId: req.body.channelId }, { $inc: { subscribersCount: +1 } })
        ])
        res.json(sub)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
});

SubscriberRoutes.route('/removeSubscriber').post(async (req, res) => {
    try {
        const [sub, inc] = await Promise.allSettled([
            Subscriber.deleteOne({ channelId: req.body.channelId, userId: req.body.userId }),
            UserResources.updateOne({'userId': req.body.userId}, { $inc: { totalSubscriptions: -1 } }),
            Channel.updateOne({ channelId: req.body.channelId }, { $inc: { subscribersCount: -1 } })
        ])
        res.json(sub)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

SubscriberRoutes.route('/getMyChannels').get((req, res) => {
    try {
        Subscriber.aggregate([
            { $match: { userId: req.query.userId } },
            {
                $lookup: {
                    from: 'channels',
                    localField: 'channelId',
                    foreignField: 'channelId',
                    as: 'channelsArr'
                }
            },
            {
                $addFields: {
                    channelDetails: { $arrayElemAt: ["$channelsArr", 0] },
                }
            },
            {
                $project: { channelDetails: 1 }
            },
        ])
            .exec((err, results) => {
                if (err) {
                    console.error(err)
                    res.status(500).json(err);
                } else {
                    res.json(results);
                }
            })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
});

SubscriberRoutes.route('/getMyChannelIds').get(async (req, res) => {
    try {
        const channelIds = await Subscriber.find({ 'userId': { "$in": [req.query.userId] } })
            .select('channelId')
        res.json(channelIds)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
});


module.exports = SubscriberRoutes;