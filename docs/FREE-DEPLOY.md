# Free live deployment — UI + backend on ONE URL

**Best free option:** [Fly.io](https://fly.io) — full app (Angular + Java) at **https://airbook-enterprise.fly.dev**

Cost: **$0** on free tier (app sleeps when idle; first visit may take ~30–60s to wake).

---

## Option A — GitHub Actions (easiest, no local install)

1. Create a free Fly account: https://fly.io/app/sign-up  
2. Install Fly CLI once on your PC, then create a deploy token:
   ```bash
   fly auth login
   fly tokens create deploy -x 999999h
   ```
3. GitHub → **Ganesh707-dot/IBS-AirBook** → **Settings** → **Secrets and variables** → **Actions**  
   Add secret: `FLY_API_TOKEN` = paste the token  
4. GitHub → **Actions** → **Deploy to Fly.io (free — UI + API one URL)** → **Run workflow**  
5. Wait ~5–8 minutes. Open: **https://airbook-enterprise.fly.dev**

First load after idle: wait up to 60 seconds, then refresh.

---

## Option B — Fly CLI on your machine

```bash
fly auth login
cd IBS-AirBook
fly secrets set JWT_SECRET="pick-a-long-random-string-here"
bash scripts/build-all.sh
fly deploy --dockerfile Dockerfile.prod
```

Live URL: **https://airbook-enterprise.fly.dev**

---

## Option C — Cloudflare Pages (UI only, needs backend)

Fast CDN for users, but **login/API need Fly backend** too.

1. Deploy backend first (Option A or B)  
2. Cloudflare → Pages → Connect GitHub → repo `IBS-AirBook`  
3. Root: `frontend/airbook-ui` · Build: `npm ci && npm run build` · Output: `dist/airbook-ui/browser`  
4. Env var: `API_ORIGIN=https://airbook-enterprise.fly.dev`  
5. Share: **https://ibs-airbook.pages.dev** (or your project name)

---

## Option D — Render (backup, less reliable on free)

Connect GitHub to Render using `render.yaml`. URL: **https://airbook.onrender.com**

Free tier cold-starts often fail or take 90+ seconds. Prefer Fly.io for demos.

---

## Demo logins (all options)

| Role | Email | Password |
|------|-------|----------|
| Traveler | customer@airbook.com | customer123 |
| Analyst | analyst@airbook.com | analyst123 |
| Admin | admin@airbook.com | admin123 |

---

## Resume link

After Fly deploy succeeds, use:

**https://airbook-enterprise.fly.dev**

GitHub backup: **https://github.com/Ganesh707-dot/IBS-AirBook**
