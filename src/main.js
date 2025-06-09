import * as THREE from "three";

let scene, camera, renderer;
let player;
let ships = [];
let lasers = [];
let explosions = [];
let score = 0;
let isGameStarted = false;
let isMovingUp = false;
let isMovingDown = false;
let isFiring = false;
let lastFireTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let isTouching = false;

// Ship types with their properties
const SHIP_TYPES = {
  scout: {
    color: 0x00ff00,
    size: 2.5,
    speed: 0.05,
    points: 10,
    hitRadius: 6,
  },
  fighter: {
    color: 0xff0000,
    size: 3.0,
    speed: 0.03,
    points: 20,
    hitRadius: 7,
  },
  carrier: {
    color: 0x0000ff,
    size: 3.5,
    speed: 0.02,
    points: 30,
    hitRadius: 8,
  },
};

// Initialize the game
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create player
  const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  player = new THREE.Mesh(playerGeometry, playerMaterial);
  scene.add(player);

  // Add stars
  addStars();

  // Setup mobile controls
  setupMobileControls();

  // Setup touch controls for aiming
  setupTouchControls();

  // Setup start screen
  setupStartScreen();

  // Start game loop
  animate();

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
}

function setupStartScreen() {
  const startButton = document.getElementById("startButton");
  const startScreen = document.getElementById("startScreen");

  startButton.addEventListener("click", () => {
    isGameStarted = true;
    startScreen.style.display = "none";
    animate();
  });
}

function addStars() {
  const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < 200; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.x = (Math.random() - 0.5) * 100;
    star.position.y = (Math.random() - 0.5) * 100;
    star.position.z = (Math.random() - 0.5) * 100;
    scene.add(star);
  }
}

function setupMobileControls() {
  const upButton = document.getElementById("upButton");
  const downButton = document.getElementById("downButton");
  const fireButton = document.getElementById("fireButton");

  upButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isMovingUp = true;
  });

  upButton.addEventListener("touchend", (e) => {
    e.preventDefault();
    isMovingUp = false;
  });

  downButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isMovingDown = true;
  });

  downButton.addEventListener("touchend", (e) => {
    e.preventDefault();
    isMovingDown = false;
  });

  fireButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (isGameStarted) {
      shootLaser();
    }
  });
}

function spawnShip() {
  const types = Object.keys(SHIP_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const shipType = SHIP_TYPES[type];

  const geometry = new THREE.BoxGeometry(
    shipType.size,
    shipType.size,
    shipType.size
  );
  const material = new THREE.MeshBasicMaterial({ color: shipType.color });
  const ship = new THREE.Mesh(geometry, material);

  // Random position
  ship.position.x = (Math.random() - 0.5) * 20;
  ship.position.y = (Math.random() - 0.5) * 20;
  ship.position.z = -50;

  // Random movement pattern
  ship.userData.type = type;
  ship.userData.speed = shipType.speed;
  ship.userData.movementPattern = Math.floor(Math.random() * 3);
  ship.userData.movementTime = 0;

  scene.add(ship);
  ships.push(ship);
}

function updateShips() {
  for (let i = ships.length - 1; i >= 0; i--) {
    const ship = ships[i];
    ship.userData.movementTime += 0.01;

    // Update position based on movement pattern
    switch (ship.userData.movementPattern) {
      case 0: // Straight line
        ship.position.z += ship.userData.speed;
        break;
      case 1: // Sine wave
        ship.position.z += ship.userData.speed;
        ship.position.x += Math.sin(ship.userData.movementTime) * 0.1;
        break;
      case 2: // Circle
        ship.position.z += ship.userData.speed;
        ship.position.x += Math.cos(ship.userData.movementTime) * 0.1;
        ship.position.y += Math.sin(ship.userData.movementTime) * 0.1;
        break;
    }

    // Remove ships that are too close or too far
    if (ship.position.z > 0 || ship.position.z < -100) {
      scene.remove(ship);
      ships.splice(i, 1);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupTouchControls() {
  const aimArea = document.getElementById("aimArea");

  aimArea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isTouching = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  aimArea.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isTouching) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;

    // Update rotation based on touch movement
    currentRotationY += deltaX * 0.005;
    currentRotationX += deltaY * 0.005;

    // Clamp vertical rotation
    currentRotationX = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 3, currentRotationX)
    );

    // Update camera rotation
    camera.rotation.y = currentRotationY;
    camera.rotation.x = currentRotationX;

    touchStartX = touchX;
    touchStartY = touchY;
  });

  aimArea.addEventListener("touchend", (e) => {
    e.preventDefault();
    isTouching = false;
  });
}

function createLaserBeam() {
  const geometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.8,
  });
  const laser = new THREE.Mesh(geometry, material);
  laser.rotation.x = Math.PI / 2;
  return laser;
}

function shootLaser() {
  const now = Date.now();
  if (now - lastFireTime < 200) return; // Limit fire rate

  const laser = createLaserBeam();
  laser.position.copy(camera.position);

  // Set laser direction based on camera rotation
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);
  laser.userData.velocity = direction.multiplyScalar(3);

  scene.add(laser);
  lasers.push(laser);
  lastFireTime = now;
}

function createExplosion(position, color) {
  const particleCount = 50;
  const particles = [];
  const explosionDuration = 1000; // 1 second
  const startTime = Date.now();

  // Create bright flash
  const flashGeometry = new THREE.SphereGeometry(2, 32, 32);
  const flashMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8,
  });
  const flash = new THREE.Mesh(flashGeometry, flashMaterial);
  flash.position.copy(position);
  scene.add(flash);
  particles.push(flash);

  // Create explosion particles
  for (let i = 0; i < particleCount; i++) {
    const size = Math.random() * 0.5 + 0.2;
    const geometry = new THREE.SphereGeometry(size, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);

    // Random velocity in all directions
    const speed = Math.random() * 0.2 + 0.1;
    const angle = Math.random() * Math.PI * 2;
    const elevation = Math.random() * Math.PI * 2;
    particle.userData.velocity = new THREE.Vector3(
      Math.sin(angle) * Math.cos(elevation) * speed,
      Math.sin(angle) * Math.sin(elevation) * speed,
      Math.cos(angle) * speed
    );

    // Add rotation
    particle.userData.rotation = new THREE.Vector3(
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1
    );

    scene.add(particle);
    particles.push(particle);
  }

  // Add shockwave
  const shockwaveGeometry = new THREE.RingGeometry(0.1, 2, 32);
  const shockwaveMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
  shockwave.position.copy(position);
  shockwave.rotation.x = Math.PI / 2;
  scene.add(shockwave);
  particles.push(shockwave);

  explosions.push({
    particles,
    startTime,
    duration: explosionDuration,
  });
}

function updateExplosions() {
  const now = Date.now();
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    const age = now - explosion.startTime;
    const progress = age / explosion.duration;

    if (progress >= 1) {
      // Remove explosion
      explosion.particles.forEach((particle) => scene.remove(particle));
      explosions.splice(i, 1);
      continue;
    }

    // Update particles
    explosion.particles.forEach((particle) => {
      if (particle.userData.velocity) {
        particle.position.add(particle.userData.velocity);
        particle.rotation.x += particle.userData.rotation.x;
        particle.rotation.y += particle.userData.rotation.y;
        particle.rotation.z += particle.userData.rotation.z;
      }

      // Fade out
      if (particle.material.opacity) {
        particle.material.opacity = 0.8 * (1 - progress);
      }

      // Scale shockwave
      if (particle.geometry instanceof THREE.RingGeometry) {
        const scale = 1 + progress * 5;
        particle.scale.set(scale, scale, scale);
      }
    });
  }
}

function animate() {
  if (!isGameStarted) return;
  requestAnimationFrame(animate);

  // Update player position
  if (isMovingUp) player.position.y += 0.1;
  if (isMovingDown) player.position.y -= 0.1;

  // Update lasers
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    laser.position.add(laser.userData.velocity);

    // Check for collisions with ships
    for (let j = ships.length - 1; j >= 0; j--) {
      const ship = ships[j];
      const distance = laser.position.distanceTo(ship.position);

      if (distance < SHIP_TYPES[ship.userData.type].hitRadius) {
        // Create explosion
        createExplosion(ship.position, SHIP_TYPES[ship.userData.type].color);

        // Remove ship and laser
        scene.remove(ship);
        ships.splice(j, 1);
        scene.remove(laser);
        lasers.splice(i, 1);

        // Update score
        score += SHIP_TYPES[ship.userData.type].points;
        document.getElementById("score").textContent = `Score: ${score}`;
        break;
      }
    }

    // Remove lasers that are too far
    if (laser.position.z < -100) {
      scene.remove(laser);
      lasers.splice(i, 1);
    }
  }

  // Update explosions
  updateExplosions();

  // Spawn new ships
  if (Math.random() < 0.02) {
    spawnShip();
  }

  // Update ships
  updateShips();

  renderer.render(scene, camera);
}

// Start the game
init();
