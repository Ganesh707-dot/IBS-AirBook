# Free Deployment — AirBook Enterprise

How to host AirBook for **$0** with UI and Java API together.

---

## Currently live (Render free)

| | |
|---|---|
| **URL** | https://airbook-glvv.onrender.com |
| **Cost** | $0 / month |
| **Credit card** | Not required |
| **Includes** | Angular UI + Spring Boot API (one link) |

First visit after idle: wait **30–90 seconds**, then refresh.

---

## Option comparison

| Platform | Free forever? | UI + API | Card needed | Best for |
|----------|---------------|----------|-------------|----------|
| **Render** | Yes (with limits) | Yes | No | **Resume / manager demo** |
| Fly.io | No (trial only) | Yes | After trial | Faster wake if paid |
| Cloudflare Pages | Yes | UI only | No | Fast CDN front-end |
| Docker local | Yes | Yes | — | Development |

---

## Option A — Render (recommended, already deployed)

### One-time setup

1. https://dashboard.render.com/register → Sign up with GitHub
2. **New +** → **Blueprint** → connect `Ganesh707-dot/IBS-AirBook`
3. Leave `GROQ_API_KEY` empty → **Apply**
4. Wait 10–20 min → status **Live**

### Your URL

Render assigns a URL like `https://airbook-<id>.onrender.com`. Copy from dashboard.

### Redeploy after git push

Push to `main` → Render auto-rebuilds.

Full guide: [deployment.md](./deployment.md#5-render-free-recommended--live-now)

---

## Option B — Fly.io (trial, then paid)

Fly.io removed permanent free tier for new accounts. Trial = 2 VM hours or 7 days.

```bash
fly auth login
fly tokens create deploy -x 999999h
# Add FLY_API_TOKEN to GitHub Secrets
# Run GitHub Action: Deploy to Fly.io
```

URL: https://airbook-enterprise.fly.dev

---

## Option C — Cloudflare Pages (UI) + Render (API)

1. Backend on Render (Option A)
2. Cloudflare Pages → connect GitHub → root `frontend/airbook-ui`
3. Env: `API_ORIGIN=https://airbook-glvv.onrender.com`
4. Share: `https://<project>.pages.dev`

See: [CLOUDFLARE-DEPLOY.md](./CLOUDFLARE-DEPLOY.md)

---

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Traveler | customer@airbook.com | customer123 |
| Analyst | analyst@airbook.com | analyst123 |
| Admin | admin@airbook.com | admin123 |

---

## Resume links

**Live demo:** https://airbook-glvv.onrender.com  
**GitHub:** https://github.com/Ganesh707-dot/IBS-AirBook

Example resume line:

> **AirBook Enterprise** — Full-stack IBS-style travel commerce platform (Java Spring Boot, Angular, RBAC, OOSD booking, hotels/cruise/cargo/loyalty, live flight/FX/weather APIs)  
> Live: https://airbook-glvv.onrender.com · GitHub: https://github.com/Ganesh707-dot/IBS-AirBook
