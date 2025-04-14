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
  damage: 1, // Default attack damage per second
  attackSpeed: 1000,
  range: 50, // Default attack range
  gold: 0,
  upgradeCost: 5, // Initial cost for upgrading attack
  rangeUpgradeCost: 10, // Initial cost for upgrading range
};

let enemies = [];
let enemySpawnInterval = 2000;
let enemyDamage = 5;
let enemyHealth = 1; // Enemies start with 1 HP

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
    hp: enemyHealth, // Enemies' health increases over time
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

// Blob attacks enemies within range
function attack() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];

    // Calculate distance to enemy
    const dx = blob.x + blob.width / 2 - (enemy.x + enemy.width / 2);
    const dy = blob.y + blob.height / 2 - (enemy.y + enemy.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if enemy is within range
    if (distance <= blob.range) {
      enemy.hp -= blob.damage / (1000 / blob.attackSpeed); // Damage per second
      if (enemy.hp <= 0) {
        blob.gold += enemyHealth; // Gain gold equal to enemy's health
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

// Upgrade attack range
function upgradeRange() {
  if (blob.gold >= blob.rangeUpgradeCost) {
    blob.gold -= blob.rangeUpgradeCost;
    blob.range += 20; // Increase range by 20
    blob.rangeUpgradeCost = Math.ceil(blob.rangeUpgradeCost * 1.8); // Increase cost by 80%
    saveProgress();
  } else {
    alert("Not enough gold!");
  }
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
  blob.range = 50; // Reset range to default
  blob.attackSpeed = 1000;
  blob.upgradeCost = 5; // Reset upgrade cost
  blob.rangeUpgradeCost = 10; // Reset range upgrade cost
  enemies = [];
  enemyHealth = 1; // Reset enemy health
  saveProgress(); // Save reset state
}

// Passive gold generation
function generatePassiveGold() {
  blob.gold += 1;
  saveProgress();
}

// Increase enemy health over time
function increaseEnemyHealth() {
  enemyHealth += 1; // Increase enemy health by 1
}

// Spawn enemies at intervals
setInterval(spawnEnemy, enemySpawnInterval);

// Generate passive gold every 5 seconds
setInterval(generatePassiveGold, 5000);

// Increase enemy health every 10 seconds
setInterval(increaseEnemyHealth, 10000);

// Start game loop
gameLoop();
