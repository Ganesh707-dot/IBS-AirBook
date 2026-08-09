# Cloudflare Pages — shareable URL for users

One link for everyone: **https://ibs-airbook.pages.dev** (after Cloudflare deploy)

- UI on Cloudflare CDN (instant load for users)
- API proxied via `/api/*` to Render backend

## Step 1 — Backend (Render, free — already live)

Live backend: **https://airbook-glvv.onrender.com**

Test: https://airbook-glvv.onrender.com/api/health → `"status":"UP"`

If you need to redeploy backend, see [deployment.md](./deployment.md#5-render-free-recommended--live-now).

## Step 2 — Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect Git
2. Repo: `Ganesh707-dot/IBS-AirBook`
3. Settings:

| Setting | Value |
|---------|-------|
| Root directory | `frontend/airbook-ui` |
| Build command | `npm ci && npm run build` |
| Build output | `dist/airbook-ui/browser` |

4. Environment variable: `API_ORIGIN` = `https://airbook-glvv.onrender.com`

5. Deploy → share **https://airbook-enterprise.pages.dev**

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Traveler | customer@airbook.com | customer123 |
| Analyst | analyst@airbook.com | analyst123 |
| Admin | admin@airbook.com | admin123 |

## CLI deploy

```bash
cd frontend/airbook-ui
npm ci && npm run build
npx wrangler pages deploy dist/airbook-ui/browser --project-name=airbook-enterprise
```

Set `API_ORIGIN` in Cloudflare Pages → Settings → Environment variables.
