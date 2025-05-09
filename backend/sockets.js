/**
 * Register Socket.IO event handlers.
 * @param {import('socket.io').Server} io
 */
module.exports = function (io) {
  // Store active users and their socket IDs
  const userSockets = new Map(); // userId -> socketId
  const pendingCalls = new Map(); // userId -> {callerId, callerSocketId}

  io.on('connection', socket => {
    console.log('socket connected:', socket.id);
    
    // User identifies themselves with their user ID
    socket.on('register', userId => {
      console.log(`User ${userId} registered with socket ${socket.id}`);
      userSockets.set(userId, socket.id);
      socket.userId = userId; // Store userId on the socket object
    });

    // User initiates a call to another user
    socket.on('call-user', targetUserId => {
      const callerUserId = socket.userId;
      console.log(`${callerUserId} is calling ${targetUserId}`);
      
      pendingCalls.set(targetUserId, {
  callerId: callerUserId,
  callerSocketId: socket.id
});

// If the target is online, notify them
const targetSocketId = userSockets.get(targetUserId);
if (targetSocketId) {
  io.to(targetSocketId).emit('incoming-call', {
    callerId: callerUserId
  });
}

// Caller gets confirmation that the call is pending
socket.emit('call-pending', { targetUserId });
    });

    // Target user accepts the call
    socket.on('accept-call', () => {
      const targetUserId = socket.userId;
      if (pendingCalls.has(targetUserId)) {
        const { callerId, callerSocketId } = pendingCalls.get(targetUserId);
        const roomId = `${callerId}-${targetUserId}-${Date.now()}`;
        
        // Join both users to the same room
        socket.join(roomId);
        const callerSocket = io.sockets.sockets.get(callerSocketId);
        if (callerSocket) {
          callerSocket.join(roomId);
        }
        
        // Notify caller that call was accepted
        io.to(callerSocketId).emit('call-accepted', { roomId });
        socket.emit('call-connected', { roomId });
        
        // Initiate WebRTC connection
        io.to(callerSocketId).emit('initiate-peer');
        
        // Remove from pending calls
        pendingCalls.delete(targetUserId);
      }
    });

    // Target user rejects the call
    socket.on('reject-call', () => {
      const targetUserId = socket.userId;
      if (pendingCalls.has(targetUserId)) {
        const { callerSocketId } = pendingCalls.get(targetUserId);
        io.to(callerSocketId).emit('call-rejected');
        pendingCalls.delete(targetUserId);
      }
    });

    socket.on('signal', data => {
      const [, roomId] = Array.from(socket.rooms);
      socket.to(roomId).emit('signal', data);
    });

    socket.on('disconnect', reason => {
      console.log('socket disconnected:', socket.id, reason);
      // Remove from userSockets map if this user was registered
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });
  });
};