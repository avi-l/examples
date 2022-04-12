const express = require('express');
const mongoose = require('mongoose');
const ChannelRoutes = express.Router();
const Channel = require('../models/ChannelModel');
const { ObjectId } = require("mongodb");

ChannelRoutes.route('/getMyVideos').get((req, res) => {
    Channel.aggregate([
        { $match: { userId: req.query.userId } },
        { $sort: { title: 1 } },
        {
            $lookup: {
                from: 'videos',
                localField: 'channelId',
                foreignField: 'channelId',
                as: 'videos'
            }
        },
        {
            $lookup: {
                from: 'assistants',
                localField: 'channelId',
                foreignField: 'channelId',
                as: 'assistants'
            }
        },
    ])
        .then(vid => res.json({ vid }))
        .catch(err => console.log(err));
});

ChannelRoutes.route('/getTheChannel').get((req, res) => {
    Channel.aggregate([
        { $match: { channelId: req.query.channelId } },
        { $project: { __v: 0 } },
        {
            $lookup: {
                from: 'videos',
                localField: 'channelId',
                foreignField: 'channelId',
                as: 'videos'
            },
        },
        {
            $lookup: {
                from: 'users',
                let: { 'lookupId': '$userId' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$$lookupId', '$userId'] } } },
                    { $project: { userHandle: 1, avatar: 1 } }
                ],
                as: 'ownerDetailsArr'
            },
        },
        {
            $addFields: {
                ownerDetails: { $arrayElemAt: ["$ownerDetailsArr", 0] },
            }
        },
        {
            $project: { ownerDetailsArr: 0 }
        },
    ]).exec((err, channel) => {
        if (err) {
            console.log(err)
            res.json(err)
        }
        else {
            res.json(channel)
        }
    });
});

ChannelRoutes.route('/getFilteredChannels').post((req, res) => {
    Channel.find({ title: { $regex: `/${req.body.searchTerm}/i` } })
        .sort({ _id: 1 })
        .limit(40)
        .then(channels => res.json(channels))
        .catch(err => console.log(err));
});

ChannelRoutes.route('/getMoreFilteredChannels')
    .post((req, res) => {
        Channel.find({ title: { $regex: `/${req.body.searchTerm}/i` } })
            .sort({ _id: 1 })
            .limit(40)
            .then(chans => res.json(chans))
            .catch(err => console.log(err));
    });

ChannelRoutes.route('/addChannel').post((req, res) => {
    Channel.create(
        {
            title: req.body.title,
            description: req.body.description,
            userId: req.body.userId,
        }
    ).then(() => {
        res.status(200).send('New channel added');
    })
        .catch(() => {
            res.status(400).send('Unable to add new Channel');
        });
});

ChannelRoutes.route('/getMCEKey').get((req, res) => {
    try {
        res.send(process.env.TINYMCEKEY)
    } catch (err) {
        res.send(err)
    }
});

ChannelRoutes.route('/addAvatar').post((req, res) => {
    Channel.updateOne({ 'channelId': { $eq: req.body.channelId } },
        { $set: { avatar: req.body.avatar } })
        .then((add) => {
            res.json(add)
        })
        .catch(err => {
            console.error(err)
        });
});

module.exports = ChannelRoutes;

