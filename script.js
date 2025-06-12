const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake;
let food;
let score = 0;

document.addEventListener("keydown", keyDown);

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

function randomFood() {
  let food = new Food();
  food.pickLocation();
  return food;
}

function keyDown(evt) {
  const direction = evt.key.replace("Arrow", "");
  snake.changeDirection(direction);
}

function Snake() {
  this.body = [{x: 5, y: 5}];
  this.xSpeed = 1;
  this.ySpeed = 0;

  this.draw = function() {
    ctx.fillStyle = "#00cc66";
    this.body.forEach(segment => {
      ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    });
  };

  this.update = function() {
    const head = {...this.body[0]};
    head.x += this.xSpeed;
    head.y += this.ySpeed;
    this.body.unshift(head);
    this.body.pop();
  };

  this.changeDirection = function(direction) {
    switch(direction) {
      case "Up": if (this.ySpeed === 0) { this.xSpeed = 0; this.ySpeed = -1; } break;
      case "Down": if (this.ySpeed === 0) { this.xSpeed = 0; this.ySpeed = 1; } break;
      case "Left": if (this.xSpeed === 0) { this.xSpeed = -1; this.ySpeed = 0; } break;
      case "Right": if (this.xSpeed === 0) { this.xSpeed = 1; this.ySpeed = 0; } break;
    }
  };

  this.eat = function(food) {
    return this.body[0].x === food.x && this.body[0].y === food.y;
  };

  this.checkCollision = function() {
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

function Food() {
  this.x;
  this.y;

  this.pickLocation = function() {
    this.x = Math.floor(Math.random() * columns);
    this.y = Math.floor(Math.random() * rows);
  };

  this.draw = function() {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
  };
}
