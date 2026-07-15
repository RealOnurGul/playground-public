const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const bestElement = document.querySelector("#best");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlayTitle");
const overlayText = document.querySelector("#overlayText");
const pauseButton = document.querySelector("#pauseButton");
const controls = document.querySelectorAll("[data-direction]");

const boardSize = 21;
const tickMs = 115;
const storageKey = "snake-best-score";
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

let snake;
let food;
let direction;
let queuedDirection;
let score;
let best = Number(localStorage.getItem(storageKey) || 0);
let running = false;
let paused = false;
let timer = 0;
let touchStart = null;

bestElement.textContent = best;

function resetGame() {
  const middle = Math.floor(boardSize / 2);
  snake = [
    { x: middle, y: middle },
    { x: middle - 1, y: middle },
    { x: middle - 2, y: middle }
  ];
  direction = directions.right;
  queuedDirection = directions.right;
  score = 0;
  paused = false;
  scoreElement.textContent = score;
  pauseButton.textContent = "Pause";
  placeFood();
  draw();
}

function startGame() {
  resetGame();
  running = true;
  overlay.classList.add("hidden");
  clearInterval(timer);
  timer = setInterval(tick, tickMs);
}

function endGame() {
  running = false;
  clearInterval(timer);
  overlayTitle.textContent = "Game over";
  overlayText.textContent = "Tap to play again.";
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (!running) {
    startGame();
    return;
  }

  paused = !paused;
  pauseButton.textContent = paused ? "Resume" : "Pause";
  overlayTitle.textContent = "Paused";
  overlayText.textContent = "Tap resume or press Space.";
  overlay.classList.toggle("hidden", !paused);
}

function sameAxis(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function setDirection(next) {
  const nextDirection = directions[next];
  if (!nextDirection || sameAxis(nextDirection, direction)) return;
  queuedDirection = nextDirection;
}

function tick() {
  if (!running || paused) return;

  direction = queuedDirection;
  const head = snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y
  };

  const hitWall =
    nextHead.x < 0 || nextHead.x >= boardSize || nextHead.y < 0 || nextHead.y >= boardSize;
  const hitSelf = snake.some((part) => part.x === nextHead.x && part.y === nextHead.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(nextHead);

  if (nextHead.x === food.x && nextHead.y === food.y) {
    score += 1;
    scoreElement.textContent = score;
    if (score > best) {
      best = score;
      bestElement.textContent = best;
      localStorage.setItem(storageKey, String(best));
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize)
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function resizeCanvas() {
  const size = Math.floor(canvas.getBoundingClientRect().width);
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(size * scale);
  canvas.height = Math.floor(size * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
}

function draw() {
  const size = canvas.getBoundingClientRect().width;
  const cell = size / boardSize;

  context.fillStyle = "#0c120e";
  context.fillRect(0, 0, size, size);

  context.strokeStyle = "rgba(255, 255, 255, 0.035)";
  context.lineWidth = 1;
  for (let i = 1; i < boardSize; i += 1) {
    const line = i * cell;
    context.beginPath();
    context.moveTo(line, 0);
    context.lineTo(line, size);
    context.moveTo(0, line);
    context.lineTo(size, line);
    context.stroke();
  }

  drawCell(food.x, food.y, cell, "#ff6b5f");

  snake.forEach((part, index) => {
    drawCell(part.x, part.y, cell, index === 0 ? "#c6f68d" : "#82d173");
  });
}

function drawCell(x, y, cell, color) {
  const inset = Math.max(2, cell * 0.12);
  context.fillStyle = color;
  context.fillRect(x * cell + inset, y * cell + inset, cell - inset * 2, cell - inset * 2);
}

function directionFromSwipe(start, end) {
  const deltaX = end.clientX - start.clientX;
  const deltaY = end.clientY - start.clientY;

  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return null;
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? "right" : "left";
  return deltaY > 0 ? "down" : "up";
}

controls.forEach((button) => {
  button.addEventListener("pointerdown", () => {
    setDirection(button.dataset.direction);
  });
});

overlay.addEventListener("click", () => {
  if (paused) {
    togglePause();
    return;
  }
  startGame();
});

pauseButton.addEventListener("click", togglePause);

window.addEventListener("keydown", (event) => {
  const keyMap = {
    ArrowUp: "up",
    w: "up",
    ArrowDown: "down",
    s: "down",
    ArrowLeft: "left",
    a: "left",
    ArrowRight: "right",
    d: "right"
  };

  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  const next = keyMap[event.key];
  if (next) {
    event.preventDefault();
    setDirection(next);
  }
});

window.addEventListener("pointerdown", (event) => {
  touchStart = event;
});

window.addEventListener("pointerup", (event) => {
  if (!touchStart) return;
  const next = directionFromSwipe(touchStart, event);
  if (next) setDirection(next);
  touchStart = null;
});

window.addEventListener("resize", resizeCanvas);

resetGame();
resizeCanvas();
