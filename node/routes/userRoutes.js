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
    console.log(req.body)
    Users.exists({ 'email': { $eq: req.body.email } })
        .then(Found => {
            res.send(Found);
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

UserRoute.route('/deactivateUser').post(function (req, res) {
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
    Users.findOne({ userId: req.body.userId })
        .select("-_id -__v")
        .then(user => res.json(user))
        .catch(err => res.send(err))
});
UserRoute.route('/searchUsers').post((req, res) => {
    Users.find({ userHandle: { $regex: req.body.userHandle, $options: 'i' } })
        .select("-_id userId userHandle avatar firstName lastName followers following")
        .then(user => { res.json({ user }) })
        .catch(err => res.send(err))
});
UserRoute.route('/updateUserDetails').post(function (req, res) {
    console.log(req.body.value)
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
    })
        .catch(err => res.send(err));
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
        res.status(200).json({ 'User': 'User info added successfully' });
    })
        .catch(err => res.send(err));
});

UserRoute.route('/deleteUser').post(function (req, res) {
    Users.deleteOne({ 'userId': { $eq: req.query.userId } },)
        .then(() => {
            console.log('User deleted');
            res.status(200).json({ 'User': 'User removed' });
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
    const url = `https://${twilioCredentials.ACCT_SID}:${twilioCredentials.ACCT_TOKEN}@lookups.twilio.com/v1/PhoneNumbers/+${req.body.mobilePhone}?Type=caller-name`;
    request(url,
        (error, response, body) => {
            if (error) res.send(error);
            res.send(body)
        });
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
    Users.updateOne(
        { 'userId': req.body.followee.userId },
        {
            $push: {
                followers:
                {
                    userId: req.body.follower.userId,
                    avatar: req.body.follower.avatar,
                    userHandle: req.body.follower.userHandle,
                    firstName: req.body.follower.firstName,
                    lastName: req.body.follower.lastName,
                }
            }
        },
        { new: true },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            }
            Users.updateOne(
                { 'userId': req.body.follower.userId },
                {
                    $push: {
                        following: {
                            userId: req.body.followee.userId,
                            avatar: req.body.followee.avatar,
                            userHandle: req.body.followee.userHandle,
                            firstName: req.body.followee.firstName,
                            lastName: req.body.followee.lastName,
                        }
                    }
                },
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
    Users.updateOne(
        { 'userId': req.body.followee.userId },
        {
            $pull: {
                followers:
                {
                    userId: req.body.follower.userId,
                    avatar: req.body.follower.avatar,
                    userHandle: req.body.follower.userHandle,
                    firstName: req.body.follower.firstName,
                    lastName: req.body.follower.lastName,
                }
            }
        },
        { new: true },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            }
            Users.updateOne(
                { 'userId': req.body.follower.userId },
                {
                    $pull: {
                        following: {
                            userId: req.body.followee.userId,
                            avatar: req.body.followee.avatar,
                            userHandle: req.body.followee.userHandle,
                            firstName: req.body.followee.firstName,
                            lastName: req.body.followee.lastName,
                        }
                    }
                },
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