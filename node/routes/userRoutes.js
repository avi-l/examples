const express = require('express');
const UserRoute = express.Router();
const mongoose = require('mongoose');
const Users = require('../models/UserModel');
const request = require('request');
const {sendMail} = require('../shared/mailer');
const cloudinary = require('cloudinary').v2

UserRoute.route('/signCloudindaryURL').post((req, res) => {
    let timestamp = Math.round((new Date).getTime() / 1000);
    try {
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            eager: 'w_150,h_150,c_crop',
            folder: req.body.folder,
            public_id: timestamp
        }, process.env.CLOUDINARY_API_SECRET)
        res.json({signature, timestamp});
    } catch (err) {
        res.status(500).send(err);
    }
})


UserRoute.route('/checkEmailExists').get((req, res) => {
    Users.exists({'email': {$eq: req.query.email}})
        .then(Found => {
            res.send(Found);
        })
        .catch(err => res.send(err));
});

UserRoute.route('/checkUserExists').get(async (req, res) => {
    try {
        const exists = await Users.exists({userId: req.query.userId})
        res.json({exists})
    } catch (error) {
        res.status(500).send(error)
    }
});

UserRoute.route('/checkUserHandleExists').get(async (req, res) => {
    try {
        let suggestion = req.query.userHandle;
        let count = 0;
        let found = await Users.exists({userHandle: suggestion})
        if (!found) {
            res.json({exists: false, count, suggestion})
            return
        }
        while (found) {
            count += 1
            suggestion = suggestion.concat(count.toString())
            found = await Users.exists({userHandle: suggestion})
        }
        res.json({exists: true, count, suggestion})
    } catch (error) {
        res.status(500).send(error)
    }
});

UserRoute.route('/addUser').post((req, res) => {
    let user = new Users(req.body);
    Users.exists({'userId': {$eq: req.body.userId}})
        .then(Found => {
            if (!Found) {
                user.save()
                    .then(() => {
                        console.log(`${user.userHandle} added to DB`);
                        res.status(200).json({'User': 'User added successfully'});
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
        {'userId': {$eq: req.body.userId}},
        {
            $set: {
                active: req.body.active,
            }
        }
    ).then(() => {
        Users.updateMany({"followers.userId": req.body.userId},
            {
                $pull: {followers: {userId: req.body.userId}}
            }
        ).then(() => {
            res.status(200).json({'User': 'User deactivated'});
        }).catch(err => res.send(err));
    }).catch(err => res.send(err));
});

UserRoute.route('/getUser').get(async (req, res) => {
    try {
        if (req.query.isFullDetails) {
            const user = await Users.findOne({userId: req.query.userId})
                .select("-_id -__v -cardNumber -cvc -expiration -nameOnCard")
            res.json(user)
        } else {
            const user = await Users.findOne({ userId: req.query.userId })
                .select("userId userHandle avatar firstName lastName followers following unreadMsgsUserIds contributorCode authProvider isAssistant")
            res.json(user)
        }
    } catch (error) {
        res.status(500).send(error)
    }
});
UserRoute.route('/getFollowDetails').get(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // Make sure to parse the limit to number
        const skip = parseInt(req.query.skip);// Make sure to parse the skip to number
        const field = req.query.type
        Users.aggregate([
            {$match: {userId: req.query.userId}},
            {$project: {followers: 1, following: 1}},
            {
                $lookup: {
                    from: 'users',
                    let: {'following': '$following'},
                    pipeline: [
                        {$match: {$expr: {'$in': ['$userId', '$$following.userId']}}},
                        {$project: {'userId': 1, 'avatar': 1, 'firstName': 1, 'lastName': 1, 'userHandle': 1}}
                    ],
                    as: 'followingArr'
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: {'followers': '$followers'},
                    pipeline: [
                        {$match: {$expr: {'$in': ['$userId', '$$followers.userId']}}},
                        {$project: {'userId': 1, 'avatar': 1, 'firstName': 1, 'lastName': 1, 'userHandle': 1}}
                    ],
                    as: 'followersArr'
                },
            }
        ]).exec(async (err, followArrOfUserDetails) => {
            if (err) {
                res.json(err);
            } else {
                res.status(200).json({
                    followers: followArrOfUserDetails[0].followersArr,
                    following: followArrOfUserDetails[0].followingArr
                });
            }
        })
    } catch (err) {
        res.send(err)
    }

});
// UserRoute.route('/getFollowDetails').get(async (req, res) => {
//     console.log(req.query)
//         try {
//             // const userIds = req.query.map((U) => U.userId);
//             let result = await Users.find({ userId: { $in: req.query } })
//                 .lean()
//                 .select("-_id userId userHandle avatar firstName lastName")
//                 .map(followArr => {
//                     return followArr
//                 })
//             res.json(result)
//         } catch (err) {
//             res.send(err)
//         }

// });

UserRoute.route('/searchUsers').get((req, res) => {
    Users.find({userHandle: {$regex: req.query.userHandle, $options: 'i'}})
        .where('active').ne(false)
        .select("userId userHandle avatar firstName lastName followers following")
        .then(user => {
            res.json({user})
        })
        .catch(err => res.send(err))
});
UserRoute.route('/updateUserDetails').post(async (req, res) => {
    try {
        await Users.updateOne(
            {'userId': {$eq: req.body.userId}},
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
            {omitUndefined: true})
        res.status(200).send({'User': 'User info updated successfully'})
    } catch (error) {
        res.status(400).json(error)
    }
});

UserRoute.route('/userInfo').post(function (req, res) {
    Users.updateOne(
        {'userId': {$eq: req.body.userId}},
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
        res.status(200).json({'User': 'User info added successfully'});
    })
        .catch(err => res.send(err));
});

UserRoute.route('/deleteUser').post((req, res) => {
    Users.deleteOne({'userId': {$eq: req.query.userId}},)
        .then(() => {
            res.status(200).json({'User': 'User removed'});
        })
        .catch(err => res.send(err));
});

UserRoute.route('/fetchUserName').get(function (req, res) {
    Users.find({email: req.query.email}, {userHandle: 1, email: 1, creator: 1})
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
        console.log('unable to send email')
        return err;
    }
});
UserRoute.route('/follow').post((req, res) => {
    Users.updateOne(
        {'userId': req.body.followee.userId},
        {$push: {followers: req.body.follower}},
        {new: true},
        (err, result) => {
            if (err) {
                return res.status(422).json({error: err})
            }
            Users.updateOne(
                {'userId': req.body.follower.userId},
                {$push: {following: req.body.followee}},
                {new: true}
            )
                .then(result => {
                    res.json(result)
                })
                .catch(err => {
                    return res.status(422).json({error: err})
                })
        })
});

UserRoute.route('/unfollow').post((req, res) => {
    Users.updateOne(
        {'userId': req.body.followee.userId},
        {$pull: {followers: req.body.follower}},
        {new: true},
        (err, result) => {
            if (err) {
                return res.status(422).json({error: err})
            }
            Users.updateOne(
                {'userId': req.body.follower.userId},
                {$pull: {following: req.body.followee}},
                {new: true}
            )
                .then(result => {
                    res.json(result)
                })
                .catch(err => {
                    return res.status(422).json({error: err})
                })
        })
});

module.exports = UserRoute;