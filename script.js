const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake, food, score, speed, intervalId;
let soundEnabled = true;
let isPaused = false;

const eatSound = new Audio("eat.mp3");
const crashSound = new Audio("crash.mp3");
const fruitImg = new Image();
fruitImg.src = "fruit.png";

let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

setup();

function setup() {
  snake = new Snake();
  food = randomFood();
  score = 0;
  speed = 250; // Start slower
  isPaused = false;

  document.getElementById("score").innerText = score;
  document.getElementById("restartBtn").style.display = "none";

  if (intervalId) clearInterval(intervalId);
  intervalId = window.setInterval(gameLoop, speed);
}

function gameLoop() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  food.draw();
  snake.update();
  snake.draw();
  drawSpeed();

  if (snake.eat(food)) {
    food = randomFood();
    playSound(eatSound);
    score++;
    document.getElementById("score").innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById("highScore").innerText = highScore;
    }

    if (score % 10 === 0) {
      speed = Math.max(50, speed + 20);
      clearInterval(intervalId);
      intervalId = setInterval(gameLoop, speed);
    }
  }

  snake.checkCollision();
}

function drawSpeed() {
  ctx.font = "10px Arial";
  ctx.fillStyle = "#444";
  ctx.textAlign = "right";
  ctx.fillText(`Speed: ${speed}ms`, canvas.width - 2, 10);
}

function randomFood() {
  let f = new Food();
  f.pickLocation();
  return f;
}

function keyDown(evt) {
  const key = evt.key.toLowerCase();
  if (key === " ") {
    isPaused = !isPaused;
    if (!isPaused) intervalId = setInterval(gameLoop, speed);
    else clearInterval(intervalId);
    return;
  }

  switch (key) {
    case "arrowup": case "w":
      if (snake.ySpeed === 0 && snake.lastDirection !== "down") {
        snake.xSpeed = 0; snake.ySpeed = -1;
        snake.lastDirection = "up";
      }
      break;
    case "arrowdown": case "s":
      if (snake.ySpeed === 0 && snake.lastDirection !== "up") {
        snake.xSpeed = 0; snake.ySpeed = 1;
        snake.lastDirection = "down";
      }
      break;
    case "arrowleft": case "a":
      if (snake.xSpeed === 0 && snake.lastDirection !== "right") {
        snake.xSpeed = -1; snake.ySpeed = 0;
        snake.lastDirection = "left";
      }
      break;
    case "arrowright": case "d":
      if (snake.xSpeed === 0 && snake.lastDirection !== "left") {
        snake.xSpeed = 1; snake.ySpeed = 0;
        snake.lastDirection = "right";
      }
      break;
  }
}
document.addEventListener("keydown", keyDown);

let touchStartX = 0, touchStartY = 0;
canvas.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});
canvas.addEventListener("touchend", e => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && snake.lastDirection !== "left") {
      snake.xSpeed = 1; snake.ySpeed = 0; snake.lastDirection = "right";
    } else if (dx < 0 && snake.lastDirection !== "right") {
      snake.xSpeed = -1; snake.ySpeed = 0; snake.lastDirection = "left";
    }
  } else {
    if (dy > 0 && snake.lastDirection !== "up") {
      snake.ySpeed = 1; snake.xSpeed = 0; snake.lastDirection = "down";
    } else if (dy < 0 && snake.lastDirection !== "down") {
      snake.ySpeed = -1; snake.xSpeed = 0; snake.lastDirection = "up";
    }
  }
});

function Snake() {
  this.body = [
    { x: 5, y: 5 },
    { x: 4, y: 5 }
  ];
  this.xSpeed = 1;
  this.ySpeed = 0;
  this.lastDirection = "right";
  this.justAte = false;

  const headImg = new Image();
  headImg.src = "snake-head.png";
  const bodyImg = new Image();
  bodyImg.src = "snake-body.png";
  const tailImg = new Image();
  tailImg.src = "snaketail.png";

  this.draw = function () {
    this.body.forEach((segment, index) => {
      const x = segment.x * scale;
      const y = segment.y * scale;
      if (index === 0) {
        ctx.drawImage(headImg, x, y, scale, scale);
      } else if (index === this.body.length - 1) {
        const tail = this.body[this.body.length - 1];
        const beforeTail = this.body[this.body.length - 2];
        const dx = tail.x - beforeTail.x;
        const dy = tail.y - beforeTail.y;
        ctx.save();
        ctx.translate(x + scale / 2, y + scale / 2);
        if (dx === 1) ctx.rotate(Math.PI);
        else if (dx === -1) ctx.rotate(0);
        else if (dy === 1) ctx.rotate(-Math.PI / 2);
        else if (dy === -1) ctx.rotate(Math.PI / 2);
        ctx.drawImage(tailImg, -scale / 2, -scale / 2, scale, scale);
        ctx.restore();
      } else {
        ctx.drawImage(bodyImg, x, y, scale, scale);
      }
    });
  };

  this.update = function () {
    const head = { ...this.body[0] };
    head.x += this.xSpeed;
    head.y += this.ySpeed;
    this.body.unshift(head);

    if (!this.justAte) {
      this.body.pop();
    } else {
      this.justAte = false;
    }
  };

  this.eat = function (food) {
    const didEat = this.body[0].x === food.x && this.body[0].y === food.y;
    if (didEat) this.justAte = true;
    return didEat;
  };

  this.checkCollision = function () {
    const head = this.body[0];
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        playSound(crashSound);
        endGame();
        return;
      }
    }
    if (head.x < 0 || head.y < 0 || head.x >= columns || head.y >= rows) {
      playSound(crashSound);
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
    ctx.drawImage(fruitImg, this.x * scale, this.y * scale, scale, scale);
  };
}

function endGame() {
  clearInterval(intervalId);
  document.getElementById("restartBtn").style.display = "block";
}

function restartGame() {
  document.getElementById("restartBtn").style.display = "none";
  setup();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById("soundBtn").innerText = soundEnabled ? "🔊" : "🔇";
}

function playSound(sound) {
  if (soundEnabled) sound.play();
}
