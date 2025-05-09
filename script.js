let cl = console.log;

// DOM Elements
const app = document.getElementById("app");
const player = document.getElementById("player");
const scoreWrapper = document.getElementById("score-wrapper");
const levelWrapper = document.getElementById("level-wrapper");
const gameOverMsg = document.getElementById("game-over-msg");
const livesWrapper = document.getElementById("lives-wrapper");

// Element dimensions

const playerWidth = player.clientWidth;

// Game Variables
let score = 0;
let lvl = 1;
let lives = 3;
let targetSpeed = 1000;
let minSpeed = 500;
let game = true;
let powerUpInterval;
let powerUpInUse = false;

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
  shootLaser(playerX - playerWidth / 2 + 15);
  shootLaser(playerX + playerWidth / 2 - 15);
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
  const blastAudio = new Audio("sfx/blast.wav");
  blastAudio.play();
}

// Increase Score
function increaseScore() {
  score += 10;
  scoreWrapper.innerHTML = score;
  if (score % 200 === 0) {
    increaseLvl();
  }
}

// Increase Level
function increaseLvl() {
  lvl++;
  targetSpeed -= 50;
  if (targetSpeed <= minSpeed) {
    targetSpeed = minSpeed;
  }

  if (lvl === 5) {
    app.classList.add("round-5");
  } else if (lvl === 10) {
    app.classList.remove("round-5");
    app.classList.add("round-10");
  }

  clearInterval(targetInterval);
  targetInterval = setInterval(() => {
    createTarget();
  }, targetSpeed);
  levelWrapper.innerHTML = lvl < 10 ? `0${lvl}` : `${lvl}`;
}

// Target Management
function createTarget() {
  let randX = Math.floor(
    Math.random() * (window.innerWidth + 1 - player.clientWidth * 2)
  );
  randX += player.clientWidth;
  const target = document.createElement("div");
  target.className = "target";
  target.style.left = `${randX}px`;
  app.appendChild(target);

  setTimeout(() => {
    if (target.parentNode) {
      app.removeChild(target);
      decreaseLives(0.5);
    }
  }, 3000);
}

function removeTarget(target, laser) {
  target.classList.add("blow-up");

  playExplodeAudio();

  if (laser && laser.parentNode) {
    app.removeChild(laser);
  }
  setTimeout(() => {
    if (target && target.parentNode) {
      app.removeChild(target);
    }
  }, 600);
}

function playExplodeAudio() {
  const sfx = new Audio("sfx/explode-1.wav");
  sfx.volume = 0.4;
  sfx.play();
}

// Collision Detection
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

// Power Ups
function spawnPowerUp() {
  let randX = Math.floor(Math.random() * 100 + 1);
  const powerUp = document.createElement("div");
  powerUp.className = "power-up";
  powerUp.style.left = `${randX}%`;
  app.appendChild(powerUp);

  let trackPowerUp = setInterval(() => {
    let powerUpCollision = checkPowerUpCollision(powerUp);
    if (powerUpCollision) {
      clearInterval(trackPowerUp);
      usePowerUp();
    }
  }, 16);

  // Remove power up after 2 seconds if not hit
  setTimeout(() => {
    if (powerUp.parentNode) {
      clearInterval(trackPowerUp);
      app.removeChild(powerUp);
    }
  }, 2000);
}

function usePowerUp() {
  player.classList.add("powered-up");
  livesWrapper.classList.add("powered-up");
  setTimeout(() => {
    player.classList.remove("powered-up");
    livesWrapper.classList.remove("powered-up");
  }, 500);
  decreaseLives(-2);

  // play audio sfx
  const powerUpSound = new Audio("sfx/power-up.wav");
  powerUpSound.play();
}

function checkPowerUpCollision(powerUp) {
  let aligned = false;

  let powerUpX = powerUp.offsetLeft;
  let powerUpY = powerUp.offsetTop;
  let playerX = player.offsetLeft;
  let playerY = player.offsetTop;
  let playerHalfWidth = player.clientWidth / 2;
  let playerHalfHeight = player.clientHeight / 2;

  let xAligned =
    powerUpX >= playerX - playerHalfWidth &&
    powerUpX <= playerX + playerHalfWidth;

  let yAligned = powerUpY >= playerY - playerHalfHeight;

  if (xAligned && yAligned) {
    aligned = true;
  }

  return aligned;
}

// Lives and Game Over
function decreaseLives(inc) {
  lives -= inc;
  if (lives < 2.5 && !powerUpInUse) {
    powerUpInUse = true;
    powerUpInterval = setInterval(() => {
      spawnPowerUp();
    }, 10000);
  } else if (lives >= 4) {
    clearInterval(powerUpInterval);
    powerUpInUse = false;
  } else if (lives <= 0) {
    lives = 0;
    gameOver();
  }
  livesWrapper.innerHTML = `${lives.toFixed(1)}`;
}

function gameOver() {
  game = false;
  clearInterval(powerUpInterval);
  clearInterval(targetInterval);
  gameOverMsg.style.display = "flex";
}
