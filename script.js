const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton'); 
window.onload = function() {
  restartButton.style.display = 'none';
}

let gameOver = false;
let gameLoop;

// Function to play explosion sound
function playExplosionSound() {
  const sound = new Audio('impact.mp3'); 
  sound.play();
}

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Define game variables
let spaceship = {
  x: (canvas.width) / 3,
  y: canvas.height - 110,
  width: 80,
  height: 80,
  speed: 10,
  shields: 3,
  invincible: false
};
const spaceshipImg = new Image();
spaceshipImg.src = 'spaceship.gif';

const alienImg = new Image();
alienImg.src = 'alien.gif';

let aliens = [];
let lasers = [];
let lives = 3;
let score = 0;

// Draw spaceship
function drawSpaceship() {
  ctx.drawImage(spaceshipImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

// Draw aliens
function drawAliens() {
  for (let i = 0; i < aliens.length; i++) {
    ctx.drawImage(alienImg, aliens[i].x, aliens[i].y, aliens[i].width, aliens[i].height);
  }
}

// Draw lasers
function drawLasers() {
  for (let i = 0; i < lasers.length; i++) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(lasers[i].x, lasers[i].y, lasers[i].width, lasers[i].height);
  }
}

// Load the explosion GIF
const explosionImage = new Image();
explosionImage.src = 'expl.webp';

// Draw explosion on the canvas
function drawExplosion(x, y) {
  ctx.drawImage(explosionImage, x - 25, y - 25, 50, 50); 

  // Remove the explosion after the GIF has played
  setTimeout(() => {
    ctx.clearRect(x - 25, y - 25, 50, 50);
  }, 5000);
}

// Update game state
function update() {
  if (gameOver) return;

  // Move aliens
  for (let i = 0; i < aliens.length; i++) {
    aliens[i].y += 1; 
  }

  // Move lasers
  for (let i = 0; i < lasers.length; i++) {
    lasers[i].y += lasers[i].isAlienLaser ? 1 : -3; 
  }

  // Check collisions
  for (let i = 0; i < lasers.length; i++) {
    for (let j = 0; j < aliens.length; j++) {
      if (collision(lasers[i], aliens[j]) && !lasers[i].isAlienLaser) {
        drawExplosion(aliens[j].x + aliens[j].width / 2, aliens[j].y + aliens[j].height / 2);
        aliens.splice(j, 1); 
        lasers.splice(i, 1); 
        score++;
        playExplosionSound();
        break;
      }
    }

    if (collision(lasers[i], spaceship) && lasers[i].isAlienLaser) {
      if (!spaceship.invincible) {
        spaceship.shields--;
        if (spaceship.shields <= 0) {
          lives--;
          spaceship.shields = 3;
          spaceship.invincible = true;
          setTimeout(() => {
            spaceship.invincible = false;
          }, 5000);
        }
        drawExplosion(spaceship.x + spaceship.width / 2, spaceship.y); 
      }
      lasers.splice(i, 1); 
    }
  }

  // Check game over
  if (lives === 0) {
    gameOver = true;
  }
}

// Draw game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSpaceship();
  drawAliens();
  drawLasers();

  if (gameOver) {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2);
    restartButton.style.display = 'block'; 
  }

  ctx.font = '24px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 10);
  ctx.fillText('Lives: ' + lives, 10, 40);
  ctx.fillText('Shields: ' + spaceship.shields, 10, 70);
}

// Handle mouse movement for spaceship and clicks for laser firing
canvas.addEventListener('mousemove', (e) => {
  let rect = canvas.getBoundingClientRect();
  spaceship.x = e.clientX - rect.left - spaceship.width / 2;
  
  if (spaceship.x < 0) spaceship.x = 0;
  if (spaceship.x > canvas.width - spaceship.width) spaceship.x = canvas.width - spaceship.width;
});

canvas.addEventListener('click', () => {
  if (!gameOver) {
    lasers.push({
      x: spaceship.x + spaceship.width / 2 - 2.5,
      y: spaceship.y,
      width: 5,
      height: 10,
      isAlienLaser: false
    });
  }
});

// Collision detection
function collision(laser, alien) {
  return (
    laser.x < alien.x + alien.width &&
    laser.x + laser.width > alien.x &&
    laser.y < alien.y + alien.height &&
    laser.y + laser.height > alien.y
  );
}

// Generate aliens and alien lasers
setInterval(() => {
  if (!gameOver) {
    aliens.push({
      x: Math.random() * (canvas.width - 50),
      y: 0,
      width: 50,
      height: 50
    });

    // Randomly generate alien lasers
    if (Math.random() < 0.5) {
      lasers.push({
        x: aliens[aliens.length - 1].x + aliens[aliens.length - 1].width / 2 - 2.5,
        y: aliens[aliens.length - 1].y,
        width: 5,
        height: 10,
        isAlienLaser: true
      });
    }
  }
}, 1000);

// Function to initialize the game state
function initGame() {
  gameOver = false;
  aliens = [];
  lasers = [];
  lives = 3;
  score = 0;
  spaceship.shields = 3; // Reset shields
  restartButton.style.display = 'none'; // Hide restart button

  // Restart the game loop
  gameLoop = setInterval(() => {
    update();
    draw();
  }, 1000 / 60);
}

// Restart button click event
restartButton.addEventListener('click', function() {
  clearInterval(gameLoop); // Stop the current game loop
  initGame(); // Restart the game
});

// Main game loop
gameLoop = setInterval(() => {
  update();
  draw();
}, 1000 / 60);