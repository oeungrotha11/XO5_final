const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // serve index.html & game.js

// ===== ROOMS =====
const rooms = {}; // { roomId: { board: {}, turn: 'X', players: [socketIdX, socketIdO] } }

// ===== SOCKET.IO =====
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('joinOnlineRoom', roomId => {
    socket.join(roomId);

    // Send updated spectator count
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    const playerCount = rooms[roomId]?.players.length || 0;
    const spectators = Math.max(roomSize - playerCount, 0);

    io.to(roomId).emit(
      'spectatorCount', spectators);


    if (!rooms[roomId]) {
      rooms[roomId] = { board: {}, turn: 'X', players: [] };
    }

    const room = rooms[roomId];

    // Assign X or O
    if (room.players.length < 2 && !room.players.includes(socket.id)) {
      room.players.push(socket.id);
    }

    let playerSide = room.players[0] === socket.id ? 'X' : 'O';
    socket.emit('playerSide', playerSide);

    // Send current board and turn to this socket
    io.to(socket.id).emit('updateOnlineBoard', { board: room.board, turn: room.turn });
    io.to(roomId).emit('statusOnline', `Current turn: ${room.turn}`);
  });

  socket.on('onlineMove', ({ roomId, x, y }) => {
    const room = rooms[roomId];
    if (!room || room.board[`${x},${y}`]) return;

    // Only allow current turn to play
    const playerSide = room.players[0] === socket.id ? 'X' : 'O';
    if (playerSide !== room.turn) return;

    room.board[`${x},${y}`] = playerSide;

    // Check winner
    const winner = checkWinner(room.board);
if (winner) {
  io.to(roomId).emit('winner', winner);
  return;
}

room.turn = room.turn === 'X' ? 'O' : 'X';
io.to(roomId).emit('updateOnlineBoard', {
  board: room.board,
  turn: room.turn
});

  });

  socket.on('chatOnline', ({ roomId, message }) => {
    const playerSide = rooms[roomId]?.players[0] === socket.id ? 'X' : 'O';
    io.to(roomId).emit('chatOnline', `${playerSide}: ${message}`);
  });

  socket.on('rematchOnline', ({ roomId }) => {
  });

  socket.on('disconnect', () => {
    for (let rId in rooms) {
      const room = rooms[rId];
      if (!room) continue;

      const roomSize = io.sockets.adapter.rooms.get(rId)?.size || 0;
      const spectators = Math.max(roomSize - room.players.length, 0);
      io.to(rId).emit('spectatorCount', spectators);
    }
  });
});

// ================= WIN CHECK =================
function checkWinner(board) {
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let key in board) {
    const [x, y] = key.split(',').map(Number);
    const player = board[key];
    for (let [dx, dy] of directions) {
      let count = 1;
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (board[`${nx},${ny}`] === player) count++;
        else break;
      }
      if (count >= 5) return player;
    }
  }
  return null;
}

// ===== START SERVER =====
server.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
