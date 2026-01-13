// client.js (replace your file)
import { startLocal } from './mode-local.js';
import { startAI } from './mode-ai.js';
import { startOnline } from './mode-online.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const sizeSelect = document.getElementById('board-size');
  const btnLocal = document.getElementById('btn-local');
  const btnAI = document.getElementById('btn-ai');
  const btnOnline = document.getElementById('btn-online');
  const rematchBtn = document.getElementById('rematch-btn');
  const leaveBtn = document.getElementById('leave-online');

  // Create global socket using UMD (served by your server at /socket.io/socket.io.js)
  // Make sure your server is running before loading the page.
  const socket = io(); // <-- USE THIS global (do not import io)
  console.log('socket created (client):', !!socket);

  // Show/hide helpers
  const landing = document.getElementById('landing');
  const gameScreen = document.getElementById('game');
  function showGame() { landing.classList.add('hidden'); gameScreen.classList.remove('hidden'); }
  function showLanding() { landing.classList.remove('hidden'); gameScreen.classList.add('hidden'); }

  // Local mode
  btnLocal.addEventListener('click', () => {
    const size = Number(sizeSelect.value);
    showGame();
    startLocal(boardEl, statusEl, size);
    // if connected online previously, you can optionally disconnect here
  });

  // AI mode
  btnAI.addEventListener('click', () => {
    const size = Number(sizeSelect.value);
    showGame();
    startAI(boardEl, statusEl, size);
  });

  // Online mode
  let currentRoom = null;
  btnOnline.addEventListener('click', () => {
    const roomId = prompt('Enter room name (use same in other tab):');
    if (!roomId) return;
    const size = Number(sizeSelect.value);
    currentRoom = roomId;

    console.log('Joining room', roomId, 'size', size);
    // start online mode (mode-online expects socket param)
    showGame();
    startOnline(boardEl, statusEl, socket, roomId, size);

    // Tell server we join with chosen size (server should use the payload)
    socket.emit('joinOnlineRoom', { roomId, size });

    // Show leave button
    leaveBtn.classList.remove('hidden');
  });

  // Leave online room
  leaveBtn.addEventListener('click', () => {
    if (currentRoom) {
      socket.emit('leaveRoom', { roomId: currentRoom }); // server may not implement leave, but safe to emit
      currentRoom = null;
      leaveBtn.classList.add('hidden');
      showLanding();
      // optional: clear board or reset UI
    }
  });

  // Rematch (local)
  rematchBtn.addEventListener('click', () => {
    const size = Number(sizeSelect.value);
    startLocal(boardEl, statusEl, size);
  });

  // Optional: log socket connect/disconnect
  socket.on('connect', () => console.log('socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('socket disconnected:', reason));
});
