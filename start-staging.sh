#!/bin/bash

# CMO App Simple Staging Start Script (No Docker)
# Use this as an alternative when Docker is not available

set -e

echo "🚀 Starting CMO App in staging mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    echo -e "${RED}❌ Error: Must run from CMO app root directory${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

# Build the frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
npm run build --prefix client

# Set environment variables
export NODE_ENV=production
export PORT=3456

# Kill any existing process on port 3456
echo -e "${YELLOW}🛑 Stopping any existing processes...${NC}"
lsof -ti:3456 | xargs kill -9 2>/dev/null || true

# Start the server in the background
echo -e "${YELLOW}🚀 Starting CMO server...${NC}"
cd server
nohup node index.js > ../cmo-app.log 2>&1 &
SERVER_PID=$!
cd ..

# Save the PID for later use
echo $SERVER_PID > cmo-app.pid

# Wait a moment for the server to start
sleep 3

# Health check
echo -e "${YELLOW}🔍 Checking server health...${NC}"
for i in {1..5}; do
    if curl -f http://localhost:3456/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ CMO App is running successfully!${NC}"
        echo ""
        echo "📋 Server Details:"
        echo "  • PID: $SERVER_PID"
        echo "  • Port: 3456"
        echo "  • URL: http://localhost:3456"
        echo "  • Health: http://localhost:3456/health"
        echo "  • Logs: tail -f cmo-app.log"
        echo "  • Stop: kill $SERVER_PID"
        echo ""
        
        # Start Caddy for reverse proxy
        echo -e "${YELLOW}🌐 Starting Caddy reverse proxy...${NC}"
        if brew services list | grep caddy | grep started >/dev/null; then
            brew services restart caddy
        else
            brew services start caddy
        fi
        
        echo -e "${GREEN}🎉 Deployment complete!${NC}"
        echo ""
        echo "🌍 Public URLs (when DNS configured):"
        echo "  • https://cmo.figmints.net"
        echo "  • https://cmo-staging.figmints.net"
        
        exit 0
    fi
    echo "Attempt $i/5 - waiting for server..."
    sleep 2
done

echo -e "${RED}❌ Health check failed - server may not have started properly${NC}"
echo "Check logs: tail -f cmo-app.log"
exit 1