const express = require('express');
const UserResourceRoute = express.Router();
const UserResource = require('../models/UserResourcesModel')

UserResourceRoute.route('/getUserResources').get(async (req, res) => {
    try {
            const user = await UserResource.exists({ userId: req.query.userId })
            res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
});
module.exports = UserResourceRoute;