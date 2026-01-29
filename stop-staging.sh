#!/bin/bash

# CMO App Stop Script

echo "🛑 Stopping CMO App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for PID file
if [ -f "cmo-app.pid" ]; then
    PID=$(cat cmo-app.pid)
    if ps -p $PID > /dev/null; then
        echo -e "${YELLOW}Stopping server with PID $PID...${NC}"
        kill $PID
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null; then
            echo -e "${YELLOW}Force killing server...${NC}"
            kill -9 $PID
        fi
        
        rm cmo-app.pid
        echo -e "${GREEN}✅ Server stopped successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  PID file exists but process not running${NC}"
        rm cmo-app.pid
    fi
else
    echo -e "${YELLOW}ℹ️  No PID file found, trying to kill any process on port 3456...${NC}"
    lsof -ti:3456 | xargs kill -9 2>/dev/null || echo -e "${YELLOW}No process found on port 3456${NC}"
fi

# Optionally stop Caddy
read -p "Stop Caddy reverse proxy too? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping Caddy...${NC}"
    brew services stop caddy
    echo -e "${GREEN}✅ Caddy stopped${NC}"
fi

echo -e "${GREEN}🎉 CMO App shutdown complete${NC}"