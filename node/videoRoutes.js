const express = require('express');
const VideosRoute = express.Router();
const Videos = require('../models/VideoModel');
const vimeoCredentials = require('../vimeoCredentials');

VideosRoute.route('/getVimeoUploadURL').post((req, res) => {
    const data = req.body.data
    const request = require('request');
    const options = {
        url: 'https://api.vimeo.com/me/videos',
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + vimeoCredentials.ACCESS_TOKEN
        },
        body: JSON.stringify(data)
    }
    request.post(options, (err, response, body) => {
        if (err) {
            return console.log(err);
        }
        res.send(body)
    });
});
VideosRoute.route('/deleteVimeoVid').post((req, res) => {
    const {uri} = req.body;
    const request = require('request');
    const url = `https://api.vimeo.com/videos/${uri}`

    request.delete(url, {
        headers: {
            'Authorization': 'bearer ' + vimeoCredentials.ACCESS_TOKEN
        }
    }, (err, response, body) => {
        if (err) {
            return console.log(err);
        }
        res.send(body)
    });
});


    module.exports = VideosRoute;
