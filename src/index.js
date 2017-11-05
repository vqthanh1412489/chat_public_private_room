const express = require('express'); 
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const User = require('../models/User');
const users = [];

app.set('view engine', 'ejs'); 
app.set('views', './views');
app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.render('home');
});

io.on('connection', socket => {
    let currentUser;
    let currentRoomname;
    socket.on('client_send_username', username => {
        const isExists = users.some(user => user.username === username);
        if (isExists) return socket.emit('server_send_confirm', false);
        currentUser = username;
        socket.emit('server_send_confirm', true);
        socket.emit('server_send_listuser', users);
        const user = new User(socket.id, username);
        users.push(user);
        io.emit('server_send_newuser', user);
    });

    socket.on('client_send_message', message => {
        io.emit('server_send_message', currentUser + ': ' + message);
    });

    socket.on('client_send_id_private', obj => {
        const { message, idPrivate } = obj;
        socket.to(idPrivate).emit('client_send_message_private', currentUser + ': ' + message);
        socket.emit('client_send_message_private', currentUser + ': ' + message);
    });

    socket.on('client_send_roomname', roomName => {
        // Do hàm join() và leave() là 1 hàm bất đồng bọ nên có cb
        //Neu no chua o trong room nao thi join vao roomname
        if (!currentRoomname){
            socket.join(roomName, () => currentRoomname = roomName);
        }

        // Neu no o trong room khac roi thi leave room do va cho vao roomname
        socket.leave(currentRoomname, () => {
            socket.join(roomName, () => currentRoomname = roomName);
        });
    });

    socket.on('client_send_message_room', message => {
        io.in(currentRoomname).emit('server_send_mess_room', currentUser + ': ' + message);
    });

    socket.on('disconnect' ,() => {
        const index = users.findIndex(user => user.id === socket.id);
        if (index === -1) return;
        io.emit('user_disconnect', users[index]);
        users.splice(index, 1);
    });
});

server.listen(3009, () => console.log('Server started!'));


require('reload')(app);