# 🏗️ FIGMINTS Staging Infrastructure Setup

## Overview

This document outlines the staging deployment setup for the CMO app on the figmints.net infrastructure using the Mac Mini as the hosting platform.

## 🏗️ Infrastructure Architecture

```
Internet → Domain (figmints.net) → Caddy (Reverse Proxy + SSL) → Docker Container (CMO App)
```

### Components Installed:
- **Docker Desktop**: Container runtime for the CMO app
- **Caddy**: Web server with automatic HTTPS/SSL certificates
- **Docker Compose**: Container orchestration for staging deployment

## 🌐 Domain Configuration

### Subdomains Setup:
- **Primary**: `cmo.figmints.net` 
- **Staging**: `cmo-staging.figmints.net` (alternative access)

### DNS Requirements:
Both domains need to be configured in your DNS provider to point to this Mac Mini's public IP address:

```
A    cmo.figmints.net          → [MAC_MINI_PUBLIC_IP]
A    cmo-staging.figmints.net  → [MAC_MINI_PUBLIC_IP]
A    figmints.net              → [MAC_MINI_PUBLIC_IP]  (main domain)
```

## 🚀 Deployment Process

### Files Created:
1. `docker-compose.staging.yml` - Container orchestration
2. `/opt/homebrew/etc/Caddyfile` - Reverse proxy configuration
3. `deploy-staging.sh` - Automated deployment script
4. This documentation file

### Deployment Command:
```bash
cd /Users/brad/projects/cmo-app
./deploy-staging.sh
```

## 🔧 Configuration Details

### Container Configuration:
- **Port**: 3456 (internal)
- **Database**: SQLite (persistent volume)
- **Environment**: Production
- **Health Checks**: Enabled with `/health` endpoint
- **Restart Policy**: Unless stopped

### Caddy Configuration:
- **SSL**: Automatic Let's Encrypt certificates
- **Security Headers**: Applied for production security
- **Compression**: Gzip enabled
- **Static Asset Caching**: Optimized for performance
- **Health Check Route**: Direct passthrough

## 🛡️ Security Features

### Implemented:
- ✅ Automatic HTTPS with Let's Encrypt
- ✅ Security headers (XSS protection, HSTS, etc.)
- ✅ Server header removal
- ✅ Content type validation

### Network Security:
- Container isolated in custom network
- Only necessary ports exposed
- Health check monitoring

## 📊 Monitoring & Health

### Health Check:
- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts

### Logs:
```bash
# View app logs
docker-compose -f docker-compose.staging.yml logs -f

# View Caddy logs
brew services log caddy
```

## 🔧 Management Commands

### Start/Stop Services:
```bash
# Start everything
./deploy-staging.sh

# Stop containers
docker-compose -f docker-compose.staging.yml down

# Restart just Caddy
brew services restart caddy

# Check service status
docker-compose -f docker-compose.staging.yml ps
brew services list | grep caddy
```

### Database Management:
```bash
# Access database (if needed)
docker exec -it cmo-staging sqlite3 /app/server/cmo.db
```

## 🌍 Network Requirements

### Firewall/Router Configuration:
Ensure these ports are accessible from the internet:
- **Port 80 (HTTP)**: For Let's Encrypt certificate challenges
- **Port 443 (HTTPS)**: For secure web traffic
- **Port 22 (SSH)**: For remote management (optional)

### Local Testing:
Before DNS configuration, test locally:
- `http://localhost:3456` - Direct container access
- `http://localhost` - Through Caddy (local test)

## 📋 Pre-Production Checklist

### Before Going Live:
- [ ] Configure DNS records for figmints.net domains
- [ ] Ensure Mac Mini has static public IP or dynamic DNS
- [ ] Test port 80/443 accessibility from external networks
- [ ] Verify SSL certificate generation
- [ ] Test all app functionality in staging environment
- [ ] Set up monitoring/alerting for service health
- [ ] Create backup procedures for database

### Post-Deployment Verification:
- [ ] SSL certificate valid and auto-renewing
- [ ] Health checks passing
- [ ] App functionality working end-to-end
- [ ] Performance acceptable under load
- [ ] Security headers properly configured

## 🆘 Troubleshooting

### Common Issues:
1. **Docker not running**: Start Docker Desktop
2. **Port conflicts**: Check what's using ports 80/443/3456
3. **SSL issues**: Verify DNS points to correct IP
4. **Container won't start**: Check logs and health status

### Debug Commands:
```bash
# Check what's using ports
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3456

# Test connectivity
curl -I http://localhost:3456/health
curl -I https://cmo.figmints.net/health

# Container debugging
docker exec -it cmo-staging /bin/sh
```

## 📞 Support

For issues with this deployment:
1. Check container and Caddy logs
2. Verify DNS configuration
3. Test network connectivity
4. Review this documentation

## 🔄 Updates & Maintenance

### Updating the App:
1. Pull latest code: `git pull origin main`
2. Run deployment script: `./deploy-staging.sh`
3. Monitor health checks

### System Maintenance:
- Regular Docker image cleanup
- Database backups
- SSL certificate monitoring (auto-renewal)
- Security updates for base system

---

**Status**: Ready for DNS configuration and live deployment
**Last Updated**: January 2025
**Environment**: figmints.net staging on Mac Mini