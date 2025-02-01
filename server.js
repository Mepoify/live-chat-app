// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from the "public" directory
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Set user nickname
  socket.on('set nickname', (nickname) => {
    socket.nickname = nickname || 'Anonymous';
  });

  // Join a chat room
  socket.on('join room', (room) => {
    // Leave the previous room (if any) before joining a new one
    if (socket.room) {
      socket.leave(socket.room);
    }
    socket.join(room);
    socket.room = room;
    const timestamp = new Date().toLocaleTimeString();
    io.to(room).emit('chat message', `[${timestamp}] ${socket.nickname} joined room ${room}.`);
  });

  // Listen for chat messages and broadcast only to the current room
  socket.on('chat message', (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    if (socket.room) {
      io.to(socket.room).emit('chat message', `[${timestamp}] ${socket.nickname}: ${msg}`);
    } else {
      socket.emit('chat message', 'You are not in any room. Please join a room first.');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.room) {
      const timestamp = new Date().toLocaleTimeString();
      io.to(socket.room).emit('chat message', `[${timestamp}] ${socket.nickname} left the room.`);
    }
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
