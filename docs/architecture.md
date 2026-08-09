# Software Architecture — AirBook Enterprise

Enterprise travel commerce platform modeled on **IBS Software** modular domains and **Offer → Order → Settle → Deliver (OOSD)** airline retail patterns.

---

## 1. System overview

AirBook is a **modular monolith**: one deployable unit (JAR/Docker) with clear domain boundaries that could be extracted into microservices later.

```
                    ┌──────────────────────────────────────┐
                    │         Browser (Angular 19 SPA)        │
                    │  PrimeNG · Chart.js · Leaflet         │
                    └─────────────────┬────────────────────┘
                                      │ HTTPS
                                      │ /api/*  REST + JWT Bearer
                    ┌─────────────────▼────────────────────┐
                    │     Spring Boot 3.2 (Java 17)         │
                    │  ┌──────────────────────────────────┐ │
                    │  │ SecurityFilterChain + JwtAuthFilter│ │
                    │  └──────────────────────────────────┘ │
                    │  Controllers → Services → Repositories  │
                    │  H2 (prod) / PostgreSQL (docker)        │
                    └─────────────────┬────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
        OpenSky Network        Frankfurter API           Open-Meteo
        (live flights)         (EUR→INR FX)              (weather)
              │                       │                       │
        Groq API (optional)     Demo catalog data      Seeded orders
        (LLM BI answers)        (hotels/cruise/cargo)  (analytics)
```

**Production deploy:** Angular build is embedded in `backend/src/main/resources/static/` and served by Spring Boot. SPA routing falls back to `index.html` via `SpaWebConfig`.

---

## 2. Technology stack

| Layer | Technology | Version |
|-------|------------|---------|
| UI framework | Angular | 19 |
| UI components | PrimeNG + PrimeIcons | 19 |
| Charts / maps | Chart.js, Leaflet | — |
| API | Spring Boot | 3.2.5 |
| Language | Java | 17 |
| Security | Spring Security + JWT (jjwt) | — |
| Persistence | Spring Data JPA | — |
| Database | H2 (mem, prod demo) / PostgreSQL (docker) | — |
| Cache | Caffeine | — |
| API docs | SpringDoc OpenAPI | — |
| Build | Maven (backend), npm (frontend) | — |
| Container | Docker multi-stage | — |

---

## 3. Backend module map

```
backend/src/main/java/com/ibs/airbook/
├── AirBookApplication.java
├── auth/
│   ├── User.java              # Roles: ADMIN, ANALYST, CUSTOMER
│   ├── AuthController.java    # POST /api/auth/login, GET /api/auth/me
│   ├── JwtAuthFilter.java
│   └── CustomUserDetailsService.java
├── offer/
│   ├── OfferController.java   # GET /api/offers/search, /{id}
│   ├── OfferService.java      # Dynamic route generation + inventory
│   └── Route.java / RouteRepository.java
├── order/
│   ├── OrderController.java   # POST /api/orders, GET /api/orders, /api/health
│   └── OrderService.java      # OOSD order creation, check-in
├── settle/
│   └── SettleController.java  # POST /api/settle
├── deliver/
│   └── DeliverController.java # GET /api/deliver/boarding-pass/{ref}
├── catalog/
│   └── CatalogController.java # GET/POST /api/catalog/routes, ancillaries
├── pricing/
│   └── DynamicPricingService.java  # RM: demand × DOW × lead-time × FX
├── analytics/
│   └── AnalyticsController.java    # /api/analytics/kpis, dashboard, funnel
├── ai/
│   ├── AiController.java      # insights, ask, recommendations, forecast
│   └── AiBiService.java       # Local analyst + optional Groq LLM
├── market/
│   └── MarketController.java  # pulse, live-flights, airports
├── platform/
│   ├── PlatformController.java   # stays, cruises, cargo, loyalty, concierge
│   ├── PlatformService.java      # Demo catalog + booking logic
│   └── PlatformReservation.java  # Hotel/cruise reservations in DB
├── integration/
│   ├── opensky/OpenSkyClient.java
│   ├── fx/FrankfurterClient.java
│   └── weather/OpenMeteoClient.java
└── config/
    ├── SecurityConfig.java    # RBAC rules
    ├── SpaWebConfig.java      # SPA fallback routing
    ├── DataInitializer.java   # Async demo seed (prod fast-start)
    └── CacheConfig.java
```

---

## 4. Frontend module map

```
frontend/airbook-ui/src/app/
├── core/
│   ├── services/
│   │   ├── api.service.ts       # All REST calls
│   │   └── auth.service.ts      # JWT, role signal, /me sync
│   ├── guards/
│   │   └── auth.guard.ts        # authGuard + roleGuard
│   └── interceptors/
│       └── auth.interceptor.ts  # Bearer token injection
├── app.component.ts             # Enterprise shell, Solutions mega-menu
├── app.routes.ts                # Role-based routing
└── features/
    ├── home/                    # Landing + IBS-style hero
    ├── search/                  # Flight search + booking wizard
    ├── stays/                   # Hotels — reserve via API
    ├── cruise/                  # Cruise packages — book via API
    ├── cargo/                   # Cargo lane catalog
    ├── loyalty/                 # Loyalty tiers + partners
    ├── concierge/               # AI tourist assistance
    ├── tracker/                 # OpenSky live map
    ├── dashboard/               # Customer portal
    ├── bookings/                # My trips (flights + reservations)
    ├── checkin/                 # Web check-in + boarding pass
    ├── bi/                      # Analyst BI command center
    ├── admin/                   # Route CMS
    └── login/                   # Role-based redirect after login
```

---

## 5. OOSD booking flow (passenger retail)

Real API workflow — not a UI mock:

```
1. OFFER   GET  /api/offers/search?origin=DXB&destination=COK&travelDate=2026-09-01
           → DynamicPricingService generates fares per inventory

2. ORDER   POST /api/orders
           Body: { offerId, passengers[], ancillaries[] }
           → status: PENDING_PAYMENT, bookingRef: AB...

3. SETTLE  POST /api/settle
           Body: { orderRef, method: "CARD"|"UPI"|"WALLET" }
           → status: SETTLED, paymentId assigned

4. DELIVER POST /api/checkin/{ref}
           → status: CHECKED_IN
           GET  /api/deliver/boarding-pass/{ref} → boarding pass JSON
```

**UI path:** Flights → Search → Book wizard (Passengers → Extras → Pay) → My Trips → Check-in

---

## 6. Platform commerce (hospitality, cruise, cargo, loyalty)

| Domain | Read API | Write API | Data source |
|--------|----------|-----------|-------------|
| Hotels | `GET /api/platform/stays` | `POST /api/platform/stays/{id}/book` | Curated demo inventory in `PlatformService` |
| Cruise | `GET /api/platform/cruises` | `POST /api/platform/cruises/{id}/book` | Curated demo inventory |
| Cargo | `GET /api/platform/cargo/lanes` | — | Demo lane catalog |
| Loyalty | `GET /api/platform/loyalty`, `/tiers`, `/partners` | — | Demo program data |
| Concierge | — | `POST /api/platform/concierge/ask` | Rule-based + domain context |
| Reservations | `GET /api/platform/reservations` | (via book endpoints) | `PlatformReservation` entity in DB |

Hotel/cruise **booking is real** — creates persisted reservations with `HTL…` / `CRZ…` reference codes shown on customer dashboard.

---

## 7. Security & RBAC

### Roles

| Role | Persona | Default landing |
|------|---------|-----------------|
| `CUSTOMER` | Traveler | `/dashboard` |
| `ANALYST` | Retail BI analyst | `/bi` |
| `ADMIN` | Platform ops | `/admin` |

### Endpoint access matrix

| Path pattern | CUSTOMER | ANALYST | ADMIN | Public |
|--------------|----------|---------|-------|--------|
| `/api/auth/login`, `/api/health` | — | — | — | ✓ |
| `/api/offers/**`, `/api/market/**` | — | — | — | ✓ |
| `/api/platform/solutions`, stays, cruises, cargo, loyalty | — | — | — | ✓ |
| `/api/orders`, `/api/settle`, `/api/checkin/**` | ✓ | ✓ | ✓ | — |
| `/api/ai/ancillary-recommendations` | ✓ | ✓ | ✓ | — |
| `/api/analytics/**`, `/api/ai/**` (except ancillary) | — | ✓ | ✓ | — |
| `/api/catalog/**` (CMS mutations) | — | — | ✓ | — |
| `/api/platform/concierge/ask`, reservations, book | ✓ | ✓ | ✓ | — |

### Frontend guards

- `authGuard` — requires JWT for protected routes
- `roleGuard(['ANALYST', 'ADMIN'])` — BI routes
- `roleGuard(['ADMIN'])` — CMS routes
- `auth.service.ts` calls `GET /api/auth/me` on boot to sync role if stale token

---

## 8. AI & analytics design

### AI features

| Feature | Endpoint | Mode |
|---------|----------|------|
| Auto insights | `GET /api/ai/insights` | LOCAL_RETAIL_ANALYST |
| NL Q&A | `POST /api/ai/ask` | LOCAL or GROQ_LLM |
| Ancillary ranking | `GET /api/ai/ancillary-recommendations` | Scoring model |
| Demand forecast | `GET /api/ai/demand-forecast` | KPI + OpenSky demand |
| Concierge | `POST /api/platform/concierge/ask` | Domain-aware rules |

### AI modes

1. **`LOCAL_RETAIL_ANALYST`** (default, no API key) — deterministic answers grounded in live KPIs
2. **`GROQ_LLM`** (optional) — set `GROQ_API_KEY` for generative NL answers via Groq free tier

### Analytics

| Endpoint | Payload |
|----------|---------|
| `GET /api/analytics/dashboard` | KPIs + revenue trend + top routes + OOSD funnel |
| `GET /api/analytics/kpis` | GMV, orders, settle %, check-in %, ancillary attach |

Demo orders are seeded on startup (async in prod) to populate BI charts.

---

## 9. External integrations

| Integration | API | Used for | Fallback |
|-------------|-----|----------|----------|
| OpenSky Network | `opensky-network.org/api/states/all` | Live tracker, demand score | Cached / empty state |
| Frankfurter | `api.frankfurter.app/latest` | EUR→INR FX in pricing | Static rate |
| Open-Meteo | `api.open-meteo.com/v1/forecast` | Destination weather in market pulse | Omitted |
| Groq (optional) | `api.groq.com/openai/v1/chat/completions` | LLM BI narratives | Local analyst |

All external calls are cached (Caffeine, 5 min TTL) to reduce rate-limit impact.

---

## 10. Dynamic pricing pipeline

```
OfferService.search(origin, destination, date)
  → validate airports (AirportRepository — 40 IATA codes)
  → generate Route inventory if empty (haversine block time)
  → DynamicPricingService.price(route, date, cabin)
       → OpenSkyClient.demandScore(origin, destination)
       → FrankfurterClient.eurToInr()
       → DOW multiplier + lead-time multiplier + fare family multiplier
  → persist Route rows
  → return OfferResponse[]
```

---

## 11. Data layer

| Profile | Database | DDL | Notes |
|---------|----------|-----|-------|
| default (dev) | H2 in-memory | create-drop | H2 console enabled |
| `prod` | H2 in-memory | create-drop | Fast demo deploy; async seed |
| `docker` | PostgreSQL 15 | update | Persistent via Docker Compose |

### Demo seed (DataInitializer)

- Upserts 3 demo users (admin, customer, analyst) every boot
- Seeds 40 airports, ancillaries, demo orders for BI
- Prod: `warm-markets: false`, `demo-orders: 8` for fast Render startup
- Seeding runs **async** after `ApplicationReadyEvent` so health checks pass quickly

---

## 12. Deployment architecture

```
GitHub (main)
    │
    ├── Render Blueprint (render.yaml)
    │       └── Docker build (Dockerfile) → https://airbook-glvv.onrender.com
    │
    ├── Fly.io (fly.toml + Dockerfile.prod)
    │       └── GitHub Actions (FLY_API_TOKEN) → https://airbook-enterprise.fly.dev
    │
    └── Cloudflare Pages (frontend only)
            └── /api/* proxied to backend via Pages Function
```

Single JAR serves:
- Static Angular at `/`, `/search`, `/bi`, etc.
- REST API at `/api/**`
- Swagger at `/swagger-ui.html`

See [deployment.md](./deployment.md) for step-by-step instructions.

---

## 13. Design decisions (interview talking points)

1. **Modular monolith** — OOSD boundaries map 1:1 to packages; ready for service extraction
2. **API-first** — all UI data from `/api/*`; no hardcoded catalogs in Angular
3. **Resilient integrations** — cache + graceful degradation when OpenSky rate-limits
4. **Enterprise RBAC** — three distinct workspaces, not shared dashboards
5. **Pluggable AI** — local analyst always works; Groq is optional enhancement
6. **Free-tier deploy aware** — async seed, reduced JVM heap (256MB), prod fast-start tuning
