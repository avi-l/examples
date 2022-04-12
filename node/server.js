const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const getVimeoMetadata = require('./routes/getVimeoMetadata');

const CommentRoute = require('./routes/commentRoutes');
const VideosRoute = require('./routes/videoRoutes');
const FeedbacksRoute = require('./routes/feedbackRoutes');
const ChannelsRoute = require('./routes/channelRoutes');
const RepliesRoute = require('./routes/replyRoutes');
const UsersRoute = require('./routes/userRoutes');
const UserResourceRoute = require('./routes/userResourcesRoutes')
const FollowRoute = require('./routes/followRoutes');
const LandingsRoute = require('./routes/landingRoutes');
const ContributorsRoute = require('./routes/contributorRoutes');
const ReputationsRoute = require('./routes/reputationRoutes');
const RepMgtOptsRoute = require('./routes/repMgtOptsRoutes');
const ConversationRoute = require('./routes/conversationRoutes');
const MessageRoute = require('./routes/messageRoutes');
const AssistantRoute = require('./routes/assistantRoutes');
const SubscriberRoute = require('./routes/subscriberRoutes');
const NotificationsRoute = require('./routes/notificationsRoute')

mongoose.connect(process.env.DB_CONNECT_STRING_ALPHA, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(
        () => {
            console.log('Remote database is connected');
            getVimeoMetadata.pollDb();
            setInterval(() => getVimeoMetadata.pollDb(), 9000000);
        }
    )
    .catch(err => err);
    process.on('unhandledRejection', (error, promise) => {
        console.error(' Oh NO! We forgot to handle a promise rejection here: ', promise);
        console.error(' The error was: ', error );
      })
      .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
      });

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/channels', ChannelsRoute);
app.use('/comments', CommentRoute);
app.use('/feedbacks', FeedbacksRoute);
app.use('/replies', RepliesRoute);
app.use('/users', UsersRoute);
app.use('/notifications', NotificationsRoute);
app.use('/follows', FollowRoute);
app.use('/videos', VideosRoute);
app.use('/landings', LandingsRoute);
app.use('/contributor', ContributorsRoute);
app.use('/reputation', ReputationsRoute);
app.use('/repMgtOptions', RepMgtOptsRoute);
app.use('/message', MessageRoute);
app.use('/conversation', ConversationRoute);
app.use('/subscribers', SubscriberRoute);
app.use('/assistants', AssistantRoute);
app.use('/userResources', UserResourceRoute);


app.get('/health', (req, res) => res.send('Hello healthy app!'))

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});

// SOCKET.IO 
const io = require('socket.io')(8900, {
    cors: {
        origin: process.env.FE_SOCKET_CORS,
    },
});

let users = []
const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) &&
    users.push({userId, socketId})
}
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}
const getUser = (receiverId) => {
    return users.find((user) => user.userId === receiverId)
}
io.on('connection', (socket) => {
    //when connect
    //take userId and socketId add to users array 
    socket.on('addUser', userId => {
        addUser(userId, socket.id)
        io.emit('getUsers', users)
        socket.emit('connected')
    })
    //send message
    socket.on('sendMessage', ({data}) => {
        const user = getUser(data.receiverId);
        io.to(user?.socketId).emit('getMessage', data);
    });

    //delete message
    socket.on('deleteMessage', ({receiverId, messageId}) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('deleteMessage', {
            messageId,
        });
    });
    //listen for user typing..
    socket.on('userStartedTyping', ({senderId, receiverId}) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('userStartedTyping', {
            senderId,
            receiverId
        });
    });
    socket.on('userStoppedTyping', ({senderId, receiverId}) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('userStoppedTyping', {
            senderId,
            receiverId
        });
    });
    //conversation selected
    socket.on('markMsgsRead', ({senderId, receiverId}) => {
        const user = getUser(senderId);
        io.to(user?.socketId).emit('markMsgsRead', {
            senderId,
            receiverId
        });
    });
    //when disconnect
    socket.on('disconnect', () => {
        socket.emit('disconnected');
        removeUser(socket.id)
        io.emit('getUsers', users)
    })

    socket.on('obtainGraph', () => {
       socket.emit('obtainGraph', {});
    })

});