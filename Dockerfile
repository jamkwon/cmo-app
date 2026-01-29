# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --prefix server
RUN npm install --prefix client

# Copy source code
COPY . .

# Build frontend
RUN npm run build --prefix client

# Create uploads directory for database
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3456

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3456

# Start the server
CMD ["npm", "start", "--prefix", "server"]