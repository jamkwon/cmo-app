#!/bin/bash

# CMO App Staging Deployment Script for figmints.net

set -e  # Exit on any error

echo "🚀 Deploying CMO App to figmints.net staging..."

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

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Pull latest changes (optional - comment out if not needed)
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Warning: Git pull failed or not in a git repo${NC}"

# Build and deploy with docker-compose
echo -e "${YELLOW}🏗️  Building and starting containers...${NC}"
docker-compose -f docker-compose.staging.yml down 2>/dev/null || true
docker-compose -f docker-compose.staging.yml build --no-cache
docker-compose -f docker-compose.staging.yml up -d

# Wait for app to be healthy
echo -e "${YELLOW}🔍 Waiting for app to be healthy...${NC}"
sleep 10

# Health check
for i in {1..10}; do
    if curl -f http://localhost:3456/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ App is healthy!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Health check failed after 10 attempts${NC}"
        echo "Container logs:"
        docker-compose -f docker-compose.staging.yml logs --tail=20
        exit 1
    fi
    echo "Attempt $i/10 - waiting..."
    sleep 5
done

# Start/restart Caddy if needed
echo -e "${YELLOW}🌐 Starting/restarting reverse proxy...${NC}"
if brew services list | grep caddy | grep started >/dev/null; then
    brew services restart caddy
else
    brew services start caddy
fi

# Show deployment status
echo ""
echo -e "${GREEN}🎉 CMO App deployed successfully!${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "  • App URL: http://localhost:3456"
echo "  • Health Check: http://localhost:3456/health"
echo "  • Public URLs (when DNS configured):"
echo "    - https://cmo.figmints.net"
echo "    - https://cmo-staging.figmints.net"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.staging.yml ps

echo ""
echo -e "${YELLOW}🔧 Next steps:${NC}"
echo "1. Configure DNS for figmints.net to point to this server"
echo "2. Ensure ports 80 and 443 are accessible from the internet"
echo "3. Test the deployment at the configured domains"

echo ""
echo "📝 To view logs: docker-compose -f docker-compose.staging.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.staging.yml down"