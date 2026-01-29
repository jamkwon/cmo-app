# 🚂 Railway Deployment - Step by Step

## Quick Deploy Instructions

### 1. Access Railway
1. Go to [railway.app](https://railway.app)
2. Click "Sign up" or "Login"
3. **Choose "Continue with GitHub"** (recommended for team access)

### 2. Create Project
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Find and select `figmints/cmo-app`
4. Railway will automatically detect the configuration

### 3. Configure Environment
Railway should automatically detect the Dockerfile and configuration. Verify these settings:

**Build Settings:**
- ✅ Root Directory: `/` (should auto-detect)
- ✅ Build Command: Auto-detected from Dockerfile
- ✅ Start Command: `npm start --prefix server`

**Environment Variables:**
Add these in the Railway dashboard:
```
NODE_ENV=production
PORT=3456
```

### 4. Deploy
1. Click "Deploy" button
2. Watch the build logs (should take 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://[random-name].railway.app`

### 5. Test Deployment
1. Visit the provided URL
2. Check health endpoint: `https://[your-url].railway.app/health`
3. Verify the app loads correctly

## ⚡ One-Click Deploy

You can also use this direct deploy link:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Ffigmints%2Fcmo-app)

## 🎯 Expected Results

After successful deployment:
- **Frontend:** React app served from Railway
- **Backend:** Express API running on Railway
- **Database:** SQLite file stored in Railway container
- **URL:** Provided by Railway (can customize domain)

## 🔧 Troubleshooting

**If build fails:**
1. Check build logs in Railway dashboard
2. Ensure all dependencies are committed to git
3. Verify Dockerfile syntax

**If app doesn't load:**
1. Check health endpoint first
2. Review application logs in Railway
3. Verify environment variables

**If API calls fail:**
1. Check browser console for CORS errors
2. Verify API base URL configuration
3. Test API endpoints directly

## 👥 Team Access

Once deployed, share access:

1. **Share URL** with team for testing
2. **Add team members** to Railway project:
   - Go to Project Settings → Members
   - Invite by email or GitHub username
3. **GitHub access** - ensure team has repo access

## 🔄 Future Deployments

After initial setup, deployments are automatic:
1. Push changes to `main` branch
2. Railway auto-deploys new code
3. Zero downtime deployments

## 📱 Custom Domain (Optional)

To add custom domain:
1. Go to Railway project settings
2. Navigate to "Domains" tab  
3. Add your custom domain (e.g., `cmo.figmints.com`)
4. Update DNS records as instructed

---

**🚀 Ready to deploy!** Follow steps 1-5 above to get CMO app live for the FIGMINTS team.