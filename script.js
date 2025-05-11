const startBtn = document.getElementById("start-btn");
const resumeBtn = document.getElementById("resume-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const pauseScreen = document.querySelector(".pause-screen");
const pauseButton = document.querySelector(".pause-button");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");
const scoreDisplay = document.querySelector(".score-display");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const gravity = 0.5;
let score = 0;
let isPaused = false;
let isCheckpointCollisionDetectionActive = true;
let animationFrameId;

const stars = [];
const numStars = 200;
for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    speed: Math.random() * 0.2
  });
}

const planets = [
  { x: canvas.width * 0.8, y: canvas.height * 0.3, radius: 60, color: "#8a2be2" },
  { x: canvas.width * 0.2, y: canvas.height * 0.7, radius: 40, color: "#4b0082" }
];

const proportionalSize = (size) => {
  const baseHeight = 800;
  return innerHeight < baseHeight ? Math.ceil((size / baseHeight) * innerHeight) : size;
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  addParticle(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        size: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 5,
        speedY: (Math.random() - 0.5) * 5,
        color,
        life: 40
      });
    }
  }

  update() {
    this.particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.life--;
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  draw() {
    this.particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 40;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}

class Player {
  constructor() {
    this.position = {
      x: proportionalSize(100),
      y: canvas.height - proportionalSize(80),
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(40);
    this.jumping = false;
    this.onPlatform = false;
    this.jumpForce = -14;
    this.lastDirection = "right";
  }

  draw() {
    const gradient = ctx.createLinearGradient(
      this.position.x, this.position.y,
      this.position.x + this.width, this.position.y + this.height
    );
    gradient.addColorStop(0, "#1e90ff");
    gradient.addColorStop(1, "#00e5ff");
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 15;
    ctx.fillStyle = gradient;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.fillStyle = "#ffffff";
    const visorWidth = this.width * 0.6;
    const visorHeight = this.height * 0.15;
    const visorX = this.position.x + (this.width - visorWidth) / 2;
    const visorY = this.position.y + this.height * 0.2;
    ctx.fillRect(visorX, visorY, visorWidth, visorHeight);
    ctx.shadowBlur = 0;
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.velocity.x > 0) this.lastDirection = "right";
    else if (this.velocity.x < 0) this.lastDirection = "left";
    if (this.position.y + this.height + this.velocity.y < canvas.height) {
      this.velocity.y += gravity;
      this.onPlatform = false;
    } else {
      this.velocity.y = 0;
      this.position.y = canvas.height - this.height;
      this.jumping = false;
      this.onPlatform = true;
    }
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = gravity;
    }
  }

  jump() {
    if (this.onPlatform) {
      this.velocity.y = this.jumpForce;
      this.jumping = true;
      this.onPlatform = false;
      particleSystem.addParticle(
        this.position.x + this.width / 2,
        this.position.y + this.height,
        "#00e5ff"
      );
    }
  }
}

class Platform {
  constructor(x, y) {
    this.position = { x, y };
    this.width = 230;
    this.height = proportionalSize(25);
  }

  draw() {
    const gradient = ctx.createLinearGradient(
      this.position.x, this.position.y,
      this.position.x + this.width, this.position.y + this.height
    );
    gradient.addColorStop(0, "#39ff14");
    gradient.addColorStop(1, "#32cd32");
    ctx.shadowColor = "#39ff14";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    const radius = 10;
    ctx.moveTo(this.position.x + radius, this.position.y);
    ctx.lineTo(this.position.x + this.width - radius, this.position.y);
    ctx.quadraticCurveTo(this.position.x + this.width, this.position.y, this.position.x + this.width, this.position.y + radius);
    ctx.lineTo(this.position.x + this.width, this.position.y + this.height - radius);
    ctx.quadraticCurveTo(this.position.x + this.width, this.position.y + this.height, this.position.x + this.width - radius, this.position.y + this.height);
    ctx.lineTo(this.position.x + radius, this.position.y + this.height);
    ctx.quadraticCurveTo(this.position.x, this.position.y + this.height, this.position.x, this.position.y + this.height - radius);
    ctx.lineTo(this.position.x, this.position.y + radius);
    ctx.quadraticCurveTo(this.position.x, this.position.y, this.position.x + radius, this.position.y);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.position.x + 20, this.position.y + this.height / 2);
    ctx.lineTo(this.position.x + this.width - 20, this.position.y + this.height / 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

class CheckPoint {
  constructor(x, y, id) {
    this.position = { x, y };
    this.width = proportionalSize(45);
    this.height = proportionalSize(75);
    this.claimed = false;
    this.pulseSize = 0;
    this.pulseDirection = 1;
    this.id = id;
  }

  draw() {
    if (this.claimed && this.id > 0) {
        ctx.globalAlpha = 0.5;
    }
    this.pulseSize += 0.05 * this.pulseDirection;
    if (this.pulseSize > 1 || this.pulseSize < 0) this.pulseDirection *= -1;
    const gradient = ctx.createLinearGradient(
      this.position.x, this.position.y,
      this.position.x + this.width, this.position.y + this.height
    );
    gradient.addColorStop(0, "#FFD700");
    gradient.addColorStop(1, "#FFA500");
    ctx.shadowColor = this.claimed ? "#555555" : "#FFD700";
    ctx.shadowBlur = 15 + this.pulseSize * 10;
    ctx.beginPath();
    ctx.moveTo(this.position.x + this.width / 2, this.position.y);
    ctx.lineTo(this.position.x + this.width, this.position.y + this.height);
    ctx.lineTo(this.position.x, this.position.y + this.height);
    ctx.closePath();
    ctx.fillStyle = this.claimed ? "#AAAAAA" : gradient;
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        this.position.x + this.width / 2,
        this.position.y + this.height / 4 * (i + 1),
        (this.width / 4) * (1 + this.pulseSize * 0.3), 0, Math.PI * 2
      );
      ctx.strokeStyle = this.claimed ? "rgba(150,150,150,0.7)" : "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  claim() {
    if (this.claimed) return;
    particleSystem.addParticle(
      this.position.x + this.width / 2, this.position.y + this.height / 2, "#FFD700"
    );
    this.claimed = true;
    score += 1000;
    updateScore();
  }
}

class DataFragment {
  constructor(x, y) {
    this.position = { x, y };
    this.size = proportionalSize(22);
    this.collected = false;
    this.rotation = Math.random() * Math.PI * 2;
  }

  draw() {
    if (this.collected) return;
    this.rotation += 0.025;
    ctx.shadowColor = "#9d4edd";
    ctx.shadowBlur = 12;
    ctx.save();
    ctx.translate(this.position.x + this.size / 2, this.position.y + this.size / 2);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2); ctx.lineTo(this.size / 2, 0);
    ctx.lineTo(0, this.size / 2); ctx.lineTo(-this.size / 2, 0);
    ctx.closePath();
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size / 2);
    gradient.addColorStop(0, "#c77dff"); gradient.addColorStop(1, "#7209b7");
    ctx.fillStyle = gradient; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 4); ctx.lineTo(this.size / 4, 0);
    ctx.lineTo(0, this.size / 4); ctx.lineTo(-this.size / 4, 0);
    ctx.closePath(); ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  collect() {
    if (this.collected) return;
    this.collected = true; score += 100; updateScore();
    particleSystem.addParticle(
      this.position.x + this.size / 2, this.position.y + this.size / 2, "#9d4edd"
    );
  }
}

let player = new Player();
const particleSystem = new ParticleSystem();
let platforms = [];
let checkpoints = [];
let dataFragments = [];

const platformDefinitions = [
  { x: 250, yOffset: 180 },
  { x: 500, yOffset: 220 },
  { x: 750, yOffset: 260 },
  { x: 1000, yOffset: 300 },
  { x: 1250, yOffset: 340 },
  { x: 1480, yOffset: 300 },
  { x: 1700, yOffset: 360 },
  { x: 2000, yOffset: 320 },
  { x: 2300, yOffset: 350 },
  { x: 2600, yOffset: 380 },
  { x: 2900, yOffset: 420 },
  { x: 3200, yOffset: 460 },
  { x: 3500, yOffset: 500 },
  { x: 3800, yOffset: 540 },
  { x: 4100, yOffset: 520 },
  { x: 4400, yOffset: 560 },
  { x: 4700, yOffset: 580 },
  { x: 5000, yOffset: 600 }
];

const checkpointDefinitions = [
  { platformIndex: 6, xOffset: 0, yOffsetAbovePlatform: 85, id: 1 },
  { platformIndex: 13, xOffset: 0, yOffsetAbovePlatform: 85, id: 2 },
  { platformIndex: 17, xOffset: 0, yOffsetAbovePlatform: 85, id: 3 }
];

const keys = {
  rightKey: { pressed: false }, leftKey: { pressed: false },
};

const drawBackground = () => {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, "#0a0a23"); bgGradient.addColorStop(0.7, "#1a1a4a");
  bgGradient.addColorStop(1, "#2a2a6a"); ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  planets.forEach(planet => {
    const planetGradient = ctx.createRadialGradient(
      planet.x, planet.y, 0, planet.x, planet.y, planet.radius
    );
    const brightColor = planet.color.replace(')', ', 1)').replace('rgb', 'rgba');
    const darkEdge = planet.color.replace(')', ', 0.2)').replace('rgb', 'rgba');
    planetGradient.addColorStop(0, brightColor); planetGradient.addColorStop(0.8, planet.color);
    planetGradient.addColorStop(1, darkEdge);
    ctx.beginPath(); ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = planetGradient; ctx.fill();
    ctx.beginPath(); ctx.ellipse(
      planet.x, planet.y, planet.radius * 1.5, planet.radius * 0.4,
      Math.PI / 6, 0, Math.PI * 2
    );
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 4; ctx.stroke();
  });
  stars.forEach(star => {
    ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.5+0.5})`; ctx.fill();
  });
};

const gameSpeed = 5;

const animate = () => {
  if (isPaused) return;
  animationFrameId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  platforms.forEach(platform => platform.draw());
  checkpoints.forEach(checkpoint => checkpoint.draw());
  dataFragments.forEach(fragment => fragment.draw());
  particleSystem.update(); particleSystem.draw();
  player.update();
  const scrollBuffer = canvas.width * 0.4;
  let worldScrolledX = 0;
  if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
    if (player.position.x < canvas.width - scrollBuffer - player.width) {
      player.velocity.x = gameSpeed;
    } else {
      player.velocity.x = 0;
      worldScrolledX = -gameSpeed;
    }
  } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
    if (player.position.x > scrollBuffer) {
      player.velocity.x = -gameSpeed;
    } else {
      player.velocity.x = 0;
      worldScrolledX = gameSpeed;
    }
  } else {
    player.velocity.x = 0;
  }
  if (worldScrolledX !== 0) {
      platforms.forEach(p => p.position.x += worldScrolledX);
      checkpoints.forEach(c => c.position.x += worldScrolledX);
      dataFragments.forEach(d => d.position.x += worldScrolledX);
      planets.forEach(p => p.x += worldScrolledX * 0.1);
      stars.forEach(s => {
          s.x += worldScrolledX * (s.speed + 0.05);
          if (s.x < -s.radius) s.x = canvas.width + s.radius + Math.random() * 50;
          else if (s.x > canvas.width + s.radius) s.x = -s.radius - Math.random() * 50;
      });
  } else {
      stars.forEach(s => {
          s.x -= s.speed * 0.5;
          if (s.x < -s.radius) s.x = canvas.width + s.radius;
      });
  }
  let onAnyPlatformThisFrame = false;
  platforms.forEach(platform => {
    if (player.position.x + player.width > platform.position.x &&
        player.position.x < platform.position.x + platform.width) {
      if (player.velocity.y >= 0 &&
          player.position.y + player.height <= platform.position.y &&
          player.position.y + player.height + player.velocity.y >= platform.position.y) {
        player.velocity.y = 0;
        player.position.y = platform.position.y - player.height;
        player.jumping = false;
        player.onPlatform = true;
        onAnyPlatformThisFrame = true;
      }
      else if (player.velocity.y < 0 &&
               player.position.y >= platform.position.y + platform.height &&
               player.position.y + player.velocity.y <= platform.position.y + platform.height) {
        player.velocity.y = gravity;
        player.position.y = platform.position.y + platform.height;
      }
      else if (player.position.y + player.height > platform.position.y + 5 &&
               player.position.y < platform.position.y + platform.height - 5) {
        if (player.velocity.x > 0 && player.position.x + player.width - player.velocity.x <= platform.position.x) {
            player.position.x = platform.position.x - player.width; player.velocity.x = 0;
        } else if (player.velocity.x < 0 && player.position.x - player.velocity.x >= platform.position.x + platform.width) {
            player.position.x = platform.position.x + platform.width; player.velocity.x = 0;
        }
      }
    }
  });
  if (!onAnyPlatformThisFrame && (player.position.y + player.height < canvas.height)) {
    player.onPlatform = false;
  }
  let lastClaimedCheckpointId = 0;
  checkpoints.forEach(cp => { if (cp.claimed) lastClaimedCheckpointId = Math.max(lastClaimedCheckpointId, cp.id); });
  checkpoints.forEach((checkpoint) => {
    if (!checkpoint.claimed && isCheckpointCollisionDetectionActive) {
      const isNextCheckpoint = (checkpoint.id === lastClaimedCheckpointId + 1);
      if (isNextCheckpoint &&
          player.position.x < checkpoint.position.x + checkpoint.width &&
          player.position.x + player.width > checkpoint.position.x &&
          player.position.y < checkpoint.position.y + checkpoint.height &&
          player.position.y + player.height > checkpoint.position.y) {
        checkpoint.claim();
        const allClaimed = checkpoints.every(c => c.claimed);
        if (allClaimed) {
          isCheckpointCollisionDetectionActive = false;
          showCheckpointScreen("You've completed the mission!");
          keys.rightKey.pressed = false; keys.leftKey.pressed = false; player.velocity.x = 0;
        } else {
          showCheckpointScreen(`Checkpoint ${checkpoint.id} activated! Keep going!`);
        }
      }
    }
  });
  dataFragments.forEach((fragment, index) => {
    if (!fragment.collected &&
        player.position.x < fragment.position.x + fragment.size &&
        player.position.x + player.width > fragment.position.x &&
        player.position.y < fragment.position.y + fragment.size &&
        player.position.y + player.height > fragment.position.y) {
      fragment.collect();
    }
  });
};

const handleKeyDown = (event) => {
  if (!isCheckpointCollisionDetectionActive && !checkpoints.every(c => c.claimed)) return;
  if (isPaused && event.key !== "Escape" && event.key !== "p") return;
  switch (event.key.toLowerCase()) {
    case "arrowleft": case "a": keys.leftKey.pressed = true; break;
    case "arrowup": case "w": case " ": player.jump(); break;
    case "arrowright": case "d": keys.rightKey.pressed = true; break;
    case "escape": case "p": togglePause(); break;
  }
};

const handleKeyUp = (event) => {
  switch (event.key.toLowerCase()) {
    case "arrowleft": case "a": keys.leftKey.pressed = false; break;
    case "arrowright": case "d": keys.rightKey.pressed = false; break;
  }
};

const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  checkpointMessage.textContent = msg;
  if (isCheckpointCollisionDetectionActive || !checkpoints.every(c => c.claimed)) {
    setTimeout(() => {
      if (checkpointScreen.style.display === "block") checkpointScreen.style.display = "none";
    }, 2500);
  }
};

const updateScore = () => { scoreDisplay.textContent = `SCORE: ${score}`; };

const togglePause = () => {
  isPaused = !isPaused;
  if (isPaused) {
    cancelAnimationFrame(animationFrameId);
    pauseScreen.style.display = "flex";
    pauseButton.textContent = "Resume";
  } else {
    pauseScreen.style.display = "none";
    pauseButton.textContent = "Pause";
    animate();
  }
};

const initializeLevel = () => {
    platforms = platformDefinitions.map(def => new Platform(def.x, canvas.height - proportionalSize(def.yOffset)));
    checkpoints = checkpointDefinitions.map(def => {
        const platform = platforms[def.platformIndex];
        const xPos = platform.position.x + (platform.width / 2) - (proportionalSize(45) / 2) + def.xOffset;
        const yPos = platform.position.y - proportionalSize(def.yOffsetAbovePlatform) - proportionalSize(75);
        return new CheckPoint(xPos, yPos, def.id);
    });
    dataFragments = [];
    platforms.forEach((platform, index) => {
        if (index > 0) {
            for (let i = 0; i < (Math.random() < 0.6 ? 1 : 2); i++) {
                dataFragments.push(new DataFragment(
                    platform.position.x + (platform.width * 0.2) + (Math.random() * platform.width * 0.6),
                    platform.position.y - proportionalSize(30) - (Math.random() * proportionalSize(20))
                ));
            }
        }
    });
    planets[0].x = canvas.width * 0.8; planets[0].y = canvas.height * 0.3;
    planets[1].x = canvas.width * 0.2; planets[1].y = canvas.height * 0.7;
};

const resetGameState = () => {
    player = new Player();
    player.position = { x: proportionalSize(100), y: canvas.height - proportionalSize(80) };
    player.velocity = { x: 0, y: 0 };
    player.jumping = false;
    player.onPlatform = true;
    initializeLevel();
    score = 0; updateScore();
    isCheckpointCollisionDetectionActive = true;
    isPaused = false;
    keys.leftKey.pressed = false; keys.rightKey.pressed = false;
    startScreen.style.display = "none";
    pauseScreen.style.display = "none";
    checkpointScreen.style.display = "none";
    canvas.style.display = "block";
    scoreDisplay.style.display = "block";
    pauseButton.style.display = "block";
    pauseButton.textContent = "Pause";
};

const startGame = () => {
  resetGameState();
  animate();
};

startBtn.addEventListener("click", startGame);
resumeBtn.addEventListener("click", togglePause);
pauseButton.addEventListener("click", togglePause);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

window.addEventListener("resize", () => {
  const oldCanvasHeight = canvas.height;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const playerRelativeOffsetY = oldCanvasHeight - (player.position.y + player.height);
  player.position.y = canvas.height - playerRelativeOffsetY - player.height;
  player.position.y = Math.max(0, Math.min(player.position.y, canvas.height - player.height));
  initializeLevel();
  if (!isPaused) {
    drawBackground();
    platforms.forEach(p => p.draw());
    checkpoints.forEach(c => c.draw());
    dataFragments.forEach(d => d.draw());
    player.draw();
    particleSystem.draw();
  }
});

updateScore();
pauseButton.style.display = "none";
scoreDisplay.style.display = "none";
canvas.style.display = "none";