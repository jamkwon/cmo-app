# CMO App - Cloudflare Pages Deployment

This document describes the migration from Render to Cloudflare Pages.

## Architecture

- **Frontend**: React + Vite (built to static files)
- **Backend**: Cloudflare Functions (serverless)
- **Database**: Cloudflare D1 (SQLite-compatible)

## Deployment Steps

### 1. Database Setup

First, create the D1 database:

```bash
# Install wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create cmo-app-db
```

Copy the database ID from the output and update `wrangler.toml`.

### 2. Database Migration

```bash
# Apply the database schema
wrangler d1 execute cmo-app-db --file=./migrations/0001_initial.sql
```

### 3. Cloudflare Pages Deployment

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** > **Create a project**
3. Connect your GitHub account and select `jamkwon/cmo-app`
4. Configure build settings:
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `/` (root)
   - **Root directory**: `/` (root)
   - **Node.js version**: `18` or higher

### 4. Environment Variables

In Cloudflare Pages settings, add:

- `NODE_ENV`: `production`
- `JWT_SECRET`: (generate a secure secret)

### 5. DNS Configuration

To set up `cmo.figmints.net`:

1. Go to Cloudflare DNS settings for `figmints.net`
2. Add a CNAME record:
   - **Type**: CNAME
   - **Name**: `cmo`
   - **Target**: `[your-pages-project-name].pages.dev`
   - **Proxy status**: Proxied

## API Endpoints

The Cloudflare Functions handle these routes:

- `/api/auth/*` - Authentication (login, logout, user management)
- `/api/clients/*` - Client management
- `/api/meetings/*` - Meeting management
- `/api/health` - Health check

## Database Schema

The D1 database includes tables for:

- `users` - User authentication and roles
- `clients` - Client information
- `meetings` - Meeting records
- `big_wins` - Meeting big wins
- `scorecard_items` - Performance metrics
- `todos` - Task management
- `campaign_updates` - Campaign progress
- And more...

## Migration Notes

### Differences from Render Deployment

1. **Database**: SQLite (better-sqlite3) → Cloudflare D1
2. **Server**: Express.js → Cloudflare Functions
3. **Authentication**: JWT with bcrypt (same approach)
4. **Routing**: Express routes → Function-based routing

### Benefits

- **Performance**: Global edge deployment
- **Reliability**: No server management, auto-scaling
- **Cost**: More predictable pricing
- **Security**: Built-in DDoS protection and security features

## Local Development

For local development, you can still use the original Express.js server:

```bash
npm run dev  # Runs both client and server locally
```

Or test with Cloudflare locally:

```bash
wrangler pages dev --compatibility-date=2024-12-01
```

## Troubleshooting

- **Function errors**: Check Cloudflare Pages Functions logs
- **Database issues**: Use `wrangler d1 execute` to run queries manually
- **Build failures**: Ensure Node.js version compatibility
- **CORS issues**: Functions include CORS headers by default