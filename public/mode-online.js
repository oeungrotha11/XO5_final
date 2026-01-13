// mode-online.js
import { board, renderBoard, checkWinner } from './game-core.js';

export function startOnline(boardEl, statusEl, socket, roomId, size = 5) {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('game').classList.remove('hidden');

  let currentTurn = 'X';
  let playerSide = null;

  // ✅ DO NOT USE x or y here
  let minX = size === 5 ? -5 : 0;
  let maxX = size === 5 ? 5 : 2;
  let minY = size === 5 ? -5 : 0;
  let maxY = size === 5 ? 5 : 2;


  function getPreview(x, y) {
    return currentTurn === playerSide && !board[`${x},${y}`] ? playerSide : '';
  }

function onCellClick(x, y) {
  console.log('MOVE:', x, y, 'BY', playerSide);
  if (!playerSide) return;
  if (currentTurn !== playerSide) return;
  socket.emit('onlineMove', { roomId, x, y });
}


  // JOIN ROOM
  socket.emit('joinOnlineRoom', { roomId, size });

  // GET PLAYER SIDE
  socket.on('playerSide', side => {
    playerSide = side;
    statusEl.innerText = `You are: ${playerSide}`;
  });

  // UPDATE BOARD FROM SERVER
  socket.on('updateOnlineBoard', ({ board: newBoard, turn, size: serverSize, minX: srvMinX, maxX: srvMaxX, minY: srvMinY, maxY: srvMaxY }) => {
    // update global board
    Object.keys(board).forEach(k => delete board[k]);
    Object.assign(board, newBoard);

    currentTurn = turn;
    size = serverSize;

    if (size === 5) {
      minX = srvMinX; maxX = srvMaxX; minY = srvMinY; maxY = srvMaxY;
    } else {
      minX = 0; maxX = 2; minY = 0; maxY = 2;
    }

    renderBoard({
      boardEl,
      size,
      getPreview,
      onCellClick,
      minX,
      maxX,
      minY,
      maxY
    });

    statusEl.innerText = `Turn: ${turn}` + (playerSide ? ` | You: ${playerSide}` : '');
  });

  // WINNER ALERT
  socket.on('winner', ({ winner, board: newBoard }) => {
    alert(`${winner} wins!`);

    // 3x3 resets board automatically
    if (size === 3) {
      Object.keys(board).forEach(k => delete board[k]);
      socket.emit('updateOnlineBoard', { board, turn: 'X', size });
    }
  });

  // CHAT
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  chatSend.onclick = () => {
    const message = chatInput.value.trim();
    if (!message) return;
    socket.emit('chatOnline', { roomId, message });
    chatInput.value = '';
  };

  socket.on('chatOnline', msg => {
    const div = document.createElement('div');
    div.textContent = msg;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}
