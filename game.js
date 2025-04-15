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
  range: 100, // Default range to hit enemies before they reach the blob
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
      enemy.hp -= blob.damage; // Apply damage directly
      if (enemy.hp <= 0) {
        blob.gold += enemy.hp + blob.damage; // Add gold equal to enemy's starting health
        enemies.splice(i, 1); // Remove enemy from the array
        i--; // Adjust index after removal
      }
    }
  }
}

// Upgrade attack damage
function upgradeAttack() {
  if (blob.gold >= blob.upgradeCost) {
    blob.gold -= blob.upgradeCost;
    blob.damage += 1; // Increase damage by 1
    blob.upgradeCost = Math.ceil(blob.upgradeCost * 1.5); // Increase cost by 50%
    updateUpgradeButtons(); // Update button text
    saveProgress();
  } else {
    alert("Not enough gold!");
  }
}

// Upgrade attack range
function upgradeRange() {
  if (blob.gold >= blob.rangeUpgradeCost) {
    blob.gold -= blob.rangeUpgradeCost;
    blob.range += 20; // Increase range by 20
    blob.rangeUpgradeCost = Math.ceil(blob.rangeUpgradeCost * 1.8); // Increase cost by 80%
    updateUpgradeButtons(); // Update button text
    saveProgress();
  } else {
    alert("Not enough gold!");
  }
}

// Update the text on upgrade buttons
function updateUpgradeButtons() {
  // Update attack upgrade button
  document.getElementById("attackCost").textContent = blob.upgradeCost; // Update attack cost
  document.getElementById("upgradeAttackButton").disabled = blob.gold < blob.upgradeCost; // Disable if insufficient gold

  // Update range upgrade button
  document.getElementById("rangeCost").textContent = blob.rangeUpgradeCost; // Update range cost
  document.getElementById("upgradeRangeButton").disabled = blob.gold < blob.rangeUpgradeCost; // Disable if insufficient gold
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

  // Update button states
  updateUpgradeButtons();
}

// Reset game
function resetGame() {
  blob.hp = blob.maxHp;
  blob.gold = 0;
  blob.damage = 1; // Reset attack damage to 1
  blob.range = 100; // Reset range to default
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

// Call `updateUpgradeButtons` initially to set button text
updateUpgradeButtons();

// Start game loop
gameLoop();
