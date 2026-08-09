# Cloudflare Pages — shareable URL for users

One link for everyone: **https://airbook-enterprise.pages.dev**

- UI on Cloudflare CDN (instant load for users)
- API proxied via `/api/*` to Fly.io backend

## Step 1 — Backend (Fly.io, free)

```bash
fly auth login
cd IBS-AirBook
fly launch --no-deploy
fly secrets set JWT_SECRET="your-long-random-secret"
fly deploy
```

Test: https://airbook-enterprise.fly.dev/api/health → `"status":"UP"`

## Step 2 — Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect Git
2. Repo: `Ganesh707-dot/IBS-AirBook`
3. Settings:

| Setting | Value |
|---------|-------|
| Root directory | `frontend/airbook-ui` |
| Build command | `npm ci && npm run build` |
| Build output | `dist/airbook-ui/browser` |

4. Environment variable: `API_ORIGIN` = `https://airbook-enterprise.fly.dev`

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
