const Videos = require('../models/VideoModel');
const vimeoCredentials = process.env.VIMEO_ACCESS_TOKEN;
const request = require('request');

module.exports.pollDb = () => {
    Videos.find({'transpiled': { $not: { $eq: 'complete' } } })
        .then(video => {
            const header = {
                'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + vimeoCredentials
            };
            video.forEach(V => {
                request({
                    url: `https://api.vimeo.com/videos/${V.uri.substr(18)}`,
                    method: 'GET',
                    headers: header
                }, (err, res, body) => {
                    if (err) {
                        return console.log(err);
                    }

                    if (JSON.parse(body).transcode.status !== 'complete') {
                        return console.log('Video transpilation not yet complete or this is not a vimeo video.')
                    }
                    const metaObj = {
                        is_playable: JSON.parse(body).is_playable,
                        duration: JSON.parse(body).duration,
                        thumb: JSON.parse(body).pictures.sizes[0].link,
                        transpiled: JSON.parse(body).transcode.status,
                    };
                    Videos.updateOne({_id: V._id}, metaObj)
                        .then(response => console.log('modified: ',  response.nModified))
                        .catch(error => console.error(error));
                })
            })
        })
        .catch(err => console.error(err));
};