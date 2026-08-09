# AirBook — Airline Retail Platform

> Product name: **AirBook** · Repo: IBS-AirBook  
> Dynamic **Offer → Order → Settle → Deliver** platform inspired by [IBS Software](https://www.ibsplc.com/) passenger retail solutions.

Built as an interview-ready full-stack system (Java Spring Boot + Angular/PrimeNG) with **live free market APIs**, **dynamic revenue pricing**, and an **AI BI command center**.

## Docs

- [Technical architecture](docs/architecture.md) — modules, booking APIs, AI design  
- [User manual](docs/user-manual.md) — how to book, tracker, AI BI demo script  
- [Deployment guide](docs/deployment.md) — local, Docker, Compose, Render

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
| Live demand | [OpenSky Network](https://opensky-network.org/) ADS-B traffic density (free, no key) |
| FX-aware pricing | [Frankfurter](https://www.frankfurter.app/) ECB EUR→INR rates (free, no key) |
| RM pricing | Demand × DOW × lead-time × fare-family multipliers |
| OOSD lifecycle | `PENDING_PAYMENT` → `SETTLED` → `CHECKED_IN` + boarding pass deliver |
| AI BI | Local retail analyst + optional [Groq](https://console.groq.com/) LLM (`GROQ_API_KEY`) |
| Analytics | KPI board, revenue trend, OOSD funnel, demand forecast |
| Security | JWT + enterprise RBAC (ADMIN / ANALYST / CUSTOMER) |
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
