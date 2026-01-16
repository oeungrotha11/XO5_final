// mode-ai.js
import { board, expandBoard, renderBoard, checkWinner, minX, maxX, minY, maxY } from './game-core.js';

export function startAI(boardEl, statusEl, size = 3) {
  // clear board
  for (const k of Object.keys(board)) delete board[k];

  let currentTurn = 'X';

  function getPreview(x, y) {
    return board[`${x},${y}`] ? '' : currentTurn;
  }

  function onCellClick(x, y) {
    if (currentTurn !== 'X') return;
    const key = `${x},${y}`;
    if (board[key]) return;

    board[key] = 'X';
    if (size === 5) expandBoard(x, y);

    const winner = checkWinner(board, size, size === 3 ? 3 : 5);
    if (winner) {
      statusEl.innerText = `${winner} wins!`;
      if (size === 3) {
        setTimeout(() => {
          for (const k of Object.keys(board)) delete board[k];
          currentTurn = 'X';
          statusEl.innerText = `Your turn: X`;
          renderBoard({ boardEl, size, getPreview, onCellClick, minX, maxX, minY, maxY });
        }, 700);
      }
      return;
    }

    currentTurn = 'O';
    statusEl.innerText = 'AI thinking...';
    renderBoard({ boardEl, size, getPreview, onCellClick, minX, maxX, minY, maxY });

    setTimeout(() => {
      aiMove();
    }, 200);
  }

  // ---- SMART AI ----
  function aiMove() {
    const sizeToWin = size === 3 ? 3 : 5;

    function tryMove(player) {
      const buffer = 1;
      const xMinSearch = size === 3 ? 0 : minX - buffer;
      const xMaxSearch = size === 3 ? 2 : maxX + buffer;
      const yMinSearch = size === 3 ? 0 : minY - buffer;
      const yMaxSearch = size === 3 ? 2 : maxY + buffer;

      for (let y = yMinSearch; y <= yMaxSearch; y++) {
        for (let x = xMinSearch; x <= xMaxSearch; x++) {
          const key = `${x},${y}`;
          if (!board[key]) {
            board[key] = player;
            if (checkWinner(board, size, sizeToWin) === player) {
              board[key] = null;
              return key;
            }
            board[key] = null;
          }
        }
      }
      return null;
    }

    // 1. Win if possible
    let move = tryMove('O');

    // 2. Block player if needed
    if (!move) move = tryMove('X');

    // 3. Take center if available (3x3)
    if (!move && size === 3 && !board['1,1']) move = '1,1';

    // 4. Take a corner (3x3)
    if (!move && size === 3) {
      const corners = ['0,0', '0,2', '2,0', '2,2'];
      for (const c of corners) {
        if (!board[c]) {
          move = c;
          break;
        }
      }
    }

    // 5. Fallback: first empty in visible board
    if (!move) {
      const xMinSearch = size === 3 ? 0 : minX - 1;
      const xMaxSearch = size === 3 ? 2 : maxX + 1;
      const yMinSearch = size === 3 ? 0 : minY - 1;
      const yMaxSearch = size === 3 ? 2 : maxY + 1;
      outer: for (let y = yMinSearch; y <= yMaxSearch; y++) {
        for (let x = xMinSearch; x <= xMaxSearch; x++) {
          const key = `${x},${y}`;
          if (!board[key]) {
            move = key;
            break outer;
          }
        }
      }
    }

    // Place AI move
    if (move) {
      const [x, y] = move.split(',').map(Number);
      board[move] = 'O';
      if (size === 5) expandBoard(x, y); // ensures move is visible

      const winner = checkWinner(board, size, sizeToWin);
      if (winner) statusEl.innerText = `${winner} wins!`;
      currentTurn = 'X';

      // Pass min/max so new move appears on board
      renderBoard({ boardEl, size, getPreview, onCellClick, minX, maxX, minY, maxY });
    }
  }

  // Initial render
  renderBoard({ boardEl, size, getPreview, onCellClick, minX, maxX, minY, maxY });
  statusEl.innerText = 'Your turn: X';
}
