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
    damage: 10,
    attackSpeed: 1000,
    gold: 0,
};

let enemies = [];
let enemySpawnInterval = 2000;
let enemyDamage = 5;

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
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(blob.x, blob.y, blob.width, blob.height);
    
    ctx.fillStyle = 'red';
    for (const enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    ctx.fillStyle = 'black';
    ctx.fillText(`Gold: ${blob.gold}`, 10, 20);
    ctx.fillText(`HP: ${blob.hp}`, 10, 40);
}

function gameLoop() {
    updateEnemies();
    attack();
    draw();
    saveProgress(); // Save progress every frame
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    blob.hp = 100;
    blob.gold = 0;
    blob.damage = 10;
    blob.attackSpeed = 1000;
    enemies = [];
    saveProgress(); // Save reset state
}

setInterval(spawnEnemy, enemySpawnInterval);
setInterval(() => {
    blob.attackSpeed = Math.max(100, blob.attackSpeed - 10);
}, blob.attackSpeed);

gameLoop();