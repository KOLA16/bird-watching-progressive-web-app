exports.init = (io) => {
    io.sockets.on('connection', (socket) => {
        try {
            /**
             * create or joins a room
             */
            socket.on('create or join', (room, userId) => {
                socket.join(room);
                io.sockets.to(room).emit('joined', room, userId)
            })

            /**
             * send chat messages
             */
            socket.on('chat', (room, userId, chatText) => {
                io.sockets.to(room).emit('chat', room, userId, chatText)
            })

            /**
             * disconnect
             */
            socket.on('disconnect', () => {
                console.log('someone disconnected')
            })

        } catch (e) {
        }
    })
}
