// mode-ai.js
import { board, expandBoard, renderBoard, checkWinner } from './game-core.js';

export function startAI(boardEl, statusEl, size = 3) {
  for (const k of Object.keys(board)) delete board[k];

  let currentTurn = 'X';

  function getPreview(x,y) { return board[`${x},${y}`] ? '' : currentTurn; }

  function onCellClick(x,y) {
    if (currentTurn !== 'X') return;
    const key = `${x},${y}`;
    if (board[key]) return;

    board[key] = 'X';
    if (size === 5) expandBoard(x,y);

    const winner = checkWinner(board, size, size === 3 ? 3 : 5);
    if (winner) {
      statusEl.innerText = `${winner} wins!`;
      if (size === 3) {
        setTimeout(() => {
          for (const k of Object.keys(board)) delete board[k];
          currentTurn = 'X';
          statusEl.innerText = `Your turn: X`;
          renderBoard({ boardEl, size, getPreview, onCellClick });
        }, 700);
      }
      return;
    }

    currentTurn = 'O';
    statusEl.innerText = 'AI thinking...';
    renderBoard({ boardEl, size, getPreview, onCellClick });

    setTimeout(() => {
      aiMove();
    }, 200);
  }

  function aiMove() {
    // simple AI: first empty nearest to center / left-to-right
    if (size === 3) {
      for (let y = 0; y <= 2; y++) {
        for (let x = 0; x <= 2; x++) {
          const key = `${x},${y}`;
          if (!board[key]) {
            board[key] = 'O';
            const winner = checkWinner(board, size, 3);
            if (winner) statusEl.innerText = `${winner} wins!`;
            currentTurn = 'X';
            renderBoard({ boardEl, size, getPreview, onCellClick });
            return;
          }
        }
      }
    } else {
      // 5x5 infinite — search a bounding box around current min/max
      for (let y = -8; y <= 8; y++) {
        for (let x = -8; x <= 8; x++) {
          const key = `${x},${y}`;
          if (!board[key]) {
            board[key] = 'O';
            expandBoard(x,y);
            const winner = checkWinner(board, size, 5);
            if (winner) statusEl.innerText = `${winner} wins!`;
            currentTurn = 'X';
            renderBoard({ boardEl, size, getPreview, onCellClick });
            return;
          }
        }
      }
    }
  }

  renderBoard({ boardEl, size, getPreview, onCellClick });
  statusEl.innerText = 'Your turn: X';
}
