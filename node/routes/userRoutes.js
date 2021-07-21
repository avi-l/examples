const express = require('express');
const UserRoute = express.Router();
const Users = require('../models/UserModel');
const request = require('request');
const twilioCredentials = require('../twilioCredentials');
const { sendMail } = require('../shared/mailer');
const cloudinary = require('cloudinary').v2
const cloudinaryCredentials = require('../cloudinaryCredentials.js');

UserRoute.route('/signCloudindaryURL').post(async (req, res) => {
    var timestamp = Math.round((new Date).getTime() / 1000);
    try {
        let signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            eager: 'w_150,h_150,c_crop',
            folder: 'avatars',
            public_id: timestamp
        }, cloudinaryCredentials.api_secret)
        res.json({ signature, timestamp });
    }
    catch (err) {
        res.send(err);
    }
})

UserRoute.route('/checkEmailExists').post((req, res) => {
    Users.exists({ 'email': { $eq: req.body.email } })
        .then(Found => {
            res.send(Found);
        })
        .catch(err => res.send(err));
});

UserRoute.route('/checkUserExists').post((req, res) => {
    let userHandle = req.body.userHandle;
    Users.exists({ 'userId': req.body.userId })
        .then(exists => {
            Users.countDocuments({ userHandle: { $regex: req.body.userHandle, $options: 'i' } }, (err, result) => {
                if (err) {
                    res.send(err)
                }
                else {
                    if (!exists && result > 0) {
                        let freeHandle = false;
                        while (!freeHandle) {
                            let suggestion = userHandle.concat(result.toString())
                            Users.exists({ 'userHandle': suggestion })
                            .then(found => {
                                if(!found) {
                                    freeHandle = true
                                    res.json({ exists, count: result, suggestion })
                                }
                                else result+=1
                            })
                            .catch(err => console.log(err))
                            freeHandle = true;
                        }
                    }
                    else res.json({ exists, count: result, suggestion: userHandle })
                }
            })
        })
        .catch(err => res.send(err));
});

UserRoute.route('/checkUserHandleExists').post((req, res) => {
    let userHandle = req.body.userHandle;
    Users.exists({ userHandle: { $regex: req.body.userHandle, $options: 'i' } })
        .then(exists => {
            Users.countDocuments({ userHandle: { $regex: req.body.userHandle, $options: 'i' } }, (err, result) => {
                if (err) {
                    res.send(err)
                }
                else {
                    if (result > 0) {
                        let freeHandle = false;
                        while (!freeHandle) {
                            let suggestion = userHandle.concat(result.toString())
                            Users.exists({ 'userHandle': suggestion })
                            .then(found => {
                                if(!found) {
                                    freeHandle = true
                                    res.json({ exists, count: result, suggestion })
                                }
                                else result+=1
                            })
                            .catch(err => console.log(err))
                            freeHandle = true;
                        }
                    }
                    else res.json({ exists, count: result, suggestion: userHandle })
                }
            })
        })
        .catch(err => res.send(err));
});

UserRoute.route('/addUser').post((req, res) => {
    console.log(req.body)
    let user = new Users(req.body);
    Users.exists({ 'userId': { $eq: req.body.userId } })
        .then(Found => {
            if (!Found) {
                user.save()
                    .then(() => {
                        console.log(`${user.userHandle} added to DB`);
                        res.status(200).json({ 'User': 'User added successfully' });
                    })
                    .catch(err => res.send(err));
            } else {
                console.log(`USER ${user.userHandle} EXISTS ALREADY`)
                return res.status(200).json('User already exists');
            }
        })
        .catch(err => res.send(err));
});

UserRoute.route('/deactivateUser').post((req, res) => {
    Users.updateOne(
        { 'userId': { $eq: req.body.userId } },
        {
            $set: {
                active: req.body.active,
            }
        }
    ).then(() => {
        res.status(200).json({ 'User': 'User deactivated' });
    })
        .catch(err => res.send(err));
});

UserRoute.route('/getUser').post((req, res) => {
    if (req.body.isFullDetails) {
        Users.findOne({ userId: req.body.userId })
            .select("-_id -__v -cardNumber -cvc -expiration -nameOnCard")
            .then(user => res.json(user))
            .catch(err => res.send(err))
    }
    else {
        Users.findOne({ userId: req.body.userId })
            .select("userId userHandle avatar firstName lastName followers following")
            .then(user => res.json(user))
            .catch(err => res.send(err))
    }
});
UserRoute.route('/getFollowDetails').post(async (req, res) => {
    console.log(req.body)
    if (req.body.length) {
        try {
            const userIds = req.body.map((U) => U.userId);
            let result = await Users.find({ userId: { $in: userIds } })
                .lean()
                .select("-_id userId userHandle avatar firstName lastName")
                .map(followArr => { return followArr })
            console.log(JSON.stringify(result))
            res.json(result)
        }
        catch (err) { res.send(err) }
    }
});

UserRoute.route('/searchUsers').post((req, res) => {
    Users.find({ userHandle: { $regex: req.body.userHandle, $options: 'i' } })
        .select("-_id userId userHandle avatar firstName lastName followers following")
        .then(user => { res.json({ user }) })
        .catch(err => res.send(err))
});
UserRoute.route('/updateUserDetails').post((req, res) => {
    Users.updateOne(
        { 'userId': { $eq: req.body.userId } },
        {
            $set: {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                mobilePhone: req.body.mobilePhone,
                userHandle: req.body.userHandle,
                avatar: req.body.avatar,
                address1: req.body.address?.address1,
                address2: req.body.address?.address2,
                city: req.body.address?.city,
                state: req.body.address?.state,
                zip: req.body.address?.zip,
                country: req.body.address?.country,
                nameOnCard: req.body.cc?.nameOnCard,
                cardNumber: req.body.cc?.cardNumber,
                cvc: req.body.cc?.cvc,
                expiration: req.body.cc?.expiration,
            }
        },
        { omitUndefined: true },
    ).then(() => {
        res.status(200).json({ 'User': 'User info added successfully' });
    }).catch(err => res.send(err));
});

UserRoute.route('/deleteUser').post((req, res) => {
    Users.deleteOne({ 'userId': { $eq: req.query.userId } },)
        .then(() => {
            console.log('User deleted');
            res.status(200).json({ 'User': 'User removed' });
        })
        .catch(err => res.send(err));
});

UserRoute.route('/emailUser').post((req) => {
    try {
        sendMail(req.body.emailObj.email,
            req.body.emailObj.subject,
            req.body.emailObj.body,
        )
    }
    catch (err) { console.log('unable to send email') }
});
UserRoute.route('/follow').post((req, res) => {
    console.log(req.body)
    Users.updateOne(
        { 'userId': req.body.followee.userId },
        { $push: { followers: req.body.follower } },
        { new: true },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            }
            Users.updateOne(
                { 'userId': req.body.follower.userId },
                { $push: { following: req.body.followee } },
                { new: true }
            )
                .then(result => {
                    res.json(result)
                })
                .catch(err => {
                    return res.status(422).json({ error: err })
                })
        })
});
UserRoute.route('/unfollow').post((req, res) => {
    console.log(req.body)

    Users.updateOne(
        { 'userId': req.body.followee.userId },
        { $pull: { followers: req.body.follower } },
        { new: true },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            }
            Users.updateOne(
                { 'userId': req.body.follower.userId },
                { $pull: { following: req.body.followee } },
                { new: true }
            )
                .then(result => {
                    res.json(result)
                })
                .catch(err => {
                    return res.status(422).json({ error: err })
                })
        })
});

module.exports = UserRoute;
