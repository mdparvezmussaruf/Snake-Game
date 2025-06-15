const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake;
let food;
let score = 0;

// === ENHANCEMENT: Rounded rectangle for snake segments ===
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
};

// === GAME SETUP ===
(function setup() {
  snake = new Snake();
  food = randomFood();
  window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    food.draw();
    snake.update();
    snake.draw();

    if (snake.eat(food)) {
      food = randomFood();
      score++;
      document.getElementById("score").innerText = score;
    }

    snake.checkCollision();
  }, 150);
})();

// === FOOD GENERATOR ===
function randomFood() {
  let food = new Food();
  food.pickLocation();
  return food;
}

// === INPUT CONTROL (ORIGINAL + ENHANCED) ===
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

// === SNAKE CLASS ===
function Snake() {
  this.body = [{ x: 5, y: 5 }];
  this.xSpeed = 1;
  this.ySpeed = 0;

  // ENHANCED DRAW METHOD
  this.draw = function () {
    ctx.fillStyle = "#43a047";
    ctx.strokeStyle = "#2e7d32";
    ctx.lineJoin = "round";
    ctx.lineWidth = 1;

    this.body.forEach(segment => {
      ctx.beginPath();
      ctx.roundRect(segment.x * scale, segment.y * scale, scale, scale, 5);
      ctx.fill();
      ctx.stroke();
    });
  };

  this.update = function () {
    const head = { ...this.body[0] };
    head.x += this.xSpeed;
    head.y += this.ySpeed;
    this.body.unshift(head);
    this.body.pop();
  };

  this.changeDirection = function (direction) {
    // Not used anymore, replaced by keyDown()
  };

  this.eat = function (food) {
    return this.body[0].x === food.x && this.body[0].y === food.y;
  };

  this.checkCollision = function () {
    const head = this.body[0];
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        alert("Game Over");
        document.location.reload();
      }
    }
    if (head.x < 0 || head.y < 0 || head.x >= columns || head.y >= rows) {
      alert("Game Over");
      document.location.reload();
    }
  };
}

// === FOOD CLASS ===
function Food() {
  this.x;
  this.y;

  this.pickLocation = function () {
    this.x = Math.floor(Math.random() * columns);
    this.y = Math.floor(Math.random() * rows);
  };

  // ENHANCED DRAW METHOD
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
    ctx.shadowBlur = 0; // reset
  };
}
