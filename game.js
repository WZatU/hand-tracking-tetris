const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = Math.floor(gameCanvas.width / COLS);
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const SHAPES = {
  I: [
    [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ],
    [
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
      [0,1,0,0],
    ]
  ],
  J: [
    [
      [1,0,0],
      [1,1,1],
      [0,0,0],
    ],
    [
      [0,1,1],
      [0,1,0],
      [0,1,0],
    ],
    [
      [0,0,0],
      [1,1,1],
      [0,0,1],
    ],
    [
      [0,1,0],
      [0,1,0],
      [1,1,0],
    ]
  ],
  L: [
    [
      [0,0,1],
      [1,1,1],
      [0,0,0],
    ],
    [
      [0,1,0],
      [0,1,0],
      [0,1,1],
    ],
    [
      [0,0,0],
      [1,1,1],
      [1,0,0],
    ],
    [
      [1,1,0],
      [0,1,0],
      [0,1,0],
    ]
  ],
  O: [
    [
      [1,1],
      [1,1],
    ]
  ],
  S: [
    [
      [0,1,1],
      [1,1,0],
      [0,0,0],
    ],
    [
      [0,1,0],
      [0,1,1],
      [0,0,1],
    ]
  ],
  T: [
    [
      [0,1,0],
      [1,1,1],
      [0,0,0],
    ],
    [
      [0,1,0],
      [0,1,1],
      [0,1,0],
    ],
    [
      [0,0,0],
      [1,1,1],
      [0,1,0],
    ],
    [
      [0,1,0],
      [1,1,0],
      [0,1,0],
    ]
  ],
  Z: [
    [
      [1,1,0],
      [0,1,1],
      [0,0,0],
    ],
    [
      [0,0,1],
      [0,1,1],
      [0,1,0],
    ]
  ],
};

const COLORS = {
  I: '#00f0f0',
  J: '#0000f0',
  L: '#f0a000',
  O: '#f0f000',
  S: '#00f000',
  T: '#a000f0',
  Z: '#f00000'
};

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return {
    type,
    rotation: 0,
    x: Math.floor((COLS - SHAPES[type][0][0].length) / 2),
    y: 0,
  };
}

let current = randomPiece();

function getMatrix(piece) {
  return SHAPES[piece.type][piece.rotation];
}

function rotatePiece() {
  const oldRot = current.rotation;
  current.rotation = (current.rotation + 1) % SHAPES[current.type].length;
  if (collide(current)) {
    current.rotation = oldRot;
  }
}

function collide(piece) {
  const matrix = getMatrix(piece);
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const x = piece.x + col;
        const y = piece.y + row;
        if (x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x])) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(piece) {
  const matrix = getMatrix(piece);
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const x = piece.x + col;
        const y = piece.y + row;
        if (y >= 0) {
          board[y][x] = piece.type;
        }
      }
    }
  }
}

function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      y++;
    }
  }
}

function drop() {
  current.y++;
  if (collide(current)) {
    current.y--;
    merge(current);
    clearLines();
    current = randomPiece();
    if (collide(current)) {
      board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
  }
}

function movePiece(dir) {
  current.x += dir;
  if (collide(current)) {
    current.x -= dir;
  }
}

function hardDrop() {
  while (!collide(current)) {
    current.y++;
  }
  current.y--;
  merge(current);
  clearLines();
  current = randomPiece();
}

function drawCell(x, y, type) {
  gameCtx.fillStyle = COLORS[type] || '#222';
  gameCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function draw() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  // draw board
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const type = board[y][x];
      if (type) {
        drawCell(x, y, type);
      }
    }
  }
  // draw current piece
  const matrix = getMatrix(current);
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const x = current.x + col;
        const y = current.y + row;
        drawCell(x, y, current.type);
      }
    }
  }
}

setInterval(() => {
  drop();
  draw();
}, 800);

function gameInput(action) {
  switch (action) {
    case 'MOVE_LEFT':
      movePiece(-1);
      break;
    case 'MOVE_RIGHT':
      movePiece(1);
      break;
    case 'ROTATE':
      rotatePiece();
      break;
    case 'DROP':
      hardDrop();
      break;
  }
}

window.gameInput = gameInput;
