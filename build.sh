#!/bin/bash

# CMO App Cloudflare Pages Build Script
echo "🚀 Starting CMO App build for Cloudflare Pages..."

# Ensure we're in the root directory
cd "$(dirname "$0")" || exit 1

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Run the Cloudflare-specific build
echo "🔨 Building React client app..."
npm run build:cloudflare

echo "✅ Build completed successfully!"
echo "📁 Build output is in the root directory"

# List built files
ls -la index.html assets/ 2>/dev/null || echo "❌ Build files not found"