```markdown
# WebTrader Docker Image Documentation

## Overview

This document provides instructions to build, run, and extend a self-sufficient Docker image for the WebTrader application (https://github.com/binary-com/webtrader). The image is based on Ubuntu 22.04, includes all dependencies and source files, and operates offline with mock data to demonstrate functionality. It is designed for users to explore WebTrader and developers to extend it with new features.

- **Version**: 1.0.0
- **Last Updated**: March 11, 2025
- **Repository**: https://github.com/binary-com/webtrader (archived Feb 22, 2024)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [How WebTrader Works](#how-webtrader-works)
4. [Building the Docker Image](#building-the-docker-image)
5. [Running the WebTrader Application](#running-the-webtrader-application)
6. [Mock Data in the Docker Image](#mock-data-in-the-docker-image)
7. [Extending the WebTrader Application](#extending-the-webtrader-application)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Docker**: Installed (e.g., Docker Desktop). Verify with `docker --version`.
- **Git**: For cloning the repository.
- **Internet**: Required only for initial setup (image build and dependency download).

The image is self-contained and requires no additional software post-build.

---

## Project Structure

The Docker project includes:

- `Dockerfile`: Configures the Ubuntu-based image.
- `mock_websocket.js`: Simulates WebSocket API for offline operation.
- `entrypoint.sh`: Starts the mock server and WebTrader.
- `.dockerignore`: Excludes unnecessary files.

Clone the repository and add these files:
```bash
git clone https://github.com/binary-com/webtrader.git
cd webtrader
# Copy Dockerfile, mock_websocket.js, entrypoint.sh, .dockerignore into this directory
```

---

## How WebTrader Works

WebTrader (https://github.com/binary-com/webtrader) is a full-screen web trading application designed for Binary.com. It provides a user interface for trading financial instruments, built with a modular JavaScript architecture using Backbone.js, jQuery, and WebSocket communication. Below is an overview of its core components and functionality:

### Architecture
- **Frontend**: 
  - **HTML/CSS**: Located in `src/html/` (e.g., `index.html`), defines the layout and styles.
  - **JavaScript**: In `src/scripts/`, uses Backbone.js for MVC structure:
    - **Models**: Manage data (e.g., `src/scripts/models/` for trade and symbol data).
    - **Views**: Handle UI rendering (e.g., `src/scripts/views/` for trade dialogs, charts).
    - **Controllers**: Coordinate logic (e.g., `src/scripts/trade/` for trade workflows).
  - **Libraries**: jQuery, Lodash, Moment.js (in `src/lib/`), and custom WebSocket wrappers.
- **Backend Communication**: 
  - Relies on WebSocket connections to Binary.com’s API for real-time data (symbols, contracts, ticks).
  - In this Docker image, a mock WebSocket server (`mock_websocket.js`) replaces the live API.

### Key Features
1. **Symbol Selection**: 
   - Displays available trading symbols (e.g., EUR/USD) in a dropdown.
   - Managed by `src/scripts/symbols.es6` and rendered via `src/scripts/views/symbolsView.es6`.
2. **Trade Dialog**: 
   - A popup window for configuring trades (e.g., CALL/PUT contracts).
   - Defined in `src/trade/tradeDialog.es6` and styled in `src/css/trade.css`.
3. **Charting**: 
   - Real-time price charts powered by Highcharts (in `src/lib/highstock/`).
   - Updated via WebSocket ticks, handled in `src/scripts/views/chartView.es6`.
4. **Portfolio**: 
   - Shows open trades, implemented in `src/scripts/views/portfolioView.es6`.

### Workflow
1. **Initialization**: `src/scripts/main.es6` loads dependencies and starts the app.
2. **WebSocket Connection**: Connects to the API (or mock server) to fetch active symbols and contracts.
3. **User Interaction**: Users select a symbol, open the trade dialog, configure a trade, and submit it.
4. **Rendering**: Views update dynamically based on WebSocket messages (e.g., price ticks).

This Docker image replicates this workflow offline using mock data, preserving the application’s full functionality.

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

---

## Running the WebTrader Application

Run the container:
```bash
docker run -d -p 9001:9001 -p 8081:8081 --name webtrader webtrader:latest
```

- Access: `http://localhost:9001`.
- Stop: `docker stop webtrader`.

The app loads in your browser with mock data, showcasing symbol selection, trade dialogs, and charts.

---

## Mock Data in the Docker Image

The `mock_websocket.js` script simulates Binary.com’s WebSocket API for offline use:
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
    } else if (request.tick) {
      ws.send(JSON.stringify({
        tick: { symbol: request.tick, quote: '1.23456' },
        echo_req: request,
        msg_type: 'tick'
      }));
    }
  });
});
```

- **Purpose**: Enables offline operation by mimicking live API responses.
- **Data**: Includes symbols (e.g., EUR/USD), contracts (e.g., CALL), and static ticks.

---

## Extending the WebTrader Application

To add a new feature with a new window (e.g., “Portfolio Analysis”), follow these steps, mirroring existing components like the trade dialog or portfolio view:

### Example: Adding a Portfolio Analysis Window
This feature adds a new button to the UI that opens a window displaying mock portfolio metrics.

1. **Update the Mock Data** (Optional):
   - If the new feature needs additional data, extend `mock_websocket.js`:
   ```javascript
   if (request.portfolio_analysis) {
     ws.send(JSON.stringify({
       portfolio_analysis: {
         total_trades: 10,
         total_profit: 150.75,
         avg_duration: '5m'
       },
       echo_req: request,
       msg_type: 'portfolio_analysis'
     }));
   }
   ```

2. **Create a New View**:
   - Add `src/scripts/views/portfolioAnalysisView.es6`:
   ```javascript
   import $ from 'jquery';
   import Backbone from 'backbone';
   import { create_window } from '../common/window.es6';

   const PortfolioAnalysisView = Backbone.View.extend({
     tagName: 'div',
     className: 'portfolio-analysis',
     template: `
       <div class="window-title">Portfolio Analysis</div>
       <div>Total Trades: <span class="total-trades"></span></div>
       <div>Total Profit: <span class="total-profit"></span></div>
       <div>Avg Duration: <span class="avg-duration"></span></div>
     `,
     initialize() {
       this.render();
       this.fetchData();
     },
     render() {
       this.$el.html(this.template);
       create_window('portfolio-analysis-window', 'Portfolio Analysis', this.$el, 400, 300);
       return this;
     },
     fetchData() {
       const ws = new WebSocket('ws://localhost:8081');
       ws.onopen = () => {
         ws.send(JSON.stringify({ portfolio_analysis: 1, req_id: 1 }));
       };
       ws.onmessage = (msg) => {
         const data = JSON.parse(msg.data);
         if (data.msg_type === 'portfolio_analysis') {
           this.$('.total-trades').text(data.portfolio_analysis.total_trades);
           this.$('.total-profit').text(data.portfolio_analysis.total_profit);
           this.$('.avg-duration').text(data.portfolio_analysis.avg_duration);
         }
       };
     }
   });

   export default PortfolioAnalysisView;
   ```

3. **Add a Button to the UI**:
   - Modify `src/html/index.html` to include a trigger:
   ```html
   <button id="open-portfolio-analysis">Portfolio Analysis</button>
   ```

4. **Wire Up the Feature**:
   - Update `src/scripts/main.es6`:
   ```javascript
   import PortfolioAnalysisView from './views/portfolioAnalysisView.es6';

   $(document).ready(() => {
     $('#open-portfolio-analysis').on('click', () => {
       new PortfolioAnalysisView();
     });
   });
   ```

5. **Style the Window**:
   - Add to `src/css/main.css`:
   ```css
   .portfolio-analysis {
     padding: 10px;
   }
   .window-title {
     font-weight: bold;
     margin-bottom: 10px;
   }
   ```

6. **Rebuild and Test**:
   ```bash
   docker build -t webtrader:latest .
   docker run -d -p 9001:9001 -p 8081:8081 --name webtrader webtrader:latest
   ```
   - Visit `http://localhost:9001`, click “Portfolio Analysis,” and verify the new window appears with mock data.

### General Steps for New Features
1. **Define the Feature**: Plan the UI (e.g., a new window) and data needs.
2. **Extend Mock Data**: Add endpoints in `mock_websocket.js` if required.
3. **Create a View**: Use Backbone.js to build the window, leveraging `create_window` from `common/window.es6`.
4. **Integrate**: Add a trigger (e.g., button) in `index.html` and hook it up in `main.es6`.
5. **Style**: Update CSS for consistency with existing windows.

---

## Troubleshooting

- **Build Fails**: Check Dockerfile syntax or file presence (`docker build . --no-cache`).
- **App Not Loading**: Verify ports (`sudo netstat -tuln | grep 9001`) and logs (`docker logs webtrader`).
- **Feature Not Working**: Ensure file paths match and rebuild the image.

```

---

