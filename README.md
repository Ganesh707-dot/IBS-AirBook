# AirBook Enterprise — IBS Interview Demo Platform

> **Share this URL with users (recommended):** https://airbook-enterprise.pages.dev  
> **Backend API:** https://airbook-enterprise.fly.dev  
> **Setup guide:** [docs/CLOUDFLARE-DEPLOY.md](docs/CLOUDFLARE-DEPLOY.md)  
> **Repository:** https://github.com/Ganesh707-dot/IBS-AirBook

**Cloudflare Pages** = fast UI for all users. **Fly.io** = free Java API backend. One link, no Render cold-start issues.

## Quick deploy (free)

1. **Backend:** `fly auth login && fly deploy` → https://airbook-enterprise.fly.dev/api/health  
2. **Frontend:** Cloudflare Pages → connect GitHub → root `frontend/airbook-ui` → set `API_ORIGIN`  
3. **Share:** https://airbook-enterprise.pages.dev

## Manager / IBS demo (2 min)

| Step | Login | Show |
|------|-------|------|
| 1 | `customer@airbook.com` / `customer123` | Flights → book → Hotels/Cruise Reserve → My Journey |
| 2 | `analyst@airbook.com` / `analyst123` | Retail Intelligence BI |
| 3 | `admin@airbook.com` / `admin123` | Ops CMS + Intelligence |

Full script: **[docs/IBS-INTERVIEW-DEMO.md](docs/IBS-INTERVIEW-DEMO.md)**

## Docs

- [Technical architecture](docs/architecture.md) — modules, booking APIs, AI design  
- [User manual](docs/user-manual.md) — how to book, tracker, AI BI demo script  
- [Cloudflare Pages deploy](docs/CLOUDFLARE-DEPLOY.md) — **shareable URL for users**  
- [Deployment guide](docs/deployment.md) — local, Docker, Fly.io, Render  
- [IBS interview demo script](docs/IBS-INTERVIEW-DEMO.md) — 5-minute manager walkthrough

## Booking & AI (short answers)

**Booking works?** Yes — login as customer → Flights → Book wizard → Pay & confirm → My Trips / Check-in (real Order → Settle → Deliver APIs).

**AI is used for?** Retail BI & personalization — insights, natural-language analyst Q&A, ancillary upsell ranking during booking, demand forecast. Not for inventing live aircraft positions (that’s OpenSky).

## Live demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin / BI | `admin@airbook.com` | `admin123` |
| Customer | `customer@airbook.com` | `customer123` |
| Analyst | `analyst@airbook.com` | `analyst123` |

## Why this is enterprise-grade

| Capability | Implementation |
|------------|----------------|
| Dynamic offers | Generated per OD + travel date (haversine schedules, inventory, fare families) |
| Live demand | [OpenSky Network](https://opensky-network.org/) ADS-B (free) |
| FX-aware pricing | [Frankfurter](https://api.frankfurter.app/) ECB EUR→INR (free) |
| Destination weather | [Open-Meteo](https://api.open-meteo.com/) (free) |
| RM pricing | Demand × DOW × lead-time × fare-family multipliers |
| OOSD lifecycle | `PENDING_PAYMENT` → `SETTLED` → `CHECKED_IN` + boarding pass deliver |
| AI BI | Local retail analyst + optional [Groq](https://console.groq.com/) LLM (`GROQ_API_KEY`) |
| Analytics | KPI board, revenue trend, OOSD funnel, demand forecast |
| Security | JWT + enterprise RBAC (ADMIN / ANALYST / CUSTOMER) |
| Domains | Passenger retail · Hospitality · Cruise · Cargo · Loyalty · AI concierge |
| API docs | OpenAPI / Swagger UI |

## Architecture

```
Angular SPA ──REST/JWT──► Spring Boot Modular Monolith
                          ├ auth
                          ├ offer (+ dynamic generator)
                          ├ order / settle / deliver
                          ├ catalog (airports, ancillaries, CMS)
                          ├ pricing (RM engine)
                          ├ analytics (BI KPIs)
                          ├ ai (insights, NL ask, recommendations)
                          ├ market (OpenSky + Frankfurter + airports)
                          └ integration/*
```

## Quick start

### Backend

```bash
cd backend
mvn spring-boot:run
```

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/api/health`

### Frontend

```bash
cd frontend/airbook-ui
npm install
npm start
```

UI: `http://localhost:4200`

### Docker (all-in-one production image)

```bash
docker build -t ibs-airbook .
docker run -p 8080:8080 -e GROQ_API_KEY=optional_free_key ibs-airbook
```

Open `http://localhost:8080`

### Optional AI (Groq free tier)

```bash
export GROQ_API_KEY=gsk_xxx
```

Without a key, BI still works using the on-box retail analyst (`LOCAL_RETAIL_ANALYST` mode).

## Key API surface

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/offers/search?origin&destination&travelDate` | Dynamic offers |
| POST | `/api/orders` | Create order |
| POST | `/api/settle` | Settle payment |
| POST | `/api/checkin/{ref}` | Web check-in |
| GET | `/api/deliver/boarding-pass/{ref}` | Boarding pass |
| GET | `/api/market/pulse` | Live demand + FX |
| GET | `/api/market/airports` | 40 airport master |
| GET | `/api/analytics/dashboard` | BI payload |
| GET | `/api/ai/insights` | AI insights |
| POST | `/api/ai/ask` | NL BI Q&A |
| GET | `/api/ai/demand-forecast` | 7-day demand |
| GET | `/api/ai/ancillary-recommendations` | Ranked upsell |

## Interview talking points (15 LPA)

1. **Modular monolith** ready for microservice extraction along OOSD boundaries  
2. **External system integration** with resilience (cache + fallbacks)  
3. **Revenue management** pricing as a first-class domain service  
4. **AI for BI** with provider pluggability (local analyst ↔ Groq LLM)  
5. **Observable retail funnel** — Offer→Order→Settle→Deliver metrics  

## Author

**Ganesh V** — [GitHub](https://github.com/Ganesh707-dot) · [LinkedIn](https://linkedin.com/in/ganesh-v-2564bb21a)
