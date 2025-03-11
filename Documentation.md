# WebTrader Docker Image Documentation

## Overview

This document provides instructions to build, run, and extend a self-sufficient Docker image for the WebTrader application (https://github.com/yuexiangliu-ai/webtrader00.git). The image is based on Ubuntu 22.04, includes all dependencies, and operates offline with pre-loaded mock data. It showcases WebTrader's full functionality and supports extension development.

- **Version**: 1.0.0
- **Last Updated**: March 11, 2025
- **Repository**: https://github.com/yuexiangliu-ai/webtrader00.git

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Building the Docker Image](#building-the-docker-image)
4. [Running the WebTrader Application](#running-the-webtrader-application)
5. [Understanding the Mock Data](#understanding-the-mock-data)
6. [Extending the WebTrader Application](#extending-the-webtrader-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Docker**: Installed (e.g., Docker Desktop). Verify with `docker --version`.
- **Git**: For cloning the repository.
- **Internet**: Required only for initial setup (image build and dependency download).

No additional software is needed post-build, as the image is self-contained.

---

## Project Structure

The Docker project includes:

- `Dockerfile`: Configures the Ubuntu-based image.
- `mock_websocket.js`: Simulates WebSocket API with mock data.
- `entrypoint.sh`: Starts the mock server and WebTrader.
- `.dockerignore`: Excludes unnecessary files.

Clone the repository and add these files:

```bash
git clone https://github.com/binary-com/webtrader.git
cd webtrader
# Copy Dockerfile, mock_websocket.js, entrypoint.sh, .dockerignore into this directory
```

---

## Building the Docker Image

### Dockerfile
```dockerfile
FROM ubuntu:22.04
WORKDIR /app
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && apt-get clean
COPY . .
COPY mock_websocket.js /app/mock_websocket.js
COPY entrypoint.sh /app/entrypoint.sh
RUN yarn install
RUN yarn build
EXPOSE 9001 8081
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
```

### Entrypoint Script (`entrypoint.sh`)
```bash
#!/bin/bash
node /app/mock_websocket.js &  # Start mock WebSocket server
yarn start                    # Start WebTrader
```

### `.dockerignore`
```
node_modules
dist
*.log
.git
.gitignore
```

### Build Command
```bash
docker build -t webtrader:latest .
```

This creates an image with all source files and dependencies pre-installed.

---

## Running the WebTrader Application

Run the container:
```bash
docker run -d -p 9001:9001 -p 8081:8081 --name webtrader webtrader:latest
```

- `-d`: Detached mode.
- `-p 9001:9001`: Maps WebTrader to `localhost:9001`.
- `-p 8081:8081`: Maps mock WebSocket to `localhost:8081`.

Access `http://localhost:9001` in your browser to see WebTrader with mock data. Stop it with:
```bash
docker stop webtrader
```

---

## Understanding the Mock Data

The `mock_websocket.js` script simulates Binary.com’s WebSocket API. Example content:
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const request = JSON.parse(message);
    if (request.active_symbols) {
      ws.send(JSON.stringify({
        active_symbols: [
          { symbol: 'frxEURUSD', display_name: 'EUR/USD', market: 'forex', pip: '0.00001', exchange_is_open: 1 }
        ],
        echo_req: request,
        msg_type: 'active_symbols'
      }));
    } else if (request.contracts_for) {
      ws.send(JSON.stringify({
        contracts_for: {
          available: [
            { contract_type: 'CALL', contract_display: 'Rise', symbol: request.contracts_for, payout_limit: 10000 }
          ],
          spot: '1.23456'
        },
        echo_req: request,
        msg_type: 'contracts_for'
      }));
    }
  });
});
```

- **Symbols**: Pre-loaded (e.g., EUR/USD).
- **Contracts**: Mock CALL/PUT options.
- **Port**: Runs on 8081, auto-connected by WebTrader.

---

## Extending the WebTrader Application

### Adding a New Contract Type (e.g., "Touch")
1. **Update Mock Data**:
   Edit `mock_websocket.js`:
   ```javascript
   if (request.contracts_for) {
     ws.send(JSON.stringify({
       contracts_for: {
         available: [
           { contract_type: 'CALL', contract_display: 'Rise', symbol: request.contracts_for, payout_limit: 10000 },
           { contract_type: 'ONETOUCH', contract_display: 'Touch', symbol: request.contracts_for, barriers: 1, barrier: '0.1' }
         ],
         spot: '1.23456'
       },
       echo_req: request,
       msg_type: 'contracts_for'
     }));
   }
   ```

2. **Update WebTrader Logic**:
   In `src/trade/tradeDialog.es6`, add:
   ```javascript
   export const SUPPORTED_CONTRACT_TYPES = ['callput', 'touchnotouch'];
   ```

3. **Rebuild and Test**:
   ```bash
   docker build -t webtrader:latest .
   docker run -d -p 9001:9001 -p 8081:8081 --name webtrader webtrader:latest
   ```
   Check `http://localhost:9001` for the new "Touch" option.

---

## Troubleshooting

- **Build Fails**: Verify Dockerfile syntax and file presence. Use `docker build . --no-cache`.
- **App Not Loading**: Check port availability (`sudo netstat -tuln | grep 9001`) and logs (`docker logs webtrader`).
- **No Mock Data**: Ensure `mock_websocket.js` is running and port 8081 is mapped.

```