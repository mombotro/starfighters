# Starfighters - Multiplayer Kirby Game

A multiplayer browser game where players control sword-wielding Kirbys to fight enemies together!

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

4. To play with others, open multiple browser windows/tabs or share your local IP address with others on your network.

## How to Play

### Controls
- **Arrow Keys**: Move your Kirby
- **X Key**: Slash attack
- **Touch Controls**: Available on mobile devices (virtual joystick + slash button)

### Multiplayer
- Click one of the "Player 1-4" buttons to take control of a Kirby
- Only one Kirby can be controlled at a time per browser
- Other players in different browsers can see your Kirby moving and attacking
- All players share the same enemy pool and stats

### Gameplay
- Defeat enemies by slashing them
- Avoid getting hit by enemies
- Uncontrolled Kirbys will follow controlled ones and auto-attack enemies
- Stats (Deaths and Enemies Defeated) are shared across all players

## Features

- Real-time multiplayer using WebSockets
- Particle effects synchronized across clients
- Shared game state (enemies, stats)
- Mobile-friendly touch controls
- Smooth sprite animations

## Technical Details

- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Backend**: Node.js with Express and WebSocket (ws library)
- **Communication**: WebSocket for real-time synchronization

Enjoy playing together!
