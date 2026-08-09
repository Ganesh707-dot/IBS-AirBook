# AirBook Enterprise — IBS-Style Travel Commerce Platform

> **Live demo:** https://airbook-glvv.onrender.com  
> **GitHub:** https://github.com/Ganesh707-dot/IBS-AirBook  
> **Author:** Ganesh V · [LinkedIn](https://linkedin.com/in/ganesh-v-2564bb21a)

Full-stack airline retail platform inspired by **IBS Software** domains — passenger retail (iFly), hospitality (iStay), cruise, cargo (iCargo), loyalty (iLoyal), and AI-assisted travel (Naviq-style concierge). Built with **Java Spring Boot** + **Angular 19** + **PrimeNG**, with enterprise RBAC and real free external APIs where available.

---

## Quick links

| Document | Description |
|----------|-------------|
| [Software architecture](docs/architecture.md) | Modules, OOSD flow, RBAC, AI design, external APIs |
| [User manual](docs/user-manual.md) | How to use every feature — booking, BI, admin, hotels, cruise |
| [Deployment guide](docs/deployment.md) | Local, Docker, Render, Fly.io, Cloudflare — step by step |
| [Free deployment](docs/FREE-DEPLOY.md) | $0 hosting options compared |
| [IBS interview demo](docs/IBS-INTERVIEW-DEMO.md) | 5-minute manager walkthrough script |

---

## Live demo credentials

| Role | Email | Password | Landing page |
|------|-------|----------|--------------|
| **Traveler** | `customer@airbook.com` | `customer123` | `/dashboard` |
| **Analyst** | `analyst@airbook.com` | `analyst123` | `/bi` |
| **Admin** | `admin@airbook.com` | `admin123` | `/admin` |

> **Note:** First visit on free Render may take **30–90 seconds** to wake up. Refresh once if loading.

---

## Platform modules

| Module | Route | Backend API | Description |
|--------|-------|-------------|-------------|
| Passenger retail | `/search` | `/api/offers`, `/api/orders` | Dynamic flight search + OOSD booking |
| Luxury hotels | `/stays` | `/api/platform/stays` | Hospitality catalog + reserve |
| Cruise | `/cruise` | `/api/platform/cruises` | Cruise packages + book |
| Cargo intelligence | `/cargo` | `/api/platform/cargo/lanes` | Freight lane catalog |
| Loyalty | `/loyalty` | `/api/platform/loyalty` | Tiers, partners, earn/burn |
| AI concierge | `/concierge` | `/api/platform/concierge/ask` | Domain-aware travel assistant |
| Live tracker | `/tracker` | `/api/market/live-flights` | OpenSky ADS-B map |
| Retail BI | `/bi` | `/api/analytics`, `/api/ai` | KPIs, insights, NL Q&A |
| Ops CMS | `/admin` | `/api/catalog/routes` | Route catalog management |
| My journey | `/dashboard`, `/bookings` | `/api/orders`, `/api/platform/reservations` | Trips + hotel/cruise refs |

---

## Architecture (high level)

```
┌─────────────────────────────────────────────────────────────┐
│  Angular 19 SPA (PrimeNG) — role-based routes & guards      │
│  home · search · stays · cruise · cargo · loyalty · bi ...  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + JWT (/api/*)
┌──────────────────────────▼──────────────────────────────────┐
│  Spring Boot 3.2 Modular Monolith (Java 17)                 │
│  ┌─────────┬─────────┬─────────┬──────────┬───────────────┐ │
│  │  auth   │  offer  │  order  │  settle  │   deliver     │ │
│  ├─────────┼─────────┼─────────┼──────────┼───────────────┤ │
│  │ catalog │ pricing │analytics│    ai    │   platform    │ │
│  ├─────────┴─────────┴─────────┴──────────┴───────────────┤ │
│  │  market  ←  OpenSky · Frankfurter · Open-Meteo          │ │
│  └─────────────────────────────────────────────────────────┘ │
│  H2 (prod demo) · PostgreSQL (docker profile)               │
└─────────────────────────────────────────────────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for full module map, security matrix, and data sources.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 19, PrimeNG 19, Chart.js, Leaflet |
| Backend | Java 17, Spring Boot 3.2, Spring Security (JWT), JPA |
| Database | H2 in-memory (prod demo) · PostgreSQL (Docker Compose) |
| External APIs | OpenSky (flights), Frankfurter (FX), Open-Meteo (weather), Groq optional (AI) |
| Deploy | Docker all-in-one JAR · Render · Fly.io · Cloudflare Pages |

---

## Enterprise capabilities

| Capability | Implementation |
|------------|----------------|
| OOSD lifecycle | Offer → Order → Settle → Deliver with real status transitions |
| Dynamic pricing | RM engine: demand × DOW × lead-time × fare family × FX |
| Live market data | OpenSky ADS-B, Frankfurter EUR→INR, Open-Meteo weather |
| RBAC | `ADMIN` · `ANALYST` · `CUSTOMER` — separate workspaces |
| Hospitality / cruise booking | Real reservation APIs persisted to DB (`HTL…` / `CRZ…` refs) |
| AI retail analyst | Local KPI-grounded insights + optional Groq LLM |
| API documentation | OpenAPI / Swagger UI at `/swagger-ui.html` |
| Health | `/api/health` — version + timestamp |

---

## Local development

### Backend
```bash
cd backend
mvn spring-boot:run
```
- API: http://localhost:8080  
- Swagger: http://localhost:8080/swagger-ui.html  
- Health: http://localhost:8080/api/health  

### Frontend
```bash
cd frontend/airbook-ui
npm install
npm start
```
- UI: http://localhost:4200  

### Docker (all-in-one)
```bash
docker build -t ibs-airbook .
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod ibs-airbook
```
Open http://localhost:8080

---

## Deployment

**Currently live on Render (free):** https://airbook-glvv.onrender.com

Full instructions: **[docs/deployment.md](docs/deployment.md)**

| Platform | Cost | One URL for UI+API | Notes |
|----------|------|-------------------|-------|
| **Render** | Free | Yes | Live now; 30–90s cold start |
| Fly.io | Trial / paid | Yes | Faster wake; card required after trial |
| Cloudflare Pages | Free | UI only | Needs separate API backend |
| Docker local/VPS | Varies | Yes | Best for dev / private demo |

---

## Key API endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | Public | JWT login |
| GET | `/api/offers/search` | Public | Dynamic flight offers |
| POST | `/api/orders` | Customer+ | Create booking |
| POST | `/api/settle` | Customer+ | Payment settlement |
| POST | `/api/checkin/{ref}` | Customer+ | Web check-in |
| GET | `/api/platform/stays` | Public | Hotel catalog |
| POST | `/api/platform/stays/{id}/book` | Auth | Hotel reservation |
| GET | `/api/analytics/dashboard` | Analyst/Admin | BI KPIs |
| POST | `/api/ai/ask` | Analyst/Admin | NL retail Q&A |
| GET | `/api/market/pulse` | Public | FX + weather + demand |
| GET | `/api/health` | Public | Health check |

Full API list: [docs/architecture.md](docs/architecture.md)

---

## Project structure

```
IBS-AirBook/
├── backend/                 # Spring Boot API
│   └── src/main/java/com/ibs/airbook/
│       ├── auth/            # JWT + RBAC
│       ├── offer/ order/ settle/ deliver/   # OOSD
│       ├── platform/        # Hotels, cruise, cargo, loyalty, concierge
│       ├── analytics/ ai/   # BI + retail intelligence
│       ├── market/          # Live tracker + pulse
│       └── integration/     # OpenSky, Frankfurter, Open-Meteo
├── frontend/airbook-ui/     # Angular 19 SPA
├── docs/                    # Architecture, user manual, deployment
├── Dockerfile               # All-in-one production build
├── Dockerfile.prod          # Fast CI/Fly build (pre-built static)
├── render.yaml              # Render Blueprint
├── fly.toml                 # Fly.io config
└── scripts/build-all.sh     # Build UI + embed into backend
```

---

## Author

**Ganesh V** — [GitHub](https://github.com/Ganesh707-dot) · [LinkedIn](https://linkedin.com/in/ganesh-v-2564bb21a)
