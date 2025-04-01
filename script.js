let cl = console.log;

// DOM Elements
const app = document.getElementById("app");
const player = document.getElementById("player");
const scoreWrapper = document.getElementById("score-wrapper");
const levelWrapper = document.getElementById("level-wrapper");
const gameOverMsg = document.getElementById("game-over-msg");
const livesWrapper = document.getElementById("lives-wrapper");

const blastAudio = new Audio("blast.wav");

// Game Variables
let score = 0;
let lvl = 1;
let lives = 3;
let targetSpeed = 1000;
let minSpeed = 500;
let game = true;

// ===== Game Setup =====
let targetInterval = setInterval(() => {
  createTarget();
}, targetSpeed);

// Player Controls
document.body.addEventListener("mousemove", (e) => {
  let mX = (e.clientX / window.innerWidth) * 100;
  player.style.left = `${mX}%`;
});

document.body.addEventListener("mousedown", () => {
  let playerX = player.offsetLeft;
  if (!game) return;
  if (game === true) {
    playBlast();
  }
  shootLaser(playerX - 32);
  shootLaser(playerX + 32);
});

// Laser Functions
function shootLaser(xPosition) {
  // Create and position laser element
  const laser = document.createElement("div");
  laser.className = "laser";
  laser.style.left = `${xPosition}px`;
  app.appendChild(laser);

  let shotTarget = false;

  // Check for collisions every 16ms
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

  // Remove laser after 1 second if no target hit
  setTimeout(() => {
    clearInterval(collisionCheck);
    if (!shotTarget && laser.parentNode) {
      app.removeChild(laser);
    }
  }, 1000);
}

function playBlast() {
  blastAudio.play();
}

// Score and Level Management
function increaseScore() {
  // Update score and check for level increase
  score += 10;
  scoreWrapper.innerHTML = score;
  if (score % 200 === 0) {
    increaseLvl();
  }
}

function increaseLvl() {
  // Increase level and adjust target spawn speed
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

// Target Management
function createTarget() {
  // Create target at random X position
  let randX = Math.floor(Math.random() * 100 + 1);
  const target = document.createElement("div");
  target.className = "target";
  target.style.left = `${randX}%`;
  app.appendChild(target);

  // Remove target after 3 seconds if not hit
  setTimeout(() => {
    if (target.parentNode) {
      app.removeChild(target);
      decreaseLives();
    }
  }, 3000);
}

function removeTarget(target, laser) {
  // Remove target with animation
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

// Collision Detection
function checkCollision(laser, targets) {
  // Check if laser intersects with any target
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

// Lives and Game Over
function decreaseLives() {
  // Reduce lives and check for game over
  lives -= 0.5;
  if (lives <= 0) {
    lives = 0;
    gameOver();
  }
  livesWrapper.innerHTML = `${lives.toFixed(1)}`;
}

function gameOver() {
  // End game and show game over message
  game = false;
  clearInterval(targetInterval);
  gameOverMsg.style.display = "flex";
}
