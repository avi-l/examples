const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const UsersRoute = require('./routes/userRoutes');
const ConversationRoute = require('./routes/conversationRoutes');
const MessageRoute = require('./routes/messageRoutes');

mongoose.connect(process.env.DB_CONNECT_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(
        () => {
            console.log('Remote database is connected');
        },
        err => {
            console.log('Cannot connect to the remote database' + err);
        }
    );

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/users', UsersRoute);
app.use('/message', MessageRoute);
app.use('/conversation', ConversationRoute);

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
        users.push({ userId, socketId })
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
    socket.on('sendMessage', ({ senderId, receiverId, text, timestamp }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('getMessage', {
          senderId,
          receiverId,
          text,
          timestamp
        });       
      });
     
    //delete message
    socket.on('deleteMessage', ({receiverId, messageId}) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('deleteMessage', {
            messageId,
        });
      });
    //listen for user typing..
    socket.on('userStartedTyping', ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('userStartedTyping', {
          senderId,
          receiverId
        });
      });
    socket.on('userStoppedTyping', ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('userStoppedTyping', {
          senderId,
          receiverId
        });
      });
    //conversation selected
    socket.on('selectedConversation', ({ senderId, receiverId }) => {
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
})
