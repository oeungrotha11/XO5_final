import { renderBoard } from './game-core.js';

export function startLocal(boardEl, statusEl) {
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
    return board[`${x},${y}`] ? '' : currentTurn;
  }

  function onCellClick(x,y){
    const key = `${x},${y}`;
    if (board[key]) return;

    board[key] = currentTurn;
    expand(x,y);
    currentTurn = currentTurn === 'X' ? 'O' : 'X';
    statusEl.innerText = `Turn: ${currentTurn}`;
    render();
  }

  function render(){
    renderBoard({
      boardEl,
      board,
      minX,maxX,minY,maxY,
      getPreview,
      onCellClick
    });
  }

  statusEl.innerText = 'Turn: X';
  render();
}
