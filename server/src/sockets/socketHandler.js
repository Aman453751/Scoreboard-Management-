const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific match scoreboard
    socket.on('join_match', (matchId) => {
      const room = `match_${matchId}`;
      socket.join(room);
      console.log(`[Socket.IO] Client ${socket.id} joined ${room}`);
    });

    // Leave match room
    socket.on('leave_match', (matchId) => {
      const room = `match_${matchId}`;
      socket.leave(room);
      console.log(`[Socket.IO] Client ${socket.id} left ${room}`);
    });

    // Subscribe to global updates (used on dashboards and landing page)
    socket.on('join_global', () => {
      socket.join('global_feed');
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });
};

module.exports = initSocket;
