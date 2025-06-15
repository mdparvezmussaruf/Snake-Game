const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake;
let food;
let score = 0;
let speed = 150;
let intervalId;

// Load sounds
const eatSound = new Audio("eat.mp3");
const crashSound = new Audio("crash.mp3");

// Rounded rectangle polyfill
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
};

// Start Game
function setup() {
  snake = new Snake();
  food = randomFood();
  score = 0;
  speed = 150;
  document.getElementById("score").innerText = score;

  if (intervalId) clearInterval(intervalId);
  intervalId = window.setInterval(gameLoop, speed);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  food.draw();
  snake.update();
  snake.draw();

  if (snake.eat(food)) {
    food = randomFood();
    eatSound.play();
    score++;
    document.getElementById("score").innerText = score;

    // Increase speed every 5 points
    if (score % 5 === 0 && speed > 50) {
      speed -= 10;
      clearInterval(intervalId);
      intervalId = setInterval(gameLoop, speed);
    }
  }

  snake.checkCollision();
}

function randomFood() {
  let food = new Food();
  food.pickLocation();
  return food;
}

document.addEventListener("keydown", keyDown);
function keyDown(evt) {
  const key = evt.key.toLowerCase();
  switch (key) {
    case "arrowup":
    case "w":
      if (snake.ySpeed === 0) { snake.xSpeed = 0; snake.ySpeed = -1; }
      break;
    case "arrowdown":
    case "s":
      if (snake.ySpeed === 0) { snake.xSpeed = 0; snake.ySpeed = 1; }
      break;
    case "arrowleft":
    case "a":
      if (snake.xSpeed === 0) { snake.xSpeed = -1; snake.ySpeed = 0; }
      break;
    case "arrowright":
    case "d":
      if (snake.xSpeed === 0) { snake.xSpeed = 1; snake.ySpeed = 0; }
      break;
  }
}

// Touch screen support
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", function(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", function(e) {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && snake.xSpeed === 0) {
      snake.xSpeed = 1; snake.ySpeed = 0;
    } else if (dx < 0 && snake.xSpeed === 0) {
      snake.xSpeed = -1; snake.ySpeed = 0;
    }
  } else {
    if (dy > 0 && snake.ySpeed === 0) {
      snake.ySpeed = 1; snake.xSpeed = 0;
    } else if (dy < 0 && snake.ySpeed === 0) {
      snake.ySpeed = -1; snake.xSpeed = 0;
    }
  }
});

function Snake() {
  this.body = [{ x: 5, y: 5 }];
  this.xSpeed = 1;
  this.ySpeed = 0;

 // Load snake images
const headImg = new Image();
headImg.src = "snake-head.png";
const bodyImg = new Image();
bodyImg.src = "snake-body.png";

this.draw = function () {
  this.body.forEach((segment, index) => {
    const x = segment.x * scale;
    const y = segment.y * scale;

    if (index === 0) {
      // Draw head
      ctx.drawImage(headImg, x, y, scale, scale);
    } else {
      // Draw body
      ctx.drawImage(bodyImg, x, y, scale, scale);
    }
  });
};

  this.update = function () {
    const head = { ...this.body[0] };
    head.x += this.xSpeed;
    head.y += this.ySpeed;
    this.body.unshift(head);
    this.body.pop();
  };

  this.eat = function (food) {
    return this.body[0].x === food.x && this.body[0].y === food.y;
  };

  this.checkCollision = function () {
    const head = this.body[0];
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        crashSound.play();
        endGame();
        return;
      }
    }
    if (head.x < 0 || head.y < 0 || head.x >= columns || head.y >= rows) {
      crashSound.play();
      endGame();
    }
  };
}

function Food() {
  this.x;
  this.y;

  this.pickLocation = function () {
    this.x = Math.floor(Math.random() * columns);
    this.y = Math.floor(Math.random() * rows);
  };

  this.draw = function () {
    const x = this.x * scale + scale / 2;
    const y = this.y * scale + scale / 2;
    const radius = scale / 2.5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = "#e53935";
    ctx.shadowColor = "#ef5350";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  };
}

function endGame() {
  clearInterval(intervalId);
  document.getElementById("gameOverScreen").style.display = "block";
}

function restartGame() {
  document.getElementById("gameOverScreen").style.display = "none";
  setup();
}

// Start the game
setup();
