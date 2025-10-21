const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(__dirname));

// Game state - reset on server restart
function resetGameState() {
    return {
        characters: [],
        enemies: [],
        stats: {
            deaths: 0,
            defeats: 0
        }
    };
}

let gameState = resetGameState();

const clients = new Map(); // Map of WebSocket -> clientId

// Broadcast to all connected clients
function broadcast(message, excludeClient = null) {
    const data = JSON.stringify(message);
    clients.forEach((clientId, client) => {
        if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('New client connected. Characters:', gameState.characters.length, 'Enemies:', gameState.enemies.length);

    let thisClientId = null; // Will be set when we receive first message from client

    // First client is the one that connects when there are no characters
    const isFirst = gameState.characters.length === 0;

    // Send current game state to new client
    ws.send(JSON.stringify({
        type: 'init',
        gameState: gameState,
        isFirstClient: isFirst
    }));

    console.log('Sent init message. isFirstClient:', isFirst);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Store clientId on first message
            if (!thisClientId && data.clientId) {
                thisClientId = data.clientId;
                clients.set(ws, thisClientId);
                console.log('Client registered with ID:', thisClientId);
            }

            switch(data.type) {
                case 'update_character':
                    // Update character in game state
                    const charIndex = gameState.characters.findIndex(c => c.id === data.character.id);
                    if (charIndex !== -1) {
                        gameState.characters[charIndex] = {...data.character, clientId: data.clientId};
                    } else {
                        gameState.characters.push({...data.character, clientId: data.clientId});
                        console.log('Character added. Total characters:', gameState.characters.length);
                    }
                    // Broadcast to other clients
                    broadcast(data, ws);
                    break;

                case 'update_enemy':
                    // Update enemy in game state
                    const enemyIndex = gameState.enemies.findIndex(e => e.id === data.enemy.id);
                    if (enemyIndex !== -1) {
                        gameState.enemies[enemyIndex] = data.enemy;
                    } else {
                        gameState.enemies.push(data.enemy);
                    }
                    broadcast(data, ws);
                    break;

                case 'remove_enemy':
                    // Remove enemy from game state
                    gameState.enemies = gameState.enemies.filter(e => e.id !== data.enemyId);
                    broadcast(data, ws);
                    break;

                case 'spawn_enemies':
                    // Add new enemies
                    data.enemies.forEach(enemy => {
                        gameState.enemies.push(enemy);
                    });
                    broadcast(data, ws);
                    break;

                case 'update_stats':
                    gameState.stats = data.stats;
                    broadcast(data, ws);
                    break;

                case 'particle_burst':
                    // Just relay particle effects
                    broadcast(data, ws);
                    break;

                case 'control_change':
                    // Broadcast control changes
                    broadcast(data, ws);
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');

        // Release any Kirbys controlled by this client
        if (thisClientId) {
            gameState.characters.forEach(char => {
                if (char.controlledBy === thisClientId) {
                    char.controlledBy = null;
                    console.log('Released Kirby', char.id, 'from disconnected client', thisClientId);

                    // Broadcast the release to all clients
                    broadcast({
                        type: 'control_change',
                        clientId: thisClientId,
                        action: 'release',
                        kirbyId: char.id
                    });
                }
            });
        }

        clients.delete(ws);

        // If no clients left, reset game state
        if (clients.size === 0) {
            console.log('All clients disconnected. Resetting game state.');
            gameState = resetGameState();
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);

    // Display network IP addresses
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    console.log('\nNetwork addresses:');
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`  http://${iface.address}:${PORT}`);
            }
        });
    });
});
