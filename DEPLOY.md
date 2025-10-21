# Deployment Guide for Starfighters

## Important: This game requires a Node.js server with WebSocket support

**Surge.sh will NOT work** because it only hosts static files. This multiplayer game needs a running Node.js server for the WebSocket connections.

## Recommended: Deploy to Glitch.com (Free & Easy)

### Steps:

1. Go to https://glitch.com
2. Click "New Project" → "Import from GitHub"
3. Or manually:
   - Click "New Project" → "glitch-hello-node"
   - Delete the default files
   - Upload all your files:
     - `server.js`
     - `index.html`
     - `package.json`
     - `assets/` folder (all sprite images)

4. Glitch will automatically:
   - Install dependencies
   - Start the server
   - Give you a URL like `https://your-project-name.glitch.me`

5. Your game will be live and multiplayer-ready!

## Alternative: Deploy to Render.com (Free)

1. Push your code to GitHub
2. Go to https://render.com
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Click "Create Web Service"

## Alternative: Deploy to Railway.app (Free tier available)

1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js and deploy

## Testing Locally

```bash
npm start
```

Then open:
- http://localhost:3000 (first client)
- http://192.168.68.101:3000 (from another device on same network)

## Current Server Configuration

- Port: 3000 (will use PORT env variable in production)
- WebSocket: Auto-detects wss:// for HTTPS, ws:// for HTTP
- Server listens on 0.0.0.0 (all network interfaces)

## For Production Deployment

The server.js already handles the PORT environment variable, which hosting platforms will set automatically.

No code changes needed!
