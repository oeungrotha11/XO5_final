// mode-local.js
import { board, expandBoard, renderBoard, checkWinner } from './game-core.js';

export function startLocal(boardEl, statusEl, size = 3) {
  // reset board
  for (const k of Object.keys(board)) delete board[k];
  // reset view bounds for 5x5
  if (size === 5) { 
    // keep defaults; you can reset min/max if you want a fresh visible area
    // minX = -5; maxX = 5; minY = -5; maxY = 5; // OPTIONAL: uncomment to reset view
  }

  let currentTurn = 'X';

  function getPreview(x,y) { return board[`${x},${y}`] ? '' : currentTurn; }

  function onCellClick(x,y) {
    const key = `${x},${y}`;
    if (board[key]) return;
    board[key] = currentTurn;
    if (size === 5) expandBoard(x,y);

    const winner = checkWinner(board, size, size === 3 ? 3 : 5);
    if (winner) {
      statusEl.innerText = `${winner} wins!`;
      // behavior: reset for 3x3, continue for 5x5
      if (size === 3) {
        setTimeout(() => {
          for (const k of Object.keys(board)) delete board[k];
          currentTurn = 'X';
          statusEl.innerText = `Turn: ${currentTurn}`;
          renderBoard({ boardEl, size, getPreview, onCellClick });
        }, 700);
        return;
      }
    } else {
      currentTurn = currentTurn === 'X' ? 'O' : 'X';
      statusEl.innerText = `Turn: ${currentTurn}`;
    }
    renderBoard({ boardEl, size, getPreview, onCellClick });
  }

  renderBoard({ boardEl, size, getPreview, onCellClick });
  statusEl.innerText = `Turn: ${currentTurn}`;
}
