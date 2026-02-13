// Skispil - Grundlogik
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

// Spiller
const player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 40,
  height: 60,
  speed: 4,
  dx: 0,
  dy: 0,
  rotation: 0,
  jumping: false,
  jumpTimer: 0,
  salto: false,
  saltoTimer: 0,
};

// Sten
const rocks = [];
function spawnRock() {
  const size = 40 + Math.random() * 20;
  rocks.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    speed: 3 + Math.random() * 2,
  });
}

// Træer
const trees = [];
function spawnTree() {
  const side = Math.random() > 0.5 ? 'left' : 'right';
  const x = side === 'left' ? 15 : canvas.width - 45;
  trees.push({
    x: x,
    y: -80,
    width: 50,
    height: 80,
    speed: 3 + Math.random() * 2,
  });
}

// Input
let keys = {};
let lastSpace = 0;
let mobileTouchState = {
  leftPressed: false,
  rightPressed: false
};

document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    const now = Date.now();
    if (now - lastSpace < 300 && !player.salto) {
      player.salto = true;
      player.saltoTimer = 0;
    } else if (!player.jumping) {
      player.jumping = true;
      player.jumpTimer = 0;
    }
    lastSpace = now;
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

// Mobile touch button handlers
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

if (leftBtn) {
  leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileTouchState.leftPressed = true;
  });
  leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    mobileTouchState.leftPressed = false;
  });
  leftBtn.addEventListener('mousedown', () => {
    mobileTouchState.leftPressed = true;
  });
  leftBtn.addEventListener('mouseup', () => {
    mobileTouchState.leftPressed = false;
  });
}

if (rightBtn) {
  rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileTouchState.rightPressed = true;
  });
  rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    mobileTouchState.rightPressed = false;
  });
  rightBtn.addEventListener('mousedown', () => {
    mobileTouchState.rightPressed = true;
  });
  rightBtn.addEventListener('mouseup', () => {
    mobileTouchState.rightPressed = false;
  });
}

function updatePlayer() {
  // Styring - både keyboard og mobile buttons
  const moveLeft = keys['ArrowLeft'] || mobileTouchState.leftPressed;
  const moveRight = keys['ArrowRight'] || mobileTouchState.rightPressed;
  
  if (moveLeft) {
    player.dx = -6;
    player.rotation = -Math.PI / 10;
  } else if (moveRight) {
    player.dx = 6;
    player.rotation = Math.PI / 10;
  } else {
    player.dx = 0;
    player.rotation = 0;
  }

  if (keys['ArrowUp']) player.speed = Math.min(player.speed + 0.1, 10);
  if (keys['ArrowDown']) player.speed = Math.max(player.speed - 0.2, 0);

  // Hop
  if (player.jumping) {
    player.dy = -12;
    player.jumpTimer++;
    if (player.jumpTimer > 15) {
      player.jumping = false;
      player.dy = 0;
    }
  }

  // Salto
  if (player.salto) {
    player.dy = -16;
    player.saltoTimer++;
    if (player.saltoTimer > 25) {
      player.salto = false;
      player.dy = 0;
    }
  }

  // Bevægelse
  player.x += player.dx;
  player.y += player.dy + player.speed;

  // Begrænsninger
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
}

function updateRocks() {
  for (let rock of rocks) {
    rock.y += rock.speed + player.speed * 0.5;
  }
  // Fjern sten der er ude af canvas
  while (rocks.length && rocks[0].y > canvas.height) rocks.shift();
}

function updateTrees() {
  for (let tree of trees) {
    tree.y += tree.speed + player.speed * 0.5;
  }
  // Fjern træer der er ude af canvas
  while (trees.length && trees[0].y > canvas.height) trees.shift();
}

function checkCollision() {
  for (let rock of rocks) {
    if (
      player.x < rock.x + rock.size &&
      player.x + player.width > rock.x &&
      player.y < rock.y + rock.size &&
      player.y + player.height > rock.y
    ) {
      return true;
    }
  }
  for (let tree of trees) {
    if (
      player.x < tree.x + tree.width &&
      player.x + player.width > tree.x &&
      player.y < tree.y + tree.height &&
      player.y + player.height > tree.y
    ) {
      return true;
    }
  }
  return false;
}

function drawPlayer() {
  ctx.save();
  
  // Roter omkring spillerens center
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate(player.rotation);
  ctx.translate(-centerX, -centerY);
  
  const headRadius = 8;
  const headX = player.x + player.width / 2;
  const headY = player.y - 15;
  
  // Hoved
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Øjne
  ctx.fillStyle = '#000';
  ctx.fillRect(headX - 4, headY - 2, 2, 2);
  ctx.fillRect(headX + 2, headY - 2, 2, 2);
  
  // Krop
  ctx.fillStyle = '#1976d2';
  ctx.fillRect(player.x, player.y, player.width, 30);
  
  // Arme
  ctx.strokeStyle = '#ffdbac';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y + 5);
  ctx.lineTo(player.x - 15, player.y + 15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(player.x + player.width, player.y + 5);
  ctx.lineTo(player.x + player.width + 15, player.y + 15);
  ctx.stroke();
  
  // Skistave
  ctx.strokeStyle = '#616161';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x - 10, player.y + 8);
  ctx.lineTo(player.x - 15, player.y + 35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(player.x + player.width + 10, player.y + 8);
  ctx.lineTo(player.x + player.width + 15, player.y + 35);
  ctx.stroke();
  
  // Ski
  ctx.fillStyle = '#ff6b35';
  ctx.fillRect(player.x - 5, player.y + 30, 20, 4);
  ctx.fillRect(player.x + player.width - 15, player.y + 30, 20, 4);
  
  // Etiketter
  if (player.salto) {
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Salto!', player.x, player.y - 40);
  } else if (player.jumping) {
    ctx.fillStyle = '#4caf50';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Hop!', player.x, player.y - 40);
  }
  
  ctx.restore();
}

function drawRocks() {
  ctx.save();
  for (let rock of rocks) {
    const centerX = rock.x + rock.size / 2;
    const centerY = rock.y + rock.size / 2;
    const radius = rock.size / 2;
    
    // Sten - mørkegrå
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Skygge/kant
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(centerX, centerY + radius * 0.6, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight/glans
    ctx.fillStyle = '#757575';
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTrees() {
  ctx.save();
  for (let tree of trees) {
    const treeX = tree.x + tree.width / 2;
    const treeY = tree.y;
    
    // Stamme
    ctx.fillStyle = '#4a2c1f';
    ctx.fillRect(treeX - 6, treeY + tree.height * 0.5, 12, tree.height * 0.5);
    
    // Scygge på stamme
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(treeX - 2, treeY + tree.height * 0.5, 5, tree.height * 0.5);
    
    // Træ krone - øverste lag (mørkegrønt)
    ctx.fillStyle = '#0d3b1f';
    ctx.beginPath();
    ctx.moveTo(treeX, treeY);
    ctx.lineTo(treeX - tree.width * 0.4, treeY + tree.height * 0.35);
    ctx.lineTo(treeX + tree.width * 0.4, treeY + tree.height * 0.35);
    ctx.closePath();
    ctx.fill();
    
    // Midterlag (mørkegrønt)
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.moveTo(treeX, treeY + tree.height * 0.25);
    ctx.lineTo(treeX - tree.width * 0.45, treeY + tree.height * 0.55);
    ctx.lineTo(treeX + tree.width * 0.45, treeY + tree.height * 0.55);
    ctx.closePath();
    ctx.fill();
    
    // Nederste lag (lysegrønt)
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(treeX, treeY + tree.height * 0.45);
    ctx.lineTo(treeX - tree.width * 0.5, treeY + tree.height * 0.8);
    ctx.lineTo(treeX + tree.width * 0.5, treeY + tree.height * 0.8);
    ctx.closePath();
    ctx.fill();
    
    // Highlight/glans
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(treeX - tree.width * 0.15, treeY + tree.height * 0.3, tree.width * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrees();
  drawPlayer();
  drawRocks();
  drawDistance();
}

function drawDistance() {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Afstand: ${Math.floor(distance)} m`, 20, 40);
  
  // Vis rekord nede i højre hjørne
  ctx.fillText(`Rekord: ${Math.floor(highScore)} m`, canvas.width - 250, canvas.height - 20);
  ctx.restore();
}

let gameOver = false;
let gameOverTime = 0;
let frame = 0;
let distance = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

function restartGame() {
  // Nulstil spiller
  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
  player.dx = 0;
  player.dy = 0;
  player.jumping = false;
  player.jumpTimer = 0;
  player.salto = false;
  player.saltoTimer = 0;
  player.speed = 4;
  
  // Nulstil sten
  rocks.length = 0;
  
  // Nulstil træer
  trees.length = 0;
  
  // Nulstil spil tilstand
  gameOver = false;
  gameOverTime = 0;
  frame = 0;
  lastSpace = 0;
  distance = 0;
}
function gameLoop() {
  if (gameOver) {
    ctx.save();
    ctx.fillStyle = '#d32f2f';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('Game Over!', canvas.width / 2 - 120, canvas.height / 2);
    ctx.restore();
    
    // Auto-restart efter 2 sekunder
    if (gameOverTime === 0) {
      gameOverTime = Date.now();
    }
    if (Date.now() - gameOverTime > 2000) {
      restartGame();
    }
    
    requestAnimationFrame(gameLoop);
    return;
  }

  updatePlayer();
  updateRocks();
  updateTrees();
  draw();
  
  // Øg afstand konstant hver frame
  distance += 0.05;

  if (checkCollision()) {
    // Gem rekord hvis højere end tidligere
    if (distance > highScore) {
      highScore = distance;
      localStorage.setItem('highScore', Math.floor(highScore));
    }
    gameOver = true;
  }

  // Spawn sten og træer
  frame++;
  if (frame % 40 === 0) spawnRock();
  if (frame % 60 === 0) spawnTree();

  requestAnimationFrame(gameLoop);
}

gameLoop();
