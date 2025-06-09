import * as THREE from 'three';

// Game state
let score = 0;
let isGameStarted = false;
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Deep space black
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Stars background
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.1,
    transparent: true
});

const starsVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Lighting
const ambientLight = new THREE.AmbientLight(0x4444ff, 0.3); // Blue ambient light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Space station floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x444444,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x111111
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Ship types
const SHIP_TYPES = {
    SCOUT: {
        color: 0x00ffff,
        speed: 0.05,
        size: 1.5,
        points: 100,
        pattern: 'circle',
        hitRadius: 3
    },
    FIGHTER: {
        color: 0xff0000,
        speed: 0.08,
        size: 1.8,
        points: 200,
        pattern: 'zigzag',
        hitRadius: 4
    },
    CARRIER: {
        color: 0xffff00,
        speed: 0.03,
        size: 2.2,
        points: 300,
        pattern: 'straight',
        hitRadius: 5
    }
};

function createSpaceShip(type, x, z) {
    const shipGroup = new THREE.Group();
    const shipData = SHIP_TYPES[type];
    
    // Main body
    const bodyGeometry = new THREE.CylinderGeometry(0.5 * shipData.size, 0.7 * shipData.size, 2 * shipData.size, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: shipData.color,
        metalness: 0.9,
        roughness: 0.1,
        emissive: shipData.color,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    shipGroup.add(body);

    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.4 * shipData.size, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ffff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x004444,
        transparent: true,
        opacity: 0.8
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.y = 0.3 * shipData.size;
    cockpit.rotation.x = Math.PI;
    shipGroup.add(cockpit);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(2 * shipData.size, 0.1 * shipData.size, 0.8 * shipData.size);
    const wingMaterial = new THREE.MeshStandardMaterial({
        color: shipData.color,
        metalness: 0.9,
        roughness: 0.1,
        emissive: shipData.color,
        emissiveIntensity: 0.2
    });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-1 * shipData.size, 0, 0);
    shipGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(1 * shipData.size, 0, 0);
    shipGroup.add(rightWing);

    // Engines
    const engineGeometry = new THREE.CylinderGeometry(0.2 * shipData.size, 0.2 * shipData.size, 0.4 * shipData.size, 8);
    const engineMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xff0000
    });

    const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    leftEngine.position.set(-1 * shipData.size, 0, -0.8 * shipData.size);
    leftEngine.rotation.x = Math.PI / 2;
    shipGroup.add(leftEngine);

    const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    rightEngine.position.set(1 * shipData.size, 0, -0.8 * shipData.size);
    rightEngine.rotation.x = Math.PI / 2;
    shipGroup.add(rightEngine);

    // Engine glow
    const engineGlowGeometry = new THREE.CylinderGeometry(0.15 * shipData.size, 0.15 * shipData.size, 0.1 * shipData.size, 8);
    const engineGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.8
    });

    const leftGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
    leftGlow.position.set(-1 * shipData.size, 0, -1.1 * shipData.size);
    leftGlow.rotation.x = Math.PI / 2;
    shipGroup.add(leftGlow);

    const rightGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
    rightGlow.position.set(1 * shipData.size, 0, -1.1 * shipData.size);
    rightGlow.rotation.x = Math.PI / 2;
    shipGroup.add(rightGlow);

    // Position the entire ship
    shipGroup.position.set(x, 0.5, z);
    
    // Add movement data
    shipGroup.userData = {
        type: type,
        speed: shipData.speed,
        points: shipData.points,
        pattern: shipData.pattern,
        time: Math.random() * Math.PI * 2,
        initialPosition: new THREE.Vector3(x, 0.5, z),
        direction: new THREE.Vector3(1, 0, 0),
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        }
    };

    return shipGroup;
}

// Create ships
const ships = [];
const SHIP_COUNT = 10;
const SHIP_TYPES_ARRAY = Object.keys(SHIP_TYPES);

for (let i = 0; i < SHIP_COUNT; i++) {
    const type = SHIP_TYPES_ARRAY[Math.floor(Math.random() * SHIP_TYPES_ARRAY.length)];
    const x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 80;
    const ship = createSpaceShip(type, x, z);
    ships.push(ship);
    scene.add(ship);
}

// Player movement
const playerVelocity = new THREE.Vector3();
const playerRotation = new THREE.Vector3();
const moveSpeed = 0.2;
const rotationSpeed = 0.05;
const friction = 0.95;

// Laser beam
function createLaserBeam() {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8
    });
    const beam = new THREE.Mesh(geometry, material);
    
    // Add glow effect
    const glowGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    beam.add(glow);
    
    return beam;
}

let activeLasers = [];

function shootLaser() {
    const laser = createLaserBeam();
    laser.position.copy(camera.position);
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    laser.userData.velocity = direction.multiplyScalar(3);
    
    // Rotate laser to point in the direction of travel
    laser.lookAt(laser.position.clone().add(direction));
    
    scene.add(laser);
    activeLasers.push(laser);
}

// Explosion effect
function createExplosion(position, color) {
    const particles = [];
    const particleCount = 20;
    const explosionGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const explosionMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
    });

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(explosionGeometry, explosionMaterial);
        particle.position.copy(position);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        scene.add(particle);
        particles.push(particle);
    }

    return particles;
}

// Mobile controls
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const fireButton = document.getElementById('fireButton');

let isUpPressed = false;
let isDownPressed = false;

upButton.addEventListener('touchstart', () => isUpPressed = true);
upButton.addEventListener('touchend', () => isUpPressed = false);
downButton.addEventListener('touchstart', () => isDownPressed = true);
downButton.addEventListener('touchend', () => isDownPressed = false);
fireButton.addEventListener('touchstart', () => {
    if (isGameStarted) {
        shootLaser();
    }
});

// Start game
startButton.addEventListener('click', () => {
    isGameStarted = true;
    startScreen.style.display = 'none';
    if (!isPointerLocked) {
        renderer.domElement.requestPointerLock();
    }
});

// Mouse controls
let isPointerLocked = false;
const sensitivity = 0.002;

document.addEventListener('click', () => {
    if (!isGameStarted) return;
    
    if (!isPointerLocked) {
        renderer.domElement.requestPointerLock();
    } else {
        shootLaser();
    }
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        playerRotation.y -= event.movementX * sensitivity;
        playerRotation.x -= event.movementY * sensitivity;
        playerRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, playerRotation.x));
    }
});

// Movement controls
const keys = {};

document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

function updatePlayerMovement() {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    if (keys['w'] || isUpPressed) {
        playerVelocity.add(direction.multiplyScalar(moveSpeed));
    }
    if (keys['s'] || isDownPressed) {
        playerVelocity.sub(direction.multiplyScalar(moveSpeed));
    }
    if (keys['a']) {
        playerVelocity.add(new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(moveSpeed));
    }
    if (keys['d']) {
        playerVelocity.add(new THREE.Vector3(direction.z, 0, -direction.x).multiplyScalar(moveSpeed));
    }
    if (keys[' ']) {
        playerVelocity.y += moveSpeed;
    }
    if (keys['shift']) {
        playerVelocity.y -= moveSpeed;
    }

    // Apply friction
    playerVelocity.multiplyScalar(friction);
    
    // Update position
    camera.position.add(playerVelocity);
    
    // Update rotation
    camera.rotation.x = playerRotation.x;
    camera.rotation.y = playerRotation.y;
}

function updateShipMovement(ship) {
    const data = ship.userData;
    data.time += 0.01;
    
    switch(data.pattern) {
        case 'circle':
            const radius = 20;
            ship.position.x = data.initialPosition.x + Math.cos(data.time) * radius;
            ship.position.z = data.initialPosition.z + Math.sin(data.time) * radius;
            break;
            
        case 'zigzag':
            ship.position.x = data.initialPosition.x + Math.sin(data.time * 2) * 30;
            ship.position.z = data.initialPosition.z + data.time * data.speed * 10;
            if (ship.position.z > 50) {
                ship.position.z = -50;
            }
            break;
            
        case 'straight':
            ship.position.x += data.direction.x * data.speed;
            ship.position.z += data.direction.z * data.speed;
            
            if (Math.abs(ship.position.x) > 40) {
                data.direction.x *= -1;
            }
            if (Math.abs(ship.position.z) > 40) {
                data.direction.z *= -1;
            }
            break;
    }
    
    ship.rotation.x += data.rotationSpeed.x;
    ship.rotation.y += data.rotationSpeed.y;
    ship.rotation.z += data.rotationSpeed.z;
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!isGameStarted) return;
    
    updatePlayerMovement();
    
    // Rotate stars
    stars.rotation.y += 0.0001;
    
    // Update ships
    ships.forEach(updateShipMovement);
    
    // Update lasers
    for (let i = activeLasers.length - 1; i >= 0; i--) {
        const laser = activeLasers[i];
        laser.position.add(laser.userData.velocity);
        
        // Check for collisions with ships
        const laserPosition = laser.position;
        for (let j = ships.length - 1; j >= 0; j--) {
            const ship = ships[j];
            const shipPosition = ship.position;
            const distance = laserPosition.distanceTo(shipPosition);
            
            if (distance < 2 * ship.userData.size) {
                // Create explosion
                const explosionParticles = createExplosion(shipPosition, ship.userData.color);
                
                // Animate explosion
                const animateExplosion = () => {
                    let allDone = true;
                    explosionParticles.forEach(particle => {
                        particle.position.add(particle.userData.velocity);
                        particle.material.opacity -= 0.02;
                        particle.scale.multiplyScalar(0.95);
                        
                        if (particle.material.opacity > 0) {
                            allDone = false;
                        } else {
                            scene.remove(particle);
                        }
                    });
                    
                    if (!allDone) {
                        requestAnimationFrame(animateExplosion);
                    }
                };
                animateExplosion();
                
                scene.remove(laser);
                activeLasers.splice(i, 1);
                score += ship.userData.points;
                scoreElement.textContent = `Score: ${score}`;
                
                // Remove the hit ship
                scene.remove(ship);
                ships.splice(j, 1);
                
                // Create a new ship
                const type = SHIP_TYPES_ARRAY[Math.floor(Math.random() * SHIP_TYPES_ARRAY.length)];
                const x = (Math.random() - 0.5) * 80;
                const z = (Math.random() - 0.5) * 80;
                const newShip = createSpaceShip(type, x, z);
                ships.push(newShip);
                scene.add(newShip);
                
                break;
            }
        }
        
        // Remove lasers that travel too far
        if (laser.position.distanceTo(camera.position) > 100) {
            scene.remove(laser);
            activeLasers.splice(i, 1);
        }
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 