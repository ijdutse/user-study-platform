# Stage 1: Build the frontend
FROM node:20-alpine as builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy client source code
COPY client/ ./

# Build the frontend
RUN npm run build

# Stage 2: Setup the backend
FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy server source code
COPY server/ ./

# Copy built frontend from stage 1 to server's public directory
# Note: We assume the express app is configured to serve static files from 'public'
COPY --from=builder /app/client/dist ./public

# Create directory for sqlite database
RUN mkdir -p /app/data

# Expose the port
EXPOSE 3001

# Set environment variables
ENV PORT=3001
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
