const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const statusEl = document.querySelector("#status");
const restartButton = document.querySelector("#restart");
const controls = document.querySelectorAll("[data-direction]");

const cellCount = 20;
const tickMs = 125;
const startSnake = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameOver;
let timer;

function resetGame() {
  snake = startSnake.map((part) => ({ ...part }));
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  gameOver = false;
  scoreEl.textContent = score;
  statusEl.textContent = "Use arrows, WASD, or the buttons.";
  placeFood();
  draw();
  clearInterval(timer);
  timer = setInterval(tick, tickMs);
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * cellCount),
      y: Math.floor(Math.random() * cellCount),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function tick() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.x >= cellCount || head.y < 0 || head.y >= cellCount;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function endGame() {
  gameOver = true;
  clearInterval(timer);
  statusEl.textContent = "Game over. Restart to play again.";
  draw();
}

function draw() {
  const size = canvas.width;
  const cell = size / cellCount;

  ctx.fillStyle = "#e7efe2";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "#d2dccb";
  ctx.lineWidth = 1;
  for (let i = 1; i < cellCount; i += 1) {
    const pos = i * cell;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }

  ctx.fillStyle = "#b73535";
  roundRect(food.x * cell + 4, food.y * cell + 4, cell - 8, cell - 8, 7);
  ctx.fill();

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#184f35" : "#2d7a52";
    roundRect(part.x * cell + 3, part.y * cell + 3, cell - 6, cell - 6, 6);
    ctx.fill();
  });

  if (gameOver) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#172015";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 36px system-ui, sans-serif";
    ctx.fillText("Game over", size / 2, size / 2);
  }
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function setDirection(name) {
  const vectors = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const requested = vectors[name];

  if (!requested || requested.x + direction.x === 0 && requested.y + direction.y === 0) {
    return;
  }

  nextDirection = requested;
}

document.addEventListener("keydown", (event) => {
  const keys = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };

  if (keys[event.key]) {
    event.preventDefault();
    setDirection(keys[event.key]);
  }
});

controls.forEach((button) => {
  button.addEventListener("click", () => setDirection(button.dataset.direction));
});

restartButton.addEventListener("click", resetGame);

resetGame();
