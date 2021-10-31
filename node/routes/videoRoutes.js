const express = require('express');
const VideosRoute = express.Router();
const Videos = require('../models/VideoModel');
const Commercials = require('../models/CommercialModel');
const {sendMail} = require('../shared/mailer');
const request = require('request');
const {pollDb} = require("./getVimeoMetadata");
const {ObjectId} = require("mongoose/lib/types");
const vimeoCredentials = process.env.VIMEO_ACCESS_TOKEN;
VideosRoute.route('/getVimeoUploadURL').post((req, res) => {
    const data = req.body.data
    const options = {
        url: 'https://api.vimeo.com/me/videos',
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + vimeoCredentials
        },
        body: JSON.stringify(data)
    }
    request(options, (err, response, body) => {
        if (err) {
            return console.log(err);
        }
        res.send(body)
    });
});

VideosRoute.route('/getVimeoThumbURL').post((req, res) => {
    const options = {
        url: `https://api.vimeo.com/videos/${req.body._id}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            'Authorization': 'bearer ' + vimeoCredentials
        },
    }
    request(options, (err, resp, body) => {
        if (err) {
            return console.log(err);
        }
        res.status(200).send(body)
    });
});


module.exports = VideosRoute;
