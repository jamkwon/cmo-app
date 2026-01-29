#!/bin/bash

# CMO App Staging Status Check Script

echo "📊 CMO App Staging Status"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if app is running
echo -e "${BLUE}🔍 Application Status:${NC}"
if [ -f "cmo-app.pid" ]; then
    PID=$(cat cmo-app.pid)
    if ps -p $PID > /dev/null; then
        echo -e "  ${GREEN}✅ CMO App is running (PID: $PID)${NC}"
        
        # Check health endpoint
        if curl -f -s http://localhost:3456/health >/dev/null 2>&1; then
            echo -e "  ${GREEN}✅ Health check passed${NC}"
        else
            echo -e "  ${RED}❌ Health check failed${NC}"
        fi
    else
        echo -e "  ${RED}❌ CMO App is not running (stale PID file)${NC}"
    fi
else
    echo -e "  ${RED}❌ CMO App is not running (no PID file)${NC}"
fi

# Check Caddy
echo -e "\n${BLUE}🌐 Reverse Proxy Status:${NC}"
if brew services list | grep caddy | grep started >/dev/null; then
    echo -e "  ${GREEN}✅ Caddy is running${NC}"
    
    # Test local proxy
    if curl -s -I http://localhost/ | head -1 | grep -q "308\|200"; then
        echo -e "  ${GREEN}✅ Caddy reverse proxy responding${NC}"
    else
        echo -e "  ${RED}❌ Caddy reverse proxy not responding${NC}"
    fi
else
    echo -e "  ${RED}❌ Caddy is not running${NC}"
fi

# Check ports
echo -e "\n${BLUE}🔌 Port Status:${NC}"
if curl -f -s http://localhost:3456/health >/dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Port 3456 (CMO App) - responding${NC}"
else
    echo -e "  ${RED}❌ Port 3456 (CMO App) - not responding${NC}"
fi

# Test external access (simulated)
echo -e "\n${BLUE}🌍 Public Access Test:${NC}"
echo -e "  ${YELLOW}ℹ️  Configured domains:${NC}"
echo "    • cmo.figmints.net"
echo "    • cmo-staging.figmints.net"
echo -e "  ${YELLOW}⚠️  DNS configuration required for external access${NC}"

# Show recent logs
echo -e "\n${BLUE}📋 Recent Activity:${NC}"
if [ -f "cmo-app.log" ]; then
    echo -e "  ${GREEN}Last 3 log entries:${NC}"
    tail -3 cmo-app.log | sed 's/^/    /'
else
    echo -e "  ${YELLOW}⚠️  No log file found${NC}"
fi

# Show configuration summary
echo -e "\n${BLUE}⚙️  Configuration Summary:${NC}"
echo "  • Environment: production"
echo "  • Port: 3456"
echo "  • Database: SQLite (server/cmo.db)"
echo "  • Frontend: Built and served statically"
echo "  • SSL: Automatic via Caddy/Let's Encrypt"

# Management commands
echo -e "\n${BLUE}🔧 Management Commands:${NC}"
echo "  • View logs: tail -f cmo-app.log"
echo "  • Stop app: ./stop-staging.sh"
echo "  • Restart: ./stop-staging.sh && ./start-staging.sh"
echo "  • Test health: curl http://localhost:3456/health"

echo ""