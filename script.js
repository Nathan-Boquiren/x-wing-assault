let cl = console.log;

// DOM Elements

const app = document.getElementById("app");
const player = document.getElementById("player");
const scoreWrapper = document.getElementById("score-wrapper");
const levelWrapper = document.getElementById("level-wrapper");
const gameOverMsg = document.getElementById("game-over-msg");
const livesWrapper = document.getElementById("lives-wrapper");

// Variables
let score = 0;
let lvl = 1;
let lives = 3;
let targetSpeed = 1000;
let minSpeed = 500;
let game = true;

// create players

let targetInterval = setInterval(() => {
  createTarget();
}, targetSpeed);

// Control player
document.body.addEventListener("mousemove", (e) => {
  let mX = (e.clientX / window.innerWidth) * 100;
  player.style.left = `${mX}%`;
});

// Shoot laser
document.body.addEventListener("mousedown", () => {
  let playerX = player.offsetLeft;
  if (game === true) {
    playBlast();
  }
  shootLaser(playerX - 32);
  shootLaser(playerX + 32);
});

function shootLaser(xPosition) {
  const laser = document.createElement("div");
  laser.className = "laser";
  laser.style.left = `${xPosition}px`;
  app.appendChild(laser);

  let shotTarget = false;

  let collisionCheck = setInterval(() => {
    let targets = document.querySelectorAll(".target");
    let collisionTarget = checkCollision(laser, targets);
    if (collisionTarget && collisionTarget.classList.contains("hit-2")) {
      removeTarget(collisionTarget, laser);
      shotTarget = true;
      increaseScore();
    } else if (
      collisionTarget &&
      !collisionTarget.classList.contains("hit-1")
    ) {
      clearInterval(collisionCheck);
      collisionTarget.classList.add("hit-1");
    } else if (
      collisionTarget &&
      collisionTarget.classList.contains("hit-1") &&
      !collisionTarget.classList.contains("hit-2")
    ) {
      clearInterval(collisionCheck);
      collisionTarget.classList.add("hit-2");
    }
  }, 16);

  setTimeout(() => {
    clearInterval(collisionCheck);
    if (!shotTarget) {
      app.removeChild(laser);
    }
  }, 1000);
}

function playBlast() {
  const blast = new Audio("blast.wav");
  blast.play();
}

function increaseScore() {
  score += 10;
  scoreWrapper.innerHTML = score;
  if (score % 200 === 0) {
    increaseLvl();
  }
}

function increaseLvl() {
  lvl++;
  targetSpeed -= 50;
  if (targetSpeed <= minSpeed) {
    targetSpeed = minSpeed;
  }
  cl(targetSpeed);
  clearInterval(targetInterval);
  targetInterval = setInterval(() => {
    createTarget();
  }, targetSpeed);
  levelWrapper.innerHTML = lvl < 10 ? `0${lvl}` : `${lvl}`;
}

function removeTarget(target, laser) {
  target.classList.add("blow-up");
  if (laser && laser.parentNode) {
    app.removeChild(laser);
  }
  setTimeout(() => {
    if (target && target.parentNode) {
      app.removeChild(target);
    }
  }, 600);
}

// Check collisions

function checkCollision(laser, targets) {
  let laserX = laser.offsetLeft;
  let laserY = laser.offsetTop;
  let laserHeight = laser.clientHeight;

  for (let target of targets) {
    let centerX = target.offsetLeft;
    let width = target.clientWidth;
    let diameter = width / 2;
    let targetY = target.offsetTop;
    let targetHeight = target.clientHeight;

    let xOverlap = laserX >= centerX - diameter && laserX <= centerX + diameter;

    let yOverlap =
      laserY <= targetY + targetHeight && laserY + laserHeight >= targetY;

    if (xOverlap && yOverlap) {
      return target;
    }
  }
  return;
}

// Create targets

function createTarget() {
  let randX = Math.floor(Math.random() * 100 + 1);
  const target = document.createElement("div");
  target.className = "target";
  target.style.left = `${randX}%`;
  app.appendChild(target);

  setTimeout(() => {
    if (target.parentNode) {
      app.removeChild(target);
      decreaseLives();
    }
  }, 3000);
}

function decreaseLives() {
  lives -= 0.5;
  if (lives <= 0) {
    lives = 0;
    gameOver();
  }
  livesWrapper.innerHTML = `${lives.toFixed(1)}`;
}

// Game over

function gameOver() {
  game = false;
  clearInterval(targetInterval);
  gameOverMsg.style.display = "flex";
}
