const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // serve index.html & JS

// Rooms: { roomId: { board: {}, turn: 'X', players: [], size: 3|5, minX, maxX, minY, maxY } }
const rooms = {};


function checkWinner(board, size, winLength) {
  const directions = [
    [1, 0],  // →
    [0, 1],  // ↓
    [1, 1],  // ↘
    [1, -1]  // ↗
  ];

  for (const key in board) {
    const [x, y] = key.split(',').map(Number);
    const player = board[key];

    for (const [dx, dy] of directions) {
      let count = 1;

      for (let i = 1; i < winLength; i++) {
        if (board[`${x + dx * i},${y + dy * i}`] === player) {
          count++;
        } else {
          break;
        }
      }

      if (count >= winLength) return player;
    }
  }
  return null;
}


io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('joinOnlineRoom', ({ roomId, size }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
  rooms[roomId] = {
    board: {},
    turn: 'X',
    players: [],
    size: size || 5,
    minX: size === 5 ? -5 : 0,
    maxX: size === 5 ? 5 : 2,
    minY: size === 5 ? -5 : 0,
    maxY: size === 5 ? 5 : 2
  };
}

    const room = rooms[roomId];
    room.size = size || 5; // 3x3 or 5x5

    // Assign X or O
    if (room.players.length < 2 && !room.players.includes(socket.id)) {
      room.players.push(socket.id);
    }
    const playerSide = room.players[0] === socket.id ? 'X' : 'O';
    socket.emit('playerSide', playerSide);

    // Send current board and turn
    socket.emit('updateOnlineBoard', {
  board: room.board,
  turn: room.turn,
  size: room.size,
  minX: room.minX ?? (room.size === 5 ? -5 : 0),
  maxX: room.maxX ?? (room.size === 5 ? 5 : 2),
  minY: room.minY ?? (room.size === 5 ? -5 : 0),
  maxY: room.maxY ?? (room.size === 5 ? 5 : 2)
});

  });

  socket.on('onlineMove', ({ roomId, x, y }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (!room.players.includes(socket.id)) return;

    const playerSide = room.players[0] === socket.id ? 'X' : 'O';
    if (playerSide !== room.turn) return;
    const key = `${x},${y}`;
    if (room.board[key]) return;

    room.board[key] = playerSide;

    // EXPAND 5x5 board
    if (room.size === 5) {
  room.minX = Math.min(room.minX, x - 1);
  room.maxX = Math.max(room.maxX, x + 1);
  room.minY = Math.min(room.minY, y - 1);
  room.maxY = Math.max(room.maxY, y + 1);
}


    // Check winner
    function checkWinner(board, size, winLength) {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];

  for (const key in board) {
    const [x, y] = key.split(',').map(Number);
    const player = board[key];

    for (const [dx, dy] of dirs) {
      let count = 1;
      for (let i = 1; i < winLength; i++) {
        if (board[`${x + dx * i},${y + dy * i}`] === player) {
          count++;
        } else break;
      }
      if (count >= winLength) return player;
    }
  }
  return null;
}

    const winLength = room.size === 3 ? 3 : 5;
    const winner = checkWinner(room.board, room.size, winLength);

    if (winner) {
      io.to(roomId).emit('winner', { winner, board: room.board });
      if (room.size === 3) {
        // Reset board for 3x3
        setTimeout(() => {
          room.board = {};
          room.turn = 'X';
          io.to(roomId).emit('updateOnlineBoard', {
            board: room.board,
            turn: room.turn,
            size: room.size
          });
        }, 800);
        return;
      } else {
        // For 5x5 infinite, just continue
        room.turn = room.turn === 'X' ? 'O' : 'X';
      }
    } else {
      room.turn = room.turn === 'X' ? 'O' : 'X';
    }

    io.to(roomId).emit('updateOnlineBoard', {
      board: room.board,
      turn: room.turn,
      size: room.size,
      minX: room.minX,
      maxX: room.maxX,
      minY: room.minY,
      maxY: room.maxY
    });
  });

  socket.on('chatOnline', ({ roomId, message }) => {
    const room = rooms[roomId];
    if (!room) return;
    const playerSide = room.players[0] === socket.id ? 'X' : 'O';
    io.to(roomId).emit('chatOnline', `${playerSide}: ${message}`);
  });
});

server.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
