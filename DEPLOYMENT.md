# Deployment Guide - Mochi PWA

## Cloudflare Pages Deployment

This project is configured to deploy to Cloudflare Pages for global edge distribution with zero cold starts.

### Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com
2. **GitHub Integration**: Connect your Cloudflare account to GitHub
3. **API Credentials**: Create an API token in Cloudflare dashboard

### Option 1: Automatic Deployment (Recommended)

Connect your GitHub repository to Cloudflare Pages:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Select **Connect to Git** → Choose your GitHub repository
4. Configure build settings:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Add environment variables (if needed):
   - No required environment variables for this PWA
6. Click **Save and Deploy**

The project will automatically deploy on every push to `master` or `claude/egg-timer-stats-kvMOE` branches.

### Option 2: GitHub Actions Deployment

The `.github/workflows/deploy.yml` workflow handles automatic deployment.

**Required GitHub Secrets:**
```
CLOUDFLARE_API_TOKEN     # Your Cloudflare API token
CLOUDFLARE_ACCOUNT_ID    # Your Cloudflare Account ID
```

**To add secrets:**
1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add both secrets above

### Option 3: Manual Deployment with Wrangler

Deploy manually using Cloudflare's Wrangler CLI:

```bash
# Install wrangler
npm install -g wrangler

# Build the app
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=mochi-ai-pet
```

## Checking Deployment Status

### Cloudflare Dashboard
1. Go to **Pages** in Cloudflare dashboard
2. Click **mochi-ai-pet**
3. View deployments and production URL

### GitHub Actions
Check deployment logs in your GitHub repository:
- **Actions** → **Deploy to Cloudflare Pages** → Select latest run

## Performance Features

Cloudflare Pages includes:
- ✅ Global CDN distribution (edge locations worldwide)
- ✅ Automatic HTTPS/TLS
- ✅ DDoS protection included
- ✅ Automatic compression (gzip/brotli)
- ✅ Cache headers optimization

## Domain Configuration

To use a custom domain:
1. Go to your Cloudflare Pages project settings
2. Click **Custom domains**
3. Add your domain
4. Update DNS records as instructed

## Build Output

The production build outputs to `dist/`:
- **Size**: ~37KB gzipped (all assets included)
- **Format**: Single-page app with service worker
- **Assets**: All bundled and optimized by Vite

## Troubleshooting

### Build fails
- Check Node.js version: `node --version` (requires v20+)
- Verify dependencies: `npm ci`
- Review build log in Cloudflare dashboard

### Pages not updating
- Check GitHub Actions workflow status
- Verify API token hasn't expired
- Clear Cloudflare cache: Project Settings → Purge Cache

### Performance issues
- Check Cloudflare Analytics in dashboard
- Verify service worker registration in browser DevTools
- Check browser Network tab for asset sizes

## Development vs Production

### Development
```bash
npm run dev    # Local dev server at http://localhost:3000
```

### Production
```bash
npm run build  # Creates optimized `dist/` folder
npm run preview  # Preview production build locally
```

## CI/CD Pipeline

The deployment workflow:
1. Triggers on push to `master` or feature branches
2. Runs `npm ci` (clean install)
3. Runs `npm run build` (Vite build)
4. Uploads `dist/` to Cloudflare Pages
5. Gets automatic HTTPS + CDN distribution

## Support

For Cloudflare Pages documentation:
- https://developers.cloudflare.com/pages/

For Wrangler CLI:
- https://developers.cloudflare.com/workers/wrangler/install-and-update/
