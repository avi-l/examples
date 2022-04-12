const express = require('express');
const UserRoute = express.Router();
const mongoose = require('mongoose');
const Users = require('../models/UserModel');
const UserResources = require('../models/UserResourcesModel')
const FollowRoute = express.Router()
const Follow = require('../models/FollowModel')

FollowRoute.route('/follow').post(async (req, res) => {
    try {
        let follow = new Follow(req.body)
        const [result] = await Promise.allSettled([
            follow.save(),
            UserResources.updateOne({ userId: req.body.follower },
                { $inc: { totalFollowing: +1 } }),
            UserResources.updateOne({ userId: req.body.following },
                { $inc: { totalFollowers: +1 } })
        ])
        res.json(result)
    } catch (error) {
        res.status(500).send(error)
    }
});

FollowRoute.route('/unfollow').post(async (req, res) => {
    try {
        const [result] = await Promise.allSettled([
            Follow.deleteOne({ follower: req.body.follower, following: req.body.following }),
            UserResources.updateOne({ userId: req.body.follower },
                { $inc: { totalFollowing: -1 } }),
            UserResources.updateOne({ userId: req.body.following },
                { $inc: { totalFollowers: -1 } })
        ])
        res.json(result)
    } catch (error) {
        res.status(500).send(error)
    }
});

FollowRoute.route('/amIFollowing').get(async (req, res) => {
    try {
        const result = await Follow.exists({ follower: req.query.follower, following: req.query.following })
        res.json(result)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
});

FollowRoute.route('/getFollowingDetails').get(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // Make sure to parse the limit to number
        const skip = parseInt(req.query.skip);// Make sure to parse the skip to number
        Follow.aggregate([
            { $match: { follower: req.query.userId } },
            { $project: { following: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    let: { 'lookupId': '$following' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$$lookupId', '$userId'] } } },
                        { $project: { userHandle: 1, _id: 0, avatar: 1, firstName: 1, lastName: 1, userId: 1 } }
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
                    userDetailsArr: 0, following: 0
                }
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
    } catch (err) {
        res.send(err)
    }
});
FollowRoute.route('/getFollowerDetails').get(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // Make sure to parse the limit to number
        const skip = parseInt(req.query.skip);// Make sure to parse the skip to number
        Follow.aggregate([
            { $match: { following: req.query.userId } },
            { $project: { follower: 1, _id: 0 } },
            { $sort: { _id: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    let: { 'lookupId': '$follower' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$$lookupId', '$userId'] } } },
                        { $project: { userHandle: 1, _id: 0, avatar: 1, firstName: 1, lastName: 1, userId: 1 } }
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
                    userDetailsArr: 0, follower: 0
                }
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
    } catch (err) {
        res.send(err)
    }
});

module.exports = FollowRoute;