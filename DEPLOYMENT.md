# 🚀 CMO App Deployment Guide

## Overview

The CMO (Client Meeting Organizer) app is now configured for production deployment using Railway. This guide covers the deployment process and team access setup.

## ✅ Pre-Deployment Configuration Completed

The following has been configured for production deployment:

### 1. Docker Configuration
- ✅ `Dockerfile` created for containerized deployment
- ✅ Multi-stage build process for efficiency
- ✅ Node.js 18 LTS base image
- ✅ Production build optimization

### 2. Server Configuration
- ✅ Server updated to serve static frontend files
- ✅ Catch-all route for React Router client-side routing
- ✅ Environment variable support (`PORT`)
- ✅ Health check endpoint at `/health`

### 3. Frontend Configuration
- ✅ API URLs configured for environment awareness
- ✅ Production build optimization
- ✅ Static asset handling

### 4. Git Configuration
- ✅ Repository: https://github.com/figmints/cmo-app.git
- ✅ All deployment files committed and pushed
- ✅ Clean git history with descriptive commit messages

## 🚂 Railway Deployment Steps

### Step 1: Create Railway Account & Project

1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub account (recommended for FIGMINTS team)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `figmints/cmo-app` repository

### Step 2: Configure Railway Project

**Environment Variables:**
```
NODE_ENV=production
PORT=3456
```

**Build Configuration:**
- Railway will automatically detect the Dockerfile
- Build path: `.` (root directory)
- Start command: `npm start --prefix server`

### Step 3: Database Setup (Optional)

For production, you may want to migrate from SQLite to PostgreSQL:

1. In Railway dashboard, click "Add Service"
2. Select "PostgreSQL"
3. Add environment variable: `DATABASE_URL` (Railway auto-provides this)
4. Update server to use PostgreSQL (migration needed)

### Step 4: Domain & Access

1. Railway will provide a default URL: `https://[random-name].railway.app`
2. Configure custom domain if needed
3. Share access with FIGMINTS team members

## 🔗 Access URLs (After Deployment)

- **Live Application:** `https://[your-railway-app].railway.app`
- **Health Check:** `https://[your-railway-app].railway.app/health`
- **API Base:** `https://[your-railway-app].railway.app/api`

## 👥 Team Collaboration Setup

### Railway Team Access

1. In Railway dashboard, go to Project Settings
2. Navigate to "Members" tab
3. Invite FIGMINTS team members:
   - Account managers
   - Strategists
   - Development team
   - Jam (admin access)

### GitHub Repository Access

Ensure team members have access to the repository:
- Repository: https://github.com/figmints/cmo-app.git
- Required access levels:
  - **Developers:** Write access for code changes
  - **Account Managers/Strategists:** Read access for transparency
  - **Jam:** Admin access

## 🔧 Alternative Hosting Options

If Railway doesn't meet needs, these alternatives are configured:

### Vercel (Frontend) + Backend Service
- Frontend: Deploy `client/` folder to Vercel
- Backend: Deploy `server/` to Railway, Heroku, or DigitalOcean
- Requires CORS configuration between services

### DigitalOcean App Platform
- Single Dockerfile supports full deployment
- Built-in database options
- Team collaboration features

### Netlify + Separate Backend
- Frontend: Netlify (with build command: `npm run build --prefix client`)
- Backend: Separate service (Railway, Heroku, etc.)

## 🚨 Production Considerations

### Security
- [ ] Add rate limiting to API endpoints
- [ ] Implement proper authentication for sensitive data
- [ ] Configure HTTPS (Railway handles this automatically)
- [ ] Add request validation and sanitization

### Performance
- [ ] Implement caching for static assets
- [ ] Add database indexing for frequently queried fields
- [ ] Monitor application performance
- [ ] Set up logging and error tracking

### Backup & Recovery
- [ ] Set up automated database backups
- [ ] Document data recovery procedures
- [ ] Version control for database migrations

## 📊 Monitoring & Maintenance

### Health Monitoring
- Health check endpoint: `/health`
- Monitor server uptime and response times
- Set up alerts for service outages

### Application Monitoring
- Monitor API endpoint performance
- Track user activity and meeting creation
- Database performance monitoring

### Updates & Maintenance
- Regular dependency updates
- Security patch management
- Feature deployments via Git

## 📞 Support & Contact

For deployment issues or questions:
- **Primary Contact:** Jam (FIGMINTS)
- **Repository Issues:** https://github.com/figmints/cmo-app/issues
- **Documentation:** This file and `README.md`

---

**Next Steps:** Follow the Railway deployment steps above to get the CMO app live for team access!