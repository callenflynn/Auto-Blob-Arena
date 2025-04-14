const gameContainer = document.getElementById('game-container');

// Initialize blob
let blob = {
    x: 385,
    y: 560,
    width: 30,
    height: 30,
    hp: 100,
    maxHp: 100,
    damage: 10,
    attackSpeed: 1000,
    gold: 0,
    element: document.createElement('div'),
};

// Add blob to the game container
blob.element.classList.add('blob');
blob.element.style.left = `${blob.x}px`;
blob.element.style.top = `${blob.y}px`;
gameContainer.appendChild(blob.element);

let enemies = [];
let enemySpawnInterval = 2000;
let enemyDamage = 5;
let isAttacking = false;

function spawnEnemy() {
    const enemy = {
        x: Math.random() * (gameContainer.offsetWidth - 30),
        y: 0,
        width: 30,
        height: 30,
        hp: 30,
        maxHp: 30,
        element: document.createElement('div'),
    };
    enemy.element.classList.add('enemy');
    enemy.element.style.left = `${enemy.x}px`;
    enemy.element.style.top = `${enemy.y}px`;
    gameContainer.appendChild(enemy.element);
    enemies.push(enemy);
}

function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.y += 2; // Move enemies down
        enemy.element.style.top = `${enemy.y}px`;

        if (enemy.y > gameContainer.offsetHeight) {
            gameContainer.removeChild(enemy.element);
            enemies.splice(i, 1);
            i--;
        } else if (collision(blob, enemy)) {
            blob.hp -= enemyDamage;
            gameContainer.removeChild(enemy.element);
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
    blob.element.style.backgroundColor = 'yellow'; // Change blob color to indicate attack
    setTimeout(() => {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (collision(blob, enemy)) {
                enemy.hp -= blob.damage;
                if (enemy.hp <= 0) {
                    blob.gold += 10;
                    gameContainer.removeChild(enemy.element);
                    enemies.splice(i, 1);
                    i--;
                }
            }
        }
        isAttacking = false;
        blob.element.style.backgroundColor = 'blue'; // Reset blob color
    }, blob.attackSpeed);
}

function resetGame() {
    blob.hp = 100;
    blob.maxHp = 100;
    blob.gold = 0;
    blob.damage = 10;
    blob.attackSpeed = 1000;
    enemies.forEach(enemy => gameContainer.removeChild(enemy.element));
    enemies = [];
}

function gameLoop() {
    updateEnemies();
    requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, enemySpawnInterval);
setInterval(attack, blob.attackSpeed);

gameLoop();