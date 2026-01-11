export function renderBoard({
  boardEl,
  board,
  minX,
  maxX,
  minY,
  maxY,
  getPreview,
  onCellClick
}) {
  boardEl.innerHTML = '';
  const cols = maxX - minX + 1;
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      const key = `${x},${y}`;
      const mark = board[key] || '';

      cell.innerText = mark;
      cell.style.color =
        mark === 'X' ? 'red' :
        mark === 'O' ? 'blue' : '';

      cell.dataset.preview = getPreview(x, y);
      cell.onclick = () => onCellClick(x, y);

      boardEl.appendChild(cell);
    }
  }
}
