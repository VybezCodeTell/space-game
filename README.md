# Space Laser Shooter - First Person Shooter Game

A unique first-person game set in space where you shoot laser beams at different types of enemy space ships! Built with Three.js.

## How to Play

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

## Controls

### Desktop
- **WASD**: Move around in space
- **Space**: Move up
- **Shift**: Move down
- **Mouse**: Look around
- **Click**: 
  - First click: Lock pointer for mouse control
  - Subsequent clicks: Shoot lasers
- **ESC**: Release pointer lock

### Mobile
- **Up/Down Buttons**: Move forward/backward
- **Fire Button**: Shoot lasers
- **Touch and Drag**: Look around

## Game Objective

Shoot laser beams at the enemy space ships to score points! Different ships have different point values:
- Scout Ships (Cyan): 100 points - Move in circular patterns
- Fighter Ships (Red): 200 points - Move in zigzag patterns
- Carrier Ships (Yellow): 300 points - Move in straight lines

## Features

- Space station environment with starry background
- First-person perspective with momentum-based movement
- Three different types of enemy ships with unique movement patterns
- Laser beam shooting mechanics with glow effects
- Ship explosion effects with particle systems
- Mobile-friendly controls
- Score tracking
- Space-themed lighting and materials
- Smooth movement and camera controls 