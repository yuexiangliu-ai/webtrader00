# Use Ubuntu 22.04 with Node.js 18 as the base image
FROM ubuntu:22.04

# Install Node.js, npm, and build essentials
RUN apt-get update && \
    apt-get install -y curl build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock (if exists) first for caching
COPY package.json ./
COPY yarn.lock ./

# Install yarn and all dependencies (including devDependencies), then install global tools
RUN npm install -g yarn && \
    yarn install && \
    npm install -g http-server grunt-cli

# Copy all project files
COPY . .

# Build the app with Grunt
RUN yarn build

# Expose ports (9001 for Webtrader, 8081 for WebSocket)
EXPOSE 9001 8081

# Start both the Webtrader app and mock WebSocket server from v2.2.8
CMD ["sh", "-c", "http-server v2.2.8 -p 9001 & node mock_websocket.js"]
