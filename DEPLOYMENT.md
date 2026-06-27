# MovieMatcher — Deployment Guide

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` (or next available port)

- **Frontend**: Vite dev server on port 5173+
- **Backend**: Watchlist API server on port 3001
- Both start together with `npm run dev`

### Local Environment

Create `.env` file:
```
VITE_TMDB_API_KEY=your_tmdb_key_here
```

## Production Deployment (Cloudflare Pages + GitHub)

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial MovieMatcher"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/MovieMatcher.git
git push -u origin main
```

### 2. Set Up Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Pages** → **Connect to Git**
3. Select `MovieMatcher` repository
4. Build settings:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Build output: `dist`
5. **Save and Deploy**

### 3. Add Environment Variables

In Cloudflare Pages:
1. **Settings** → **Environment variables**
2. Add:
   - Name: `VITE_TMDB_API_KEY`
   - Value: `32f9f45260082919fa86cb8a052d3b88`
3. **Redeploy** (trigger new build)

### 4. How It Works

- **Frontend**: Served by Cloudflare Pages CDN
- **Backend API** (`/api/watchlist`): Handled by `functions/api/watchlist.js` (Cloudflare Functions)
  - Scrapes Letterboxd watchlist server-side
  - Returns JSON with all movies
- **TMDB enrichment**: Optional via `VITE_TMDB_API_KEY`

### 5. Live URL

After first deploy, you'll get a URL like:
```
https://moviematcher-xyz.pages.dev
```

Automatic re-deploy on every `git push` to `main`

## Cost

✅ **Free**
- Cloudflare Pages: Free for public repos
- Cloudflare Functions: 100,000 calls/month free
- TMDB API: Free tier
- GitHub: Free public repos

No credit card required beyond what you already have for TMDB.

## Troubleshooting

### Build fails
- Run `npm run build` locally to verify
- Check Node.js version (14+ required)

### Watchlist returns empty
- Verify Letterboxd profile is public
- Check CORS errors in browser console
- Watchlist must have at least 1 movie

### TMDB images don't show
- Verify `VITE_TMDB_API_KEY` is set in Cloudflare env vars
- Redeploy after adding env var
- Check API key is valid: https://www.themoviedb.org/settings/api

## Customization

- **Questions**: Edit `src/utils/filter.js` → `QUESTIONS` array
- **Styling**: Edit `src/App.css`
- **API pagination**: Edit `functions/api/watchlist.js` → `fetchPage()`
