# Starfighters Multiplayer Game - Development Notes

## Current Status
Working multiplayer Kirby game with real-time synchronization between clients.

## How to Run
1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Server will display local and network IP addresses
4. First browser to connect creates 4 Kirbys and 15 enemies
5. Subsequent browsers receive the game state and can control available Kirbys

## Architecture

### Server (server.js)
- Node.js + Express + WebSocket (ws library)
- Listens on port 3000, bound to 0.0.0.0 (all network interfaces)
- Maintains game state: characters, enemies, stats
- First client is determined by checking if `gameState.characters.length === 0`
- Broadcasts updates to all connected clients

### Client (index.html)

#### Game State
- **Characters (Kirbys)**: 4 total, created by first client
- **Enemies**: 15 total (mix of crabs and spikes), created by first client
- **Control System**: Single "Take Control" button assigns next available Kirby

#### Key Variables
- `clientId`: Unique identifier for this browser session
- `myControlledKirby`: Index of Kirby controlled by this client
- `isFirstClient`: Boolean from server indicating if this is the first client
- `characters[]`: Array of all Kirbys (local + remote)
- `enemies[]`: Array of all enemies

#### Character Properties
- `id`: Unique identifier (clientId + timestamp + random)
- `isRemote`: Boolean - true if created by another client
- `controlledBy`: clientId of who's controlling (null if not controlled)
- `x, y`: Position
- `state`: 'idle', 'walk', or 'slash'
- `facingRight`: Boolean for sprite flipping
- `currentFrame`, `slashFrame`: Animation frames
- `hue`: Color hue rotation value
- `label`: DOM element for player label (P1, P2, etc.)

#### Update Logic
**Movement/Animation:**
- Local characters (created by this client): Always updated
- Remote characters: Only updated if controlled by this client
- Remote character positions are synced from server updates

**Sending Updates:**
- Local characters: Send every 3 frames
- Remote characters: Only send if controlled by this client

**Receiving Updates:**
- Only apply position/state from server if NOT controlling that character
- Always apply `controlledBy` status from server

**Enemies:**
- Only moved by the client that created them (checked via `enemy.id.startsWith(clientId)`)
- Positions synced to other clients via server

#### Control System
1. Click "Take Control" button
2. Finds first Kirby where `controlledBy === null`
3. Sets `character.controlledBy = clientId`
4. Sends `control_change` message to server with `kirbyId` and action
5. Other clients receive message and update that Kirby's `controlledBy` status
6. Labels (P1-P4) appear above controlled Kirbys on ALL clients

#### Labels
- Show when `character.controlledBy !== null`
- Created dynamically for remote characters when they become controlled
- Position updated every frame to follow character

## Current Issues/Notes
- Labels should only appear when someone takes control (working)
- Sprite animations: idle (32x45), walk (33x45), slash (41x52)
- All sprites scaled 2x and bottom-aligned in 82x104 canvas
- Slash sprite offset 8px right and 4px down for alignment
- Slash last frame holds 3x longer

## WebSocket Messages

### Client → Server
- `update_character`: Character position/state (every 3 frames)
- `update_enemy`: Enemy position (every 10 frames, staggered)
- `remove_enemy`: When enemy is defeated
- `spawn_enemies`: When adding new enemies
- `update_stats`: Deaths and defeats count
- `particle_burst`: Visual effects
- `control_change`: When taking/releasing control

### Server → Client
- `init`: Initial game state + isFirstClient flag
- All of the above messages (broadcast to other clients)

## Files
- `server.js` - WebSocket server
- `index.html` - Complete game (HTML + CSS + JavaScript)
- `package.json` - Dependencies (express, ws)
- `assets/` - Sprite images
  - `sword kirby idle.png` - 2 frames, 32x45 each
  - `sword kirby walk.png` - 12 frames, 33x45 each
  - `sword kirby slash.png` - 5 frames, 41x52 each
  - `crab-enemy.png` - Enemy sprite
  - `spike-enemy.png` - Enemy sprite
  - `gadogo.png` - Logo

## Network Setup
- Server binds to 0.0.0.0 to accept connections from network
- Displays network IP addresses on startup
- Other devices connect via `http://[SERVER_IP]:3000`
- Both devices must be on same WiFi network
- Windows Firewall may need to allow Node.js

## Controls
- **Keyboard**: Arrow keys to move, X to slash
- **Touch**: Virtual joystick (bottom left) and slash button (bottom right)
- **Take Control**: Button at top center to control next available Kirby
- **Add 5 Enemies**: Button to spawn more enemies (first client only creates them)

## Next Steps / Known Issues
- Everything working: multiplayer sync, controls, animations, labels
- May need to verify labels appear correctly on both clients when taking control
