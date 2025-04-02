let cl = console.log;

// DOM Elements
const app = document.getElementById("app");
const player = document.getElementById("player");
const scoreWrapper = document.getElementById("score-wrapper");
const levelWrapper = document.getElementById("level-wrapper");
const gameOverMsg = document.getElementById("game-over-msg");
const livesWrapper = document.getElementById("lives-wrapper");

const crystalImgLink =
  "https://th.bing.com/th/id/R.113784945ed4c633718b388f6e5c031a?rik=U%2bkzDQItn8ebvQ&riu=http%3a%2f%2fpixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com%2fimage%2fddd7d19f316d09f.png&ehk=DO0MRdQahBFpCqr7dFu%2flWq7SZlrYxWIdkJtT7LfdsU%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1";

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
  const blastAudio = new Audio("blast.wav");
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
      decreaseLives(0.5);
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

// ===== Power Ups =====
function spawnPowerUp() {
  let randX = Math.floor(Math.random() * 100 + 1);
  const powerUp = document.createElement("div");
  powerUp.className = "power-up";
  powerUp.style.backgroundImage = `url(${crystalImgLink})`;
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

  const powerUpSound = new Audio("power-up.wav");
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

let powerUpInterval;
let firstPowerUp = false;

// Lives and Game Over
function decreaseLives(inc) {
  // Reduce lives and check for game over
  lives -= inc;
  if (lives < 2 && !firstPowerUp) {
    firstPowerUp = true;
    powerUpInterval = setInterval(() => {
      spawnPowerUp();
    }, 10000);
  } else if (lives >= 4) {
    clearInterval(powerUpInterval);
    firstPowerUp = false;
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
