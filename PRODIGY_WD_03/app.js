// Tic-Tac-Toe game logic with optional AI (Minimax)
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modeInputs = document.querySelectorAll('input[name="mode"]');
const firstSelect = document.getElementById('firstPlayer');

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let mode = 'pvp';

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function render() {
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach((cell, idx) => {
    cell.textContent = board[idx];
    cell.classList.toggle('disabled', board[idx] || !gameActive);
  });
  if (!gameActive) return;
  statusEl.textContent = `Turn: ${currentPlayer}`;
}

function checkWin(bd, player) {
  return wins.some(line => line.every(i => bd[i] === player));
}

function isDraw(bd) {
  return bd.every(cell => cell !== '');
}

function handleCellClick(e) {
  const idx = Number(e.target.dataset.index);
  if (!gameActive || board[idx]) return;

  if (mode === 'pvc' && currentPlayer === aiPlayer) return; // ignore clicks when AI's turn

  board[idx] = currentPlayer;
  afterMove();
}

function afterMove() {
  if (checkWin(board, currentPlayer)) {
    gameActive = false;
    statusEl.textContent = `${currentPlayer} wins!`;
    highlightWin(currentPlayer);
    render();
    return;
  }
  if (isDraw(board)) {
    gameActive = false;
    statusEl.textContent = `Draw`;
    render();
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  render();

  if (mode === 'pvc' && currentPlayer === aiPlayer) {
    // small delay for UX
    setTimeout(() => aiMove(), 200);
  }
}

function highlightWin(player) {
  const cells = boardEl.querySelectorAll('.cell');
  const line = wins.find(l => l.every(i => board[i] === player));
  if (line) line.forEach(i => cells[i].classList.add('win'));
}

// --- AI (Minimax) ---
let huPlayer = 'X';
let aiPlayer = 'O';

function aiMove() {
  const best = minimax(board.slice(), aiPlayer);
  if (best.index !== undefined) {
    board[best.index] = aiPlayer;
    afterMove();
  }
}

function minimax(newBoard, player) {
  if (checkWin(newBoard, huPlayer)) return {score: -10};
  if (checkWin(newBoard, aiPlayer)) return {score: 10};
  if (isDraw(newBoard)) return {score: 0};

  const avail = newBoard.map((v,i)=> v === '' ? i : null).filter(v=>v!==null);
  const moves = [];

  for (let i of avail) {
    const move = {};
    move.index = i;
    newBoard[i] = player;

    if (player === aiPlayer) {
      const result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      const result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[i] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    // maximize
    let bestScore = -Infinity;
    for (const m of moves) if (m.score > bestScore) {bestScore = m.score; bestMove = m;}
  } else {
    // minimize
    let bestScore = Infinity;
    for (const m of moves) if (m.score < bestScore) {bestScore = m.score; bestMove = m;}
  }

  return bestMove;
}

// --- Controls ---
function resetGame() {
  board = Array(9).fill('');
  document.querySelectorAll('.cell').forEach(c => c.classList.remove('win'));
  gameActive = true;
  mode = document.querySelector('input[name="mode"]:checked').value;
  currentPlayer = firstSelect.value || 'X';
  huPlayer = currentPlayer === 'X' ? 'X' : 'O';
  aiPlayer = huPlayer === 'X' ? 'O' : 'X';
  render();
  if (mode === 'pvc' && currentPlayer === aiPlayer) {
    setTimeout(() => aiMove(), 200);
  }
}

// attach listeners
boardEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('cell')) return;
  handleCellClick(e);
});

restartBtn.addEventListener('click', resetGame);
modeInputs.forEach(m => m.addEventListener('change', resetGame));
firstSelect.addEventListener('change', resetGame);

// initial render and wire cells
function init() {
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach(c => c.textContent = '');
  resetGame();
}

init();
