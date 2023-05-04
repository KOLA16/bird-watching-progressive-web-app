exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        try {
            /**
             * create or joins a room
             */
            socket.on('create or join', function (room, userId) {
                socket.join(room);
                console.log(userId+" joined a room "+room);
                io.sockets.to(room).emit('joined', room, userId);
            });

            /**
             * send chat messages
             */
            socket.on('chat', function (room, userId, chatText) {
                io.sockets.to(room).emit('chat', room, userId, chatText);
            });

            /**
             * disconnect
             */
            socket.on('disconnect', function (){
                console.log('someone disconnected');
            });

        } catch (e) {
        }
    });
}
