# Deployment Guide — AirBook Enterprise

Step-by-step instructions to run and publish AirBook locally or on free cloud hosting.

**Live production URL:** https://airbook-glvv.onrender.com

---

## Table of contents

1. [Deployment options compared](#1-deployment-options-compared)
2. [Local development](#2-local-development)
3. [Docker all-in-one](#3-docker-all-in-one)
4. [Docker Compose (PostgreSQL)](#4-docker-compose-postgresql)
5. [Render free (recommended — live now)](#5-render-free-recommended--live-now)
6. [Fly.io](#6-flyio)
7. [Cloudflare Pages (frontend CDN)](#7-cloudflare-pages-frontend-cdn)
8. [Environment variables](#8-environment-variables)
9. [Health check & verification](#9-health-check--verification)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Deployment options compared

| Platform | Cost | UI + API one URL | Credit card | Cold start | Status |
|----------|------|------------------|-------------|------------|--------|
| **Render** | Free | Yes | No | 30–90s | **Live** |
| Fly.io | Trial then paid | Yes | After trial | 15–45s | Config ready |
| Cloudflare Pages | Free | UI only* | No | Instant UI | Config ready |
| Docker local | Free | Yes | — | None | Dev |
| Docker Compose | Free | Yes | — | None | Dev + Postgres |

*Cloudflare Pages serves the Angular UI; `/api/*` is proxied to a backend via Pages Function.

---

## 2. Local development

Best for coding and debugging with hot reload.

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 20+ and npm

### Backend

```bash
cd backend
mvn spring-boot:run
```

| URL | Purpose |
|-----|---------|
| http://localhost:8080/api/health | Health check |
| http://localhost:8080/swagger-ui.html | API documentation |
| http://localhost:8080/api/offers/search?origin=DXB&destination=COK&travelDate=2026-09-01 | Test offers |

### Frontend (separate dev server)

```bash
cd frontend/airbook-ui
npm install
npm start
```

| URL | Purpose |
|-----|---------|
| http://localhost:4200 | Angular dev server |
| API proxy | Calls `http://localhost:8080/api` via `environment.ts` |

---

## 3. Docker all-in-one

Builds Angular into Spring Boot static resources — **one container, one URL**.

### Build and run

```bash
# From repo root
docker build -t airbook .
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e JWT_SECRET="your-long-random-secret" \
  airbook
```

Open: **http://localhost:8080**

### What the Dockerfile does

```
Stage 1 (node:22)     → npm ci + ng build → dist/airbook-ui/browser
Stage 2 (temurin:17)  → mvn package with static files embedded
Stage 3 (jre:17)      → run app.jar on port 8080
```

Build time: ~8–15 minutes first run (cached layers are faster).

### Fast production build (CI / Fly.io)

For faster deploys when UI is pre-built on the CI runner:

```bash
bash scripts/build-all.sh          # builds Angular → copies to backend/static
docker build -f Dockerfile.prod -t airbook .
```

---

## 4. Docker Compose (PostgreSQL)

Persistent PostgreSQL instead of in-memory H2.

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| API + UI | http://localhost:8080 |
| Frontend nginx | http://localhost:4200 |
| PostgreSQL | localhost:5432 (user: `airbook`, pass: `airbook123`) |

Uses `SPRING_PROFILES_ACTIVE=docker`.

---

## 5. Render free (recommended — live now)

**Current live URL:** https://airbook-glvv.onrender.com

No credit card required. Full UI + Java API in one Docker container.

### First-time setup

1. Create account: https://dashboard.render.com/register
2. Sign up with **GitHub**
3. Click **New +** → **Blueprint**
4. Connect repository: **Ganesh707-dot/IBS-AirBook**
5. Render reads [`render.yaml`](../render.yaml) automatically
6. **GROQ_API_KEY** — leave **empty** (optional, not required)
7. Click **Apply** / **Deploy**
8. Wait **10–20 minutes** for first Docker build
9. Status turns **Live** → open your URL (shown at top of service page)

### Render service settings (from render.yaml)

| Setting | Value |
|---------|-------|
| Runtime | Docker |
| Dockerfile | `./Dockerfile` |
| Plan | Free |
| Region | Singapore |
| Health check | `/api/health` |
| Profile | `SPRING_PROFILES_ACTIVE=prod` |
| JVM | `-Xms64m -Xmx256m` (512MB instance) |

### Redeploy after code changes

1. Push to `main` on GitHub
2. Render auto-deploys, OR
3. Dashboard → your service → **Manual Deploy** → **Deploy latest commit**

### Render free tier behavior

- App **sleeps after ~15 min** of no traffic
- First request after sleep: **30–90 seconds** to wake
- Startup on deploy: **~4 minutes** (Spring Boot + JPA init)
- URL format: `https://<service-name>.onrender.com` (yours may differ from `airbook.onrender.com`)

---

## 6. Fly.io

Alternative for faster wake times. **Note:** Fly.io no longer offers permanent free hosting for new accounts — trial requires no card, continued use requires payment.

### Via GitHub Actions (no local CLI)

1. Create Fly account: https://fly.io/app/sign-up
2. Install Fly CLI → `fly auth login` → `fly tokens create deploy -x 999999h`
3. GitHub repo → **Settings** → **Secrets** → add `FLY_API_TOKEN`
4. **Actions** → **Deploy to Fly.io** → **Run workflow**
5. URL: **https://airbook-enterprise.fly.dev**

### Via local CLI

```bash
fly auth login
cd IBS-AirBook
fly secrets set JWT_SECRET="$(openssl rand -base64 32)"
bash scripts/build-all.sh
fly deploy --dockerfile Dockerfile.prod
```

Config: [`fly.toml`](../fly.toml)

---

## 7. Cloudflare Pages (frontend CDN)

Fast global CDN for the Angular UI. **Requires a separate backend** for API calls.

### Setup

1. Deploy backend first (Render or Fly.io)
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect Git**
3. Repository: `Ganesh707-dot/IBS-AirBook`

| Setting | Value |
|---------|-------|
| Root directory | `frontend/airbook-ui` |
| Build command | `npm ci && npm run build` |
| Build output | `dist/airbook-ui/browser` |
| Env var | `API_ORIGIN=https://airbook-glvv.onrender.com` |

4. Deploy → share `https://<project-name>.pages.dev`

The Pages Function at `functions/api/[[path]].ts` proxies `/api/*` to `API_ORIGIN`.

See also: [CLOUDFLARE-DEPLOY.md](./CLOUDFLARE-DEPLOY.md)

---

## 8. Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | Auto (Render/Fly) | `8080` | HTTP listen port |
| `SPRING_PROFILES_ACTIVE` | Recommended | — | `prod` (H2) or `docker` (Postgres) |
| `JWT_SECRET` | Prod recommended | built-in dev key | JWT signing secret |
| `JAVA_OPTS` | Optional | see Dockerfile | JVM heap settings |
| `GROQ_API_KEY` | **No** | empty | Optional Groq LLM for AI BI |
| `GROQ_MODEL` | No | `llama-3.1-8b-instant` | Groq model name |
| `CORS_ORIGINS` | No | localhost | Comma-separated allowed origins |
| `API_ORIGIN` | Cloudflare only | — | Backend URL for Pages proxy |

---

## 9. Health check & verification

After any deploy, verify:

```bash
curl https://airbook-glvv.onrender.com/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "AirBook Enterprise API",
  "version": "2.2.0",
  "timestamp": "2026-08-09T22:30:44.979Z"
}
```

### Smoke test checklist

- [ ] Home page loads
- [ ] Login as `customer@airbook.com` / `customer123`
- [ ] Flight search returns offers
- [ ] Hotels page shows properties
- [ ] Analyst login opens `/bi` dashboard
- [ ] Admin login opens `/admin` CMS

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Page never loads | Cold start / crash | Wait 90s, refresh; check Render Logs |
| Render "No open ports detected" during deploy | Slow Spring Boot startup (~4 min) | Normal — wait until "Your service is live" |
| `OutOfMemoryError` in logs | 512MB limit | Already tuned to `-Xmx256m`; redeploy latest |
| Login returns 401 | Wrong credentials | Use demo credentials from README |
| BI page redirects | Wrong role | Use analyst or admin account |
| OpenSky tracker empty | Rate limit | Wait 1–5 min, refresh |
| Build fails on Render | Docker timeout | Retry Manual Deploy |
| Wrong URL | Service name differs | Copy URL from Render dashboard top bar |

### Render logs

Dashboard → your service → **Logs** → scroll to bottom for errors.

### Local build verify

```bash
cd frontend/airbook-ui && npm run build
cd backend && mvn -DskipTests package
```

---

## Demo credentials (all environments)

| Role | Email | Password |
|------|-------|----------|
| Traveler | `customer@airbook.com` | `customer123` |
| Analyst | `analyst@airbook.com` | `analyst123` |
| Admin | `admin@airbook.com` | `admin123` |

---

## Related docs

- [FREE-DEPLOY.md](./FREE-DEPLOY.md) — free hosting options summary
- [architecture.md](./architecture.md) — technical design
- [user-manual.md](./user-manual.md) — feature guide
- [IBS-INTERVIEW-DEMO.md](./IBS-INTERVIEW-DEMO.md) — demo script
