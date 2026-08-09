# User Manual — AirBook

Demo guide for recruiters and interview walkthroughs.

## Login

| Role | Email | Password | Lands on | Use for |
|------|-------|----------|----------|---------|
| Customer | `customer@airbook.com` | `customer123` | `/dashboard` | Search, book, settle, check-in |
| Analyst | `analyst@airbook.com` | `analyst123` | `/bi` | AI BI dashboards only |
| Admin | `admin@airbook.com` | `admin123` | `/admin` | Route CMS + AI BI |

---

## Will booking work?

**Yes.** End-to-end booking works when you are logged in.

### Book a flight (customer)

1. Open **Login** → sign in as `customer@airbook.com` / `customer123`
2. Go to **Flights**
3. Choose **From / To / Travel date** → **Search flights**
4. Click **Book** on any offer
5. Complete the wizard:
   - **Passengers** — name, email, pax count  
   - **Extras** — AI-ranked ancillaries (baggage, meal, lounge, …)  
   - **Payment** — Card / UPI / Wallet → **Pay & confirm**
6. You get a **booking reference** + **payment ID** (status = SETTLED)
7. Open **My Trips** to see the booking
8. Open **Check-in** → enter reference → get a **boarding pass**

### If booking fails

- Make sure you are **logged in** (JWT required)
- Fill passenger **name** and valid **email**
- Backend must be running (`/api/health` should return `UP`)

---

## What is AI used for?

AI helps with **business intelligence and personalization**, not with drawing the flight map.

| Where in UI | What AI does for you |
|-------------|----------------------|
| **Flights → Book → Extras** | Ranks which ancillaries to upsell for that route/cabin |
| **AI BI** page | Shows insights (revenue, settlement, attach rate, demand) |
| **AI BI → Ask the Retail Analyst** | Ask questions in English, e.g. “How is settlement converting?” |
| **AI BI → Demand forecast** | Shows 7-day demand outlook for an OD (e.g. COK–DXB) |

### Modes

- **Without any AI key:** local retail analyst still works (`LOCAL_RETAIL_ANALYST`)
- **With free Groq key (`GROQ_API_KEY`):** richer LLM answers (`GROQ_LLM`)

AI does **not** invent live aircraft positions — that comes from OpenSky.

---

## Live Flight Tracker

1. Open **Live Tracker**
2. Pick corridor origin/destination → **Track corridor**
3. Map + aircraft list show **real ADS-B flights** from OpenSky when the free API allows it

**Free API:** https://opensky-network.org/api/states/all  

If you see “too many requests” / no flights: OpenSky free tier is rate-limiting. Wait 1–5 minutes → **Refresh**. This is **not** a booking bug.

---

## AI BI Command Center

1. Login as **admin** or **analyst**
2. Open **AI BI**
3. Review KPIs (GMV, orders, settle %, check-in %, ancillary attach)
4. Read **AI Insights**
5. Ask a question in **Ask the Retail Analyst**
6. Run a **Demand forecast** for any OD

---

## Admin CMS

1. Login as `admin@airbook.com`
2. Open **Admin**
3. Add / view routes in the catalog

---

## Speed tip

Search and booking stay fast even if OpenSky is rate-limited. Live Tracker may show empty until OpenSky recovers — booking does **not** depend on it.

## Suggested 3-minute interview demo

1. **Home** → search COK → DXB  
2. **Book** a flight with an ancillary → show payment confirmation  
3. **Check-in** → show boarding pass  
4. **Live Tracker** → explain OpenSky free ADS-B (and rate limits)  
5. **AI BI** (admin) → show KPIs + ask “Where should we push yield?”  

---

## Technical docs

See [architecture.md](./architecture.md) for module map, APIs, and AI design.
