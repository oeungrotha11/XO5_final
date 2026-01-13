// game-core.js (browser)
export let board = {}; // "x,y" => "X" | "O"
export let minX = -5, maxX = 5, minY = -5, maxY = 5;
export let winCount = { X: 0, O: 0 };

export function expandBoard(x, y) {
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}


export function renderBoard({ boardEl, size=5, getPreview, onCellClick, minX=-5, maxX=5, minY=-5, maxY=5 }) {
  boardEl.innerHTML = '';

  const cols = size === 3 ? 3 : (maxX - minX + 1);
  boardEl.style.gridTemplateColumns = `repeat(${cols},40px)`;

  const yStart = size === 3 ? 0 : minY;
  const yEnd = size === 3 ? 2 : maxY;
  const xStart = size === 3 ? 0 : minX;
  const xEnd = size === 3 ? 2 : maxX;

  for (let y = yStart; y <= yEnd; y++) {
    for (let x = xStart; x <= xEnd; x++) {
      const key = `${x},${y}`;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      cell.innerText = board[key] || '';
      cell.dataset.preview = getPreview(x, y);

      if (board[key] === 'X') cell.style.color = 'red';
      if (board[key] === 'O') cell.style.color = 'blue';

      cell.onclick = () => onCellClick(x, y);

      boardEl.appendChild(cell);
    }
  }
}


export function checkWinner(boardObj, size, winLength = 5) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const key in boardObj) {
    const [x,y] = key.split(',').map(Number);
    const player = boardObj[key];
    for (const [dx,dy] of dirs) {
      let count = 1;
      for (let i = 1; i < winLength; i++) {
        const nx = x + dx*i, ny = y + dy*i;
        if (boardObj[`${nx},${ny}`] === player) count++;
        else break;
      }
      if (count >= winLength) {
        if (size === 5) winCount[player]++; // count multi-wins client-side for 5x5
        return player;
      }
    }
  }
  return null;
}
