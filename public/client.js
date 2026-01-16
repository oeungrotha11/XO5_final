// client.js (replace your file)
import { startLocal } from './mode-local.js';
import { startAI } from './mode-ai.js';
import { startOnline } from './mode-online.js';

document.addEventListener('DOMContentLoaded', () => {

function resetGameUI() {
  // Clear board ONLY (not whole page)
  boardEl.innerHTML = '';
  statusEl.textContent = '';

  // Leave online room safely
  if (currentRoom) {
    socket.emit('leaveRoom', { roomId: currentRoom });
    currentRoom = null;
  }

  // Force UI state
  showLanding();

  // Hide leave button
  leaveBtn.style.display = 'none';
}



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
 function showGame() {
  landing.style.display = 'none';
  gameScreen.style.display = 'flex';
  
}

function showLanding() {
  gameScreen.style.display = 'none';
  landing.style.display = 'flex';
}





  // Local mode
  btnLocal.addEventListener('click', () => {
  const size = Number(sizeSelect.value);
  currentRoom = null; // NOT online
  showGame();
  leaveBtn.style.display = 'inline-block';

  startLocal(boardEl, statusEl, size);
});


btnAI.addEventListener('click', () => {
  const size = Number(sizeSelect.value);
  currentRoom = null; // NOT online
  showGame();
  leaveBtn.style.display = 'inline-block';

  startAI(boardEl, statusEl, size);
});
;

  // Online mode
  let currentRoom = null;
  btnOnline.addEventListener('click', () => {
  const roomId = prompt('Enter room name (use same in other tab):');
  if (!roomId) return;

  const size = Number(sizeSelect.value);
  currentRoom = roomId;

  console.log('Joining room', roomId, 'size', size);

  showGame();
  leaveBtn.style.display = 'inline-block';


  startOnline(boardEl, statusEl, socket, roomId, size);
});


  // Leave online room
leaveBtn.addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('leaveRoom', { roomId: currentRoom });
    currentRoom = null;
  }

  resetGameUI();
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
