import { renderBoard } from './game-core.js';

export function startOnline(boardEl, statusEl, socket, roomId, playerSide) {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('game').classList.remove('hidden');

  let board = {};
  let currentTurn = 'X';
  let minX = -10, maxX = 10, minY = -10, maxY = 10;

  function expand(x,y){
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  function getPreview(x,y){
    return currentTurn === playerSide && !board[`${x},${y}`]
      ? playerSide
      : '';
  }

  function onCellClick(x,y){
    if (currentTurn !== playerSide) return;
    socket.emit('onlineMove', { roomId, x, y });
  }

  socket.on('updateOnlineBoard', ({ board:newBoard, turn }) => {
    board = newBoard;
    currentTurn = turn;
    Object.keys(board).forEach(k=>{
      const [x,y]=k.split(',').map(Number);
      expand(x,y);
    });
    render();
  });

  function render(){
    renderBoard({
      boardEl,
      board,
      minX,maxX,minY,maxY,
      getPreview,
      onCellClick
    });
  }

  statusEl.innerText = 'Waiting for opponent...';
  render();
}
