const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;

// Load saved data or initialize blob
let blob = JSON.parse(localStorage.getItem('blob')) || {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    hp: 100,
    maxHp: 100,
    damage: 10,
    attackSpeed: 1000,
    gold: 0,
};

let enemies = [];
let enemySpawnInterval = 2000;
let enemyDamage = 5;
let isAttacking = false;

function saveProgress() {
    localStorage.setItem('blob', JSON.stringify(blob));
}

function spawnEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30,
        hp: 30,
        maxHp: 30,
    };
    enemies.push(enemy);
}

function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += 2; // Move enemies down
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        } else if (collision(blob, enemies[i])) {
            blob.hp -= enemyDamage;
            enemies.splice(i, 1);
            i--;
            if (blob.hp <= 0) {
                alert('Game Over!');
                resetGame();
            }
        }
    }
}

function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function attack() {
    isAttacking = true;
    setTimeout(() => {
        for (let i = 0; i < enemies.length; i++) {
            if (collision(blob, enemies[i])) {
                enemies[i].hp -= blob.damage;
                if (enemies[i].hp <= 0) {
                    blob.gold += 10;
                    enemies.splice(i, 1);
                    i--;
                }
            }
        }
        isAttacking = false;
    }, blob.attackSpeed);
}

function drawHealthBar(x, y, width, height, hp, maxHp) {
    const healthRatio = hp / maxHp;
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, width * healthRatio, height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw blob
    ctx.fillStyle = isAttacking ? 'yellow' : 'blue'; // Change color when attacking
    ctx.fillRect(blob.x, blob.y, blob.width, blob.height);
    drawHealthBar(blob.x, blob.y - 10, blob.width, 5, blob.hp, blob.maxHp);

    // Draw enemies
    ctx.fillStyle = 'red';
    for (const enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        drawHealthBar(enemy.x, enemy.y - 10, enemy.width, 5, enemy.hp, enemy.maxHp);
    }

    // Draw stats
    ctx.fillStyle = 'black';
    ctx.fillText(`Gold: ${blob.gold}`, 10, 20);
    ctx.fillText(`HP: ${blob.hp}`, 10, 40);
}

function gameLoop() {
    updateEnemies();
    draw();
    saveProgress(); // Save progress every frame
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    blob.hp = 100;
    blob.maxHp = 100;
    blob.gold = 0;
    blob.damage = 10;
    blob.attackSpeed = 1000;
    enemies = [];
    saveProgress(); // Save reset state
}

setInterval(spawnEnemy, enemySpawnInterval);
setInterval(attack, blob.attackSpeed);

gameLoop();