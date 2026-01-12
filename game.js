// --- НАСТРОЙКА ХОЛСТА (CANVAS) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Размеры холста. Лучше использовать размеры, кратные 16 для пиксель-арта.
canvas.width = 800;
canvas.height = 480;

// --- ИГРОВЫЕ КОНСТАНТЫ ---
const GRAVITY = 0.5;
const TILE_SIZE = 32; // Размер одного "блока" в мире

// --- ИГРОВЫЕ ОБЪЕКТЫ ---

// Игрок (аналог Рыцаря из Hollow Knight)
const player = {
    x: 100,
    y: 100,
    width: TILE_SIZE * 0.8,
    height: TILE_SIZE * 1.2,
    speed: 4,
    velocityY: 0,
    jumpForce: -12,
    isGrounded: false,
    direction: 'right', // 'left' или 'right' для анимации
    health: 5,
    // Анимации (пока просто цвета)
    draw: function() {
        if (this.direction === 'right') {
            ctx.fillStyle = '#ffffff'; // Белый цвет для движения вправо
        } else {
            ctx.fillStyle = '#e0e0e0'; // Светло-серый для движения влево
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Рисуем "плащ"
        ctx.fillStyle = '#ff4136'; // Красный плащ
        ctx.fillRect(this.x - 4, this.y, 8, this.height);
    }
};

// Камера
const camera = {
    x: 0,
    y: 0,
    update: function() {
        // Центрируем камеру на игроке
        this.x = player.x - canvas.width / 2 + player.width / 2;
        this.y = player.y - canvas.height / 2 + player.height / 2;
    }
};

// Управление
const keys = {
    right: false,
    left: false,
    up: false
};

// --- УРОВЕНЬ (КАРТА) ---
// 0 = воздух, 1 = платформа
const map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
];

// --- ВРАГИ (МОБЫ) ---
const enemies = [
    {
        x: 400,
        y: canvas.height - TILE_SIZE * 3,
        width: TILE_SIZE,
        height: TILE_SIZE,
        speed: 1,
        direction: 1, // 1 - вправо, -1 - влево
        patrolDistance: 100,
        startX: 400,
        draw: function() {
            ctx.fillStyle = '#7FDBFF'; // Голубой враг
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update: function() {
            this.x += this.speed * this.direction;
            if (this.x > this.startX + this.patrolDistance || this.x < this.startX) {
                this.direction *= -1; // Разворачиваем врага
            }
        }
    }
];


// --- ОСНОВНЫЕ ФУНКЦИИ ИГРЫ ---

// Функция для отрисовки карты
function drawMap() {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === 1) {
                ctx.fillStyle = '#333'; // Цвет платформ
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// Функция обновления состояния игрока (движение, физика)
function updatePlayer() {
    // Горизонтальное движение
    if (keys.right) {
        player.x += player.speed;
        player.direction = 'right';
    } else if (keys.left) {
        player.x -= player.speed;
        player.direction = 'left';
    }

    // Прыжок
    if (keys.up && player.isGrounded) {
        player.velocityY = player.jumpForce;
        player.isGrounded = false;
    }

    // Применение гравитации
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    player.isGrounded = false; // Сбрасываем состояние, проверим заново при коллизии

    // Коллизии с картой
    handleCollisions();
}

// Функция проверки столкновений
function handleCollisions() {
    // Ограничиваем мир, чтобы игрок не ушел за пределы карты
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > map[0].length * TILE_SIZE) {
        player.x = map[0].length * TILE_SIZE - player.width;
    }

    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] === 1) {
                const tile = {
                    x: col * TILE_SIZE,
                    y: row * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                };

                // Проверка столкновения (AABB - Axis-Aligned Bounding Box)
                if (player.x < tile.x + tile.width &&
                    player.x + player.width > tile.x &&
                    player.y < tile.y + tile.height &&
                    player.y + player.height > tile.y) {
                    
                    // Определяем, с какой стороны произошло столкновение
                    const overlapX = (player.x + player.width / 2) > (tile.x + tile.width / 2) ? 
                        (tile.x + tile.width) - player.x : (player.x + player.width) - tile.x;
                    const overlapY = (player.y + player.height / 2) > (tile.y + tile.height / 2) ? 
                        (tile.y + tile.height) - player.y : (player.y + player.height) - tile.y;

                    if (overlapX < overlapY) {
                        // Столкновение по горизонтали
                        if ((player.x + player.width / 2) > (tile.x + tile.width / 2)) {
                            player.x = tile.x - player.width;
                        } else {
                            player.x = tile.x + tile.width;
                        }
                    } else {
                        // Столкновение по вертикали
                        if ((player.y + player.height / 2) > (tile.y + tile.height / 2)) {
                            // Падаем на платформу
                            if (player.velocityY > 0) {
                                player.y = tile.y - player.height;
                                player.velocityY = 0;
                                player.isGrounded = true;
                            }
                        } else {
                            // Ударяемся головой о платформу
                            if (player.velocityY < 0) {
                                player.y = tile.y + tile.height;
                                player.velocityY = 0;
                            }
                        }
                    }
                }
            }
        }
    }
}


// Главный игровой цикл
function gameLoop() {
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Обновление состояний
    updatePlayer();
    camera.update();
    enemies.forEach(enemy => enemy.update());

    // Применяем трансформацию камеры
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Отрисовка объектов
    drawMap();
    player.draw();
    enemies.forEach(enemy => enemy.draw());
    
    // Возвращаем холст в исходное состояние
    ctx.restore();

    // Запускаем следующий кадр
    requestAnimationFrame(gameLoop);
}

// --- СЛУШАТЕЛИ СОБЫТИЙ (УПРАВЛЕНИЕ) ---
window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowRight':
        case 'd':
            keys.right = true;
            break;
        case 'ArrowLeft':
        case 'a':
            keys.left = true;
            break;
        case 'ArrowUp':
        case 'w':
        case ' ':
            keys.up = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowRight':
        case 'd':
            keys.right = false;
            break;
        case 'ArrowLeft':
        case 'a':
            keys.left = false;
            break;
        case 'ArrowUp':
        case 'w':
        case ' ':
            keys.up = false;
            break;
    }
});

// --- ЗАПУСК ИГРЫ ---
gameLoop();
