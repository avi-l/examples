import { io } from 'socket.io-client'
import { socketIORoute } from '../../currentRoute';

let socket;
if (socketIORoute === '') {
    socket = io({ transports: ['websocket'] })
}
else {
    socket = io(socketIORoute, { transports: ['websocket'] })
}
socket.on('connected', () => {
    console.log(`Connected to initial socketId ${socket.id}`)
})

socket.on('disconnect', (reason) => {
    console.log(`Disconnected from socket: ${reason}`)   
})
socket.on('connect_error', (err) => {
    console.log(`socket connect_error due to ${err.message}`);
});
// catch-all to log any socket event for debugging purposes
// socket.onAny((event, ...args) => {
//     console.log(event, args);
//   });

export default socket;