const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./DbCredentials.js');
const cache = require('memory-cache');

let memCache = new cache.Cache();
let cacheMiddleware = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cacheContent = memCache.get(key);
        if (cacheContent) {
            console.log(`CACHE CONTENT: ${cacheContent}`)
            res.send(cacheContent);
            return
        } else {
            res.sendResponse = res.send
            res.send = (body) => {
                memCache.put(key, body, duration * 10000);
                res.sendResponse(body)
            }
            next()
        }
    }
}

const CommentRoute = require('./routes/commentRoutes');
const VideosRoute = require('./routes/videoRoutes');
const FeedbacksRoute = require('./routes/feedbackRoutes');
const ChannelsRoute = require('./routes/channelRoutes');
const RepliesRoute = require('./routes/replyRoutes');
const UsersRoute = require('./routes/userRoutes');
const LandingsRoute = require('./routes/landingRoutes');
const ContributorsRoute = require('./routes/contributorRoutes');
const ReputationsRoute = require('./routes/reputationRoutes');
const RepMgtOptsRoute = require('./routes/repMgtOptsRoutes');


const connectToLocalDb = () => {
    mongoose.connect(config.localDB, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
        if (err) console.error(err)
        console.log('Local db connected');
    })
};

mongoose.connect(config.remoteDB, {
    user: config.remoteUser,
    pass: config.remotePass,
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(
        () => {
            console.log('Remote database is connected')
        },
        err => {
            console.log('Cannot connect to the remote database' + err);
            connectToLocalDb();
        }
    );

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/channels', ChannelsRoute);
app.use('/comments', CommentRoute);
app.use('/feedbacks', FeedbacksRoute);
app.use('/replies', RepliesRoute);
app.use('/users', UsersRoute);
app.use('/videos', VideosRoute);
app.use('/landings', cacheMiddleware(30), LandingsRoute);
app.use('/contributor', ContributorsRoute);
app.use('/reputation', ReputationsRoute);
app.use('/repMgtOptions', RepMgtOptsRoute);

app.get('/health', (req, res) => res.send('Hello healthy app!'))

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});
