# Use Ubuntu 22.04 with Node.js 18 as the base image
FROM ubuntu:22.04

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install yarn globally and project dependencies
RUN npm install -g yarn && \
    yarn install --production && \
    npm install -g http-server && \
    npm install ws

# Expose ports (9001 for Webtrader, 8081 for WebSocket)
EXPOSE 9001 8081

# Start both the Webtrader app and mock WebSocket server
CMD ["sh", "-c", "http-server -p 9001 & node mock_websocket.js"]
