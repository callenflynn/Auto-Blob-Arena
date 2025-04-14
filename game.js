const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Load saved data or initialize blob
let blob = JSON.parse(localStorage.getItem("blob")) || {
  x: canvas.width / 2 - 15,
  y: canvas.height - 50,
  width: 30,
  height: 30,
  hp: 100,
  maxHp: 100,
  damage: 1, // Default attack damage set to 1
  attackSpeed: 1000,
  gold: 0,
};

let enemies = [];
let enemySpawnInterval = 2000;
let enemyDamage = 5;

// Save progress to localStorage
function saveProgress() {
  localStorage.setItem("blob", JSON.stringify(blob));
}

// Spawn enemies
function spawnEnemy() {
  const enemy = {
    x: Math.random() * (canvas.width - 30),
    y: Math.random() * (canvas.height / 2), // Spawn enemies in the top half of the canvas
    width: 30,
    height: 30,
    hp: 30,
    speed: 1 + Math.random(), // Random speed for enemies
  };
  enemies.push(enemy);
}

// Update enemies to move toward the blob
function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];

    // Calculate direction toward the blob
    const dx = blob.x + blob.width / 2 - (enemy.x + enemy.width / 2);
    const dy = blob.y + blob.height / 2 - (enemy.y + enemy.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize direction and move enemy
    enemy.x += (dx / distance) * enemy.speed;
    enemy.y += (dy / distance) * enemy.speed;

    // Check if enemy collides with the blob
    if (collision(blob, enemy)) {
      blob.hp -= enemyDamage;
      enemies.splice(i, 1);
      i--;
      if (blob.hp <= 0) {
        alert("Game Over!");
        resetGame();
      }
    }
  }
}

// Collision detection
function collision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Blob attacks enemies
function attack() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (collision(blob, enemy)) {
      enemy.hp -= blob.damage;
      if (enemy.hp <= 0) {
        blob.gold += 10;
        enemies.splice(i, 1);
        i--;
      }
    }
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blob
  ctx.fillStyle = "blue";
  ctx.fillRect(blob.x, blob.y, blob.width, blob.height);

  // Draw enemies
  ctx.fillStyle = "red";
  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }

  // Update UI
  document.getElementById("hp").textContent = blob.hp;
  document.getElementById("gold").textContent = blob.gold;
}

// Game loop
function gameLoop() {
  updateEnemies();
  attack();
  draw();
  saveProgress(); // Save progress every frame
  requestAnimationFrame(gameLoop);
}

// Reset game
function resetGame() {
  blob.hp = blob.maxHp;
  blob.gold = 0;
  blob.damage = 1; // Reset attack damage to 1
  blob.attackSpeed = 1000;
  enemies = [];
  saveProgress(); // Save reset state
}

// Upgrade attack
function upgradeAttack() {
  if (blob.gold >= 20) {
    blob.gold -= 20;
    blob.damage += 1;
    saveProgress();
  } else {
    alert("Not enough gold!");
  }
}

// Passive gold generation
function generatePassiveGold() {
  blob.gold += 1;
  saveProgress();
}

// Spawn enemies at intervals
setInterval(spawnEnemy, enemySpawnInterval);

// Generate passive gold every 5 seconds
setInterval(generatePassiveGold, 5000);

// Start game loop
gameLoop();
