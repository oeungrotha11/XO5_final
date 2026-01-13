// server-utils.js
function checkWinner(board, winLength = 5) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const key in board) {
    const [x, y] = key.split(',').map(Number);
    const player = board[key];
    for (const [dx, dy] of dirs) {
      let count = 1;
      for (let i = 1; i < winLength; i++) {
        const nx = x + dx * i, ny = y + dy * i;
        if (board[`${nx},${ny}`] === player) count++;
        else break;
      }
      if (count >= winLength) return player;
    }
  }
  return null;
}

module.exports = { checkWinner };
