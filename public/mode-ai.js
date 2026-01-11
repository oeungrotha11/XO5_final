import { renderBoard } from './game-core.js';

export function startAI(boardEl, statusEl) {
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
    return currentTurn === 'X' && !board[`${x},${y}`] ? 'X' : '';
  }

  function onCellClick(x,y){
    if (currentTurn !== 'X') return;
    if (board[`${x},${y}`]) return;

    board[`${x},${y}`] = 'X';
    expand(x,y);
    currentTurn = 'O';
    render();

    setTimeout(aiMove, 200);
  }

  function aiMove(){
    for (let y=minY; y<=maxY; y++) {
      for (let x=minX; x<=maxX; x++) {
        if (!board[`${x},${y}`]) {
          board[`${x},${y}`] = 'O';
          expand(x,y);
          currentTurn = 'X';
          render();
          return;
        }
      }
    }
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

  statusEl.innerText = 'Your turn: X';
  render();
}
