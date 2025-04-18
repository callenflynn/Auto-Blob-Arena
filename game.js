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
  damage: 1,
  attackSpeed: 1000,
  range: 100,
  gold: 0,
  upgradeCost: 5,
  rangeUpgradeCost: 10,
};

blob.attackSpeed = Math.max(blob.attackSpeed, 100); // Minimum 100ms
blob.gold = Math.max(blob.gold, 0); // Ensure gold is not negative

let enemies = [];
let bullets = []; // Track active bullets
let enemySpawnInterval = 2000;
let enemyDamage = 5;
let enemyHealth = 1; // Enemies start with 1 HP
let lastBulletTime = 0; // Track the last time a bullet was fired

// Save progress to localStorage
function saveProgress() {
  localStorage.setItem("blob", JSON.stringify(blob));
}

// Spawn enemies
function spawnEnemy() {
  const enemy = {
    x: Math.random() * (canvas.width - 30),
    y: Math.random() * (canvas.height / 2),
    width: 30,
    height: 30,
    hp: Math.floor(blob.damage / 2) + enemyHealth, // Scale enemy health based on player's damage
    speed: 1 + Math.random(),
  };
  enemies.push(enemy);
}

// Update enemies to move toward the blob
function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const dx = blob.x + blob.width / 2 - (enemy.x + enemy.width / 2);
    const dy = blob.y + blob.height / 2 - (enemy.y + enemy.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    enemy.x += (dx / distance) * enemy.speed;
    enemy.y += (dy / distance) * enemy.speed;

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
    const dx = blob.x + blob.width / 2 - (enemy.x + enemy.width / 2);
    const dy = blob.y + blob.height / 2 - (enemy.y + enemy.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= blob.range) {
      // Check if the enemy will die from this hit
      if (enemy.hp <= blob.damage) {
        const goldReward = Math.max(Math.floor(enemy.hp / 2), 0); // Ensure positive reward
        blob.gold += goldReward; // Gain gold
        validateGold(); // Ensure gold is valid
        enemies.splice(i, 1); // Remove the enemy
        i--;
      } else {
        enemy.hp -= blob.damage; // Reduce enemy health
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
    validateGold(); // Ensure gold is valid
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
    blob.range += 10; // Increase range by 10
    blob.rangeUpgradeCost = Math.ceil(blob.rangeUpgradeCost * 1.8); // Increase cost by 80%
    validateGold(); // Ensure gold is valid
    updateUpgradeButtons(); // Update button text
    saveProgress();
  } else {
    alert("Not enough gold!");
  }
}

// Update the text on upgrade buttons
function updateUpgradeButtons() {
  document.getElementById("attackCost").textContent = blob.upgradeCost;
  document.getElementById("upgradeAttackButton").disabled = blob.gold < blob.upgradeCost;

  document.getElementById("rangeCost").textContent = blob.rangeUpgradeCost;
  document.getElementById("upgradeRangeButton").disabled = blob.gold < blob.rangeUpgradeCost;
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
  document.getElementById("gold").textContent = blob.gold; // Update gold counter
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = "yellow";
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

// Reset game
function resetGame() {
  localStorage.clear();
  blob = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    hp: 100,
    maxHp: 100,
    damage: 1,
    attackSpeed: 1000,
    range: 50, // Default range set to a low value
    gold: 0,
    upgradeCost: 5, // Reset attack upgrade cost
    rangeUpgradeCost: 10, // Reset range upgrade cost
  };
  blob.attackSpeed = Math.max(blob.attackSpeed, 100); // Minimum 100ms
  blob.gold = Math.max(blob.gold, 0); // Ensure gold is not negative
  enemies = [];
  bullets = [];
  enemyHealth = 1;
  updateUpgradeButtons();
  saveProgress();
  alert("Game progress has been reset!");
}

// Passive gold generation
function generatePassiveGold() {
  blob.gold += 1;
  validateGold(); // Ensure gold is valid
  saveProgress();
}

// Increase enemy health over time
function increaseEnemyHealth() {
  enemyHealth += 1; // Increase enemy health by 1
}

// Fire a bullet
function fireBullet() {
  if (enemies.length === 0) return; // No enemies to shoot at

  // Find the nearest enemy
  let nearestEnemy = enemies[0];
  let minDistance = Infinity;
  for (const enemy of enemies) {
    const dx = blob.x + blob.width / 2 - (enemy.x + enemy.width / 2);
    const dy = blob.y + blob.height / 2 - (enemy.y + enemy.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      minDistance = distance;
      nearestEnemy = enemy;
    }
  }

  // Calculate direction to the nearest enemy
  const dx = nearestEnemy.x + nearestEnemy.width / 2 - (blob.x + blob.width / 2);
  const dy = nearestEnemy.y + nearestEnemy.height / 2 - (blob.y + blob.height / 2);
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  bullets.push({
    x: blob.x + blob.width / 2 - 5,
    y: blob.y + blob.height / 2 - 5,
    width: 10,
    height: 10,
    speedX: (dx / magnitude) * 5, // Normalize and scale speed
    speedY: (dy / magnitude) * 5,
  });
}

// Update bullets
function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].x += bullets[i].speedX;
    bullets[i].y += bullets[i].speedY;

    // Remove bullet if it goes off the screen
    if (
      bullets[i].x + bullets[i].width < 0 ||
      bullets[i].x > canvas.width ||
      bullets[i].y + bullets[i].height < 0 ||
      bullets[i].y > canvas.height
    ) {
      bullets.splice(i, 1);
      i--;
    }
  }
}

// Check bullet collisions with enemies
function checkBulletCollisions() {
  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      const bullet = bullets[i];
      const enemy = enemies[j];

      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        bullets.splice(i, 1); // Remove the bullet
        i--;

        // Check if the enemy will die from this hit
        if (enemy.hp <= blob.damage) {
          const goldReward = Math.max(Math.floor(enemy.hp / 2), 0); // Ensure positive reward
          blob.gold += goldReward; // Gain gold
          validateGold(); // Ensure gold is valid
          enemies.splice(j, 1); // Remove the enemy
          j--;
        } else {
          enemy.hp -= blob.damage; // Reduce enemy health
        }
        break;
      }
    }
  }
}

// Validate gold value
function validateGold() {
  if (blob.gold < 0) {
    blob.gold = 1; // Set gold to 1 if it goes below 0
  }
}

// Spawn enemies at intervals
setInterval(spawnEnemy, enemySpawnInterval);

// Generate passive gold every 5 seconds
setInterval(generatePassiveGold, 5000);

// Increase enemy health every 10 seconds
setInterval(increaseEnemyHealth, 10000);

// Periodically check and update button states
setInterval(updateUpgradeButtons, 2000); // Check every 2 seconds

// Call `updateUpgradeButtons` initially to set button text
updateUpgradeButtons();

// Game loop
function gameLoop(timestamp) {
  if (!lastBulletTime) lastBulletTime = timestamp;

  // Fire bullets based on attack speed
  if (timestamp - lastBulletTime >= blob.attackSpeed) {
    fireBullet();
    lastBulletTime = timestamp;
  }

  updateEnemies();
  updateBullets();
  checkBulletCollisions();
  attack();
  draw();
  drawBullets();
  updateUpgradeButtons(); // Ensure buttons are updated every frame
  saveProgress();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
