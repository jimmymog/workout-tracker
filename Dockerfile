FROM node:18-slim

# Install build tools for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server package files and install
COPY server/package*.json ./
RUN npm install

# Copy server source code
COPY server/ ./

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
