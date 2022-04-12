const express = require('express');
const UserRoute = express.Router();
const mongoose = require('mongoose');
const Users = require('../models/UserModel');
const UserResource = require('../models/UserResourcesModel')
const Follow = require('../models/FollowModel')
const Subscriptions = require('../models/SubscriberModel')
const Channel = require('../models/ChannelModel');
const request = require('request');
const { sendMail } = require('../shared/mailer');
const cloudinary = require('cloudinary').v2

UserRoute.route('/getUserStats').get(async (req, res) => {
    try {
        Users.aggregate([
            { $match: { userId: req.query.userId } },
            { $project: { _id: 0, userId: 1, userHandle: 1, avatar: 1, firstName: 1, lastName: 1 } },
            {
                $lookup: {
                    from: 'userresources',
                    let: { 'lookupId': '$userId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$$lookupId", "$userId"] } } },
                        {
                            $project: {
                                _id: 0, totalReplies: 1, totalComments: 1, totalPosFeedbacks: 1,
                                totalNegFeedbacks: 1, totalReputations: 1, totalSubscriptions: 1,
                                totalFollowers: 1, totalFollowing: 1
                            }
                        }
                    ],
                    as: 'userResourcesArr'
                }
            },
            {
                $addFields: { userResources: { $arrayElemAt: ['$userResourcesArr', 0] } }
            },
            {
                $project: {
                    userResources: 1, userId: 1, firstName: 1, lastName: 1, userHandle: 1,
                    avatar: 1
                }
            }
        ]).exec((err, results) => {
            if (err) {
                console.error(err)
                res.status(500).json(err);
            } else {
                res.json(results);
            }
        })
    } catch (error) {
        res.status(500).send(error)
    }
});

UserRoute.route('/signCloudindaryURL').post((req, res) => {
    let timestamp = Math.round((new Date).getTime() / 1000);
    try {
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            eager: 'w_150,h_150,c_crop',
            folder: req.body.folder,
            public_id: timestamp
        }, process.env.CLOUDINARY_API_SECRET)
        res.json({ signature, timestamp });
    } catch (err) {
        res.status(500).send(err);
    }
})


UserRoute.route('/checkEmailExists').get((req, res) => {
    UserResource.exists({ 'email': { $eq: req.query.email } })
        .then(Found => {
            res.send(Found);
        })
        .catch(err => res.send(err));
});

UserRoute.route('/checkUserExists').get(async (req, res) => {
    try {
        const exists = await Users.exists({ userId: req.query.userId })
        res.json({ exists })
    } catch (error) {
        res.status(500).send(error)
    }
});

UserRoute.route('/checkUserHandleExists').get(async (req, res) => {
    try {
        let suggestion = req.query.userHandle;
        let count = 0;
        let found = await Users.exists({ userHandle: suggestion })
        if (!found) {
            res.json({ exists: false, count, suggestion })
            return
        }
        while (found) {
            count += 1
            suggestion = suggestion.concat(count.toString())
            found = await Users.exists({ userHandle: suggestion })
        }
        res.json({ exists: true, count, suggestion })
    } catch (error) {
        res.status(500).send(error)
    }
});

UserRoute.route('/addUser').post(async (req, res) => {
    let user = new Users(req.body.userData);
    let resources = new UserResource(req.body.userResources);
    try {
        const exists = await Users.exists({ 'userId': { $eq: req.body.userData.userId } })
        if (!exists) {
            const [userProm, resourceProm] = await Promise.allSettled([
                user.save(),
                resources.save()
            ])
            if (userProm.status === 'fulfilled' && resourceProm.status === 'fulfilled') {
                res.status(200).send('user added successfully')
            }
            else res.status(500).send(`Something went wrong saving user. 
            User Promise: ${userProm.status}, User Resources Promise: ${resourceProm.status}`)
        } else {
            res.status(200).send('User already exists');
        }
    } catch (error) {
        res.send(error)
    }
});

UserRoute.route('/deactivateUser').post(async (req, res) => {
    try {
        const [chanIds, user, follow] = await Promise.allSettled([
            Subscriptions.find({ userId: req.body.userId }).select('channelId -_id'),
            Users.updateOne({ 'userId': { $eq: req.body.userId } }, { $set: { isActive: req.body.active } }),
            // need to find all followers/followings and decrement their follower/following count
            Follow.deleteMany({ $or: [{ follower: req.body.userId }, { following: req.body.userId }] })
        ])
        const channelId = await chanIds.value.map(cid => cid.channelId.toString());
        const decr = await Channel.updateOne({ channelId }, { $inc: { subscribersCount: -1 } })
        res.send('User Deactivated')
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
});

UserRoute.route('/getUser').get(async (req, res) => {
    try {
        if (req.query.isFullDetails) {
            Users.aggregate([
                { $match: { userId: req.query.userId } },
                { $project: { _id: 0, __v: 0 } },
                {
                    $lookup: {
                        from: 'userresources',
                        let: { 'lookupId': req.query.userId },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$$lookupId', '$userId'] } } },
                            {
                                $project: {
                                    _id: 0, cardNumber: 0, expiration: 0, cvc: 0, nameOnCard: 0
                                }
                            },
                        ],
                        as: 'userResourcesArr'
                    }
                },
                {
                    $addFields: { userResources: { $arrayElemAt: ['$userResourcesArr', 0] } }
                },
                {
                    $project: {
                        userResources: 1, userId: 1, firstName: 1, lastName: 1, userHandle: 1,
                        avatar: 1, authProvider: 1, isContributor: 1, isActive: 1,

                    }
                }
            ]).exec((err, results) => {
                if (err) {
                    console.error(err)
                    res.status(500).json(err);
                } else {
                    res.json(results[0]);
                }
            })
        } else {
            const user = await Users.findOne({ userId: req.query.userId })
                .lean()
                .select("userId userHandle avatar firstName lastName isContributor authProvider isAssistant")
            res.json(user)
        }
    } catch (error) {
        res.status(500).send(error)
    }
});

UserRoute.route('/getFollowDetails').get(async (req, res) => {
    try {
        const result = await Users.find({ userId: { $in: req.query.userIds } })
            .lean()
            .select("_id userId userHandle avatar firstName lastName")
        res.json(result)
    } catch (err) {
        res.send(err)
    }

});

UserRoute.route('/searchUsers').get((req, res) => {
    Users.find({ userHandle: { $regex: req.query.userHandle, $options: 'i' } })
        .where('active').ne(false)
        .lean()
        .select("_id userId userHandle avatar firstName lastName")
        .then(user => {
            res.json({ user })
        })
        .catch(err => res.send(err))
});
UserRoute.route('/updateUserDetails').post(async (req, res) => {
    try {
        const [userProm, resourceProm] = await Promise.allSettled([
            Users.updateOne(
                { 'userId': { $eq: req.body.userId } },
                {
                    $set: {
                        firstName: req.body.userData?.firstName || '',
                        lastName: req.body.userData?.lastName || '',
                        userHandle: req.body.userData?.userHandle,
                        avatar: req.body.userData?.avatar || '',
                    }
                },
                { omitUndefined: true }
            ),
            UserResource.updateOne(
                { 'userId': { $eq: req.body.userId } },
                {
                    $set: {
                        mobilePhone: req.body?.userResources?.mobilePhone || '',
                        address1: req.body?.userResources?.address1 || '',
                        address2: req.body?.userResources?.address2 || '',
                        city: req.body?.userResources?.city || '',
                        state: req.body?.userResources?.state || '',
                        zip: req.body?.userResources?.zip || '',
                        country: req.body?.userResources?.country || '',
                        nameOnCard: req.body?.userResources?.cc?.nameOnCard || '',
                        cardNumber: req.body?.userResources?.cc?.cardNumber || '',
                        cvc: req.body?.userResources?.cc?.cvc || '',
                        expiration: req.body?.userResources?.cc?.expiration || '',
                    }
                },
                { omitUndefined: true }
            ),
        ])
        if (userProm.status === 'fulfilled' && resourceProm.status === 'fulfilled') {
            res.status(200).send({ userProm, resourceProm })
        }
        else res.status(500).send(`Something went wrong saving user. 
        User Promise: ${userProm.status}, User Resources Promise: ${resourceProm.status}`)
    } catch (error) {
        res.status(400).send(error)
    }
});

UserRoute.route('/userInfo').post(function (req, res) {
    Users.updateOne(
        { 'userId': { $eq: req.body.userId } },
        {
            $set: {
                address1: req.body.e.address1,
                address2: req.body.e.address2,
                cardNumber: req.body.e.cardNumber,
                city: req.body.e.city,
                country: req.body.e.country,
                cvc: req.body.e.cvc,
                email: req.body.e.email,
                expiration: req.body.e.expiration,
                firstName: req.body.e.firstName,
                lastName: req.body.e.lastName,
                mobilePhone: req.body.e.mobilePhone,
                nameOnCard: req.body.e.nameOnCard,
                state: req.body.e.state,
                zip: req.body.e.zip,

            }
        }
    ).then(() => {
        res.status(200).send({ 'User': 'User info added successfully' });
    })
        .catch(err => res.send(err));
});

UserRoute.route('/deleteUser').post((req, res) => {
    Users.deleteOne({ 'userId': { $eq: req.query.userId } },)
        .then(() => {
            res.status(200).send({ 'User': 'User removed' });
        })
        .catch(err => res.send(err));
});

UserRoute.route('/fetchUserName').get(function (req, res) {
    Users.find({ email: req.query.email }, { userHandle: 1, email: 1, creator: 1 })
        .exec(function (err, user) {
            if (err) {
                console.error(err);
                res.json(err);
            } else {
                res.send(user);
            }
        });
});

UserRoute.route('/verifyRealName').post((req, res) => {
    const url = `https://${process.env.TWILIO_ACCT_SID}:${process.env.TWILIO_ACCT_TOKEN}@lookups.twilio.com/v1/PhoneNumbers/+${req.body.mobilePhone}?Type=caller-name`;
    request(url,
        (error, response, body) => {
            if (error) res.send(error);
            res.send(body)
        });
});

UserRoute.route('/emailUser').post(async (req) => {
    try {
        let res = sendMail(req.body.emailObj.email,
            req.body.emailObj.subject,
            req.body.emailObj.body,
        )
        return res;
    } catch (err) {
        return err;
    }
});

module.exports = UserRoute;