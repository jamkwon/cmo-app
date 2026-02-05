#!/bin/bash

# CMO App Cloudflare Pages Deployment Script
# Run this script after setting up the D1 database

echo "🚀 CMO App Cloudflare Pages Deployment"
echo "========================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

echo "📋 Pre-deployment checklist:"
echo ""
echo "1. ✅ Repository pushed to GitHub (jamkwon/cmo-app)"
echo "2. ⏳ D1 database created and configured"
echo "3. ⏳ Cloudflare Pages project created"
echo "4. ⏳ DNS configured for cmo.figmints.net"
echo ""

# Test build locally
echo "🔨 Testing build process locally..."
npm run build:cloudflare

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Clean up build artifacts
    rm -rf assets/ index.html 2>/dev/null || true
    
    echo ""
    echo "🌐 Next Steps:"
    echo ""
    echo "1. Create D1 Database:"
    echo "   wrangler d1 create cmo-app-db"
    echo ""
    echo "2. Update wrangler.toml with the database ID"
    echo ""
    echo "3. Apply database schema:"
    echo "   wrangler d1 execute cmo-app-db --file=./migrations/0001_initial.sql"
    echo ""
    echo "4. Go to Cloudflare Pages and create a new project:"
    echo "   - Connect jamkwon/cmo-app repository"
    echo "   - Build command: npm run build:cloudflare"
    echo "   - Build output directory: / (root)"
    echo ""
    echo "5. Configure DNS:"
    echo "   - Add CNAME record: cmo.figmints.net → [your-pages-project].pages.dev"
    echo ""
    echo "🎉 The CMO app is ready for deployment!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi