

/**
 
Register Socket.IO event handlers.
@param {import('socket.io').Server} io*/
module.exports = function (io) {
io.on('connection', socket => {
  console.log('socket connected:', socket.id);

  socket.on('join', roomId => {
    console.log(`${socket.id} joined room ${roomId}`);
    socket.join(roomId);
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    console.log(`clients in ${roomId}:`, clients);
    if (clients.length === 2) {
      io.to(clients[0]).emit('initiate-peer');
    }
  });

  socket.on('signal', data => {
    const [ , roomId ] = Array.from(socket.rooms);
    socket.to(roomId).emit('signal', data);
  });

  socket.on('disconnect', reason => {
    console.log('socket disconnected:', socket.id, reason);
  });
});


};