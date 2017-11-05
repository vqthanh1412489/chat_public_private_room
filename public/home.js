const socket = io();

let idPrivate;
let roomName;

$('#divChat').hide();

// Lang nghe thay doi tren cac the p cua divUser de thay doi active
$('#divUsers').on('click', 'p', function () {
    $('#divUsers p').removeClass();
    $(this).addClass('active');
    const stringId = $(this).attr('id');
    idPrivate = stringId.substring(4);
});

//Lắng nghe Click vào thẻ p ở trong divRoom
$('#divRoom').on('click', 'p', function(){
    $('#divRoom p').removeClass();
    $(this).addClass('active');
    roomName = $(this).text();
    socket.emit('client_send_roomname', roomName);
});

// Send message private
$('#btnSendPrivate').click(() => {
    if (!idPrivate) return alert('Chưa chọn người nhận tin nhắn Private');
    const message = $('#inputMessage').val();
    if (!message) return alert('Chưa nhập tin nhắn mà...');
    socket.emit('client_send_id_private', {message, idPrivate});
    $('#inputMessage').val('');
});

// Send message in Room
$('#btnSendRoom').click(() => {
    if (!roomName) return alert('Chưa tham gia room');
    const message = $('#inputMessage').val();
    if (!message) return alert('Chưa nhập nội dung tin nhắn gửi đi');
    socket.emit('client_send_message_room', message);
});

// Dang ky nick
$('#btnCreate').click(() => {
    const username = $('#inputUsername').val();
    socket.emit('client_send_username', username);
    $('#inputUsername').val('');
});

// Gui message
$('#btnSend').click(() => {
    const message = $('#inputMessage').val();
    socket.emit('client_send_message', message);
    $('#inputMessage').val('');
});

// Xac nhan dk thanh cong
socket.on('server_send_confirm', isSuccess => {
    if (!isSuccess) return alert('Username da ton tai');
    $('#divChat').show();
    $('#divSignUp').hide();

    // Them user moi vao (Dang nhap thanh cong ms can reload lai, con k thi chi can dua het cai users ra)
    socket.on('server_send_newuser', user => {
        $('#divUsers').append(`<p id="soc-${user.id}">${user.username}</p>`);
    });

});

// Client nhan message
socket.on('server_send_message', message => {
    $('#divMessages').append(`<p>${message}</p>`);
});

// Show list user
socket.on('server_send_listuser', users => {
    users.forEach(user => {
        $('#divUsers').append(`<p id="soc-${user.id}">${user.username}</p>`);
    });
});

// Nhan tin nhan Private
socket.on('client_send_message_private', message => {
    $('#divMessagePrivate').append(`<p>${message}</p>`);
});

// Nhan tin nhan room
socket.on('server_send_mess_room', message => {
    $('#divMessageRoom').append(`<p>${message}</p>`)
});

// out app
socket.on('user_disconnect', user => {
    $(`#soc-${user.id}`).remove();
});


