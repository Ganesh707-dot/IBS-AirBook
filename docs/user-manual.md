# User Manual — AirBook Enterprise

Complete guide for demo users, recruiters, and IBS interview walkthroughs.

**Live app:** https://airbook-glvv.onrender.com

---

## 1. Getting started

### Login credentials

| Role | Email | Password | After login you land on |
|------|-------|----------|-------------------------|
| **Traveler** | `customer@airbook.com` | `customer123` | My Journey (`/dashboard`) |
| **Analyst** | `analyst@airbook.com` | `analyst123` | Retail Intelligence (`/bi`) |
| **Admin** | `admin@airbook.com` | `admin123` | Ops CMS (`/admin`) |

### First visit tip (free hosting)

If the page loads slowly or shows a spinner for 30–90 seconds, **wait and refresh once**. Free Render tier wakes the server on first request.

### Logout

Click your name / **Sign out** in the top navigation bar.

---

## 2. Navigation overview

The top bar includes a **Solutions** mega-menu:

| Menu item | Route | Who can access |
|-----------|-------|----------------|
| Home | `/` | Everyone |
| Flights | `/search` | Everyone |
| Hotels | `/stays` | Everyone |
| Cruise | `/cruise` | Everyone |
| Cargo | `/cargo` | Everyone |
| Loyalty | `/loyalty` | Everyone |
| AI Concierge | `/concierge` | Everyone (ask requires login) |
| Live Tracker | `/tracker` | Everyone |
| My Journey | `/dashboard` | Logged-in travelers |
| My Trips | `/bookings` | Logged-in travelers |
| Check-in | `/checkin` | Logged-in travelers |
| Retail Intelligence | `/bi` | Analyst + Admin |
| Ops CMS | `/admin` | Admin only |

---

## 3. Traveler workflow (Customer role)

### 3.1 Book a flight

1. Login as `customer@airbook.com` / `customer123`
2. Go to **Flights**
3. Enter **From**, **To**, **Travel date** → **Search flights**
4. Click **Book** on any offer
5. Complete the booking wizard:
   - **Passengers** — full name, email, passenger count
   - **Extras** — select AI-ranked ancillaries (baggage, meal, lounge, etc.)
   - **Payment** — choose Card / UPI / Wallet → **Pay & confirm**
6. Note your **booking reference** (e.g. `AB…`) and **payment ID**
7. Open **My Trips** to see the booking with status **SETTLED**

### 3.2 Web check-in

1. Go to **Check-in**
2. Enter your booking reference
3. Click **Check in**
4. View / download **boarding pass** details

### 3.3 Reserve a hotel

1. Go to **Hotels**
2. Browse properties (Dubai, Maldives, Paris, etc.)
3. Click **Reserve** on a property
4. Confirmation shows reference `HTL…`
5. View on **My Journey** dashboard alongside flight trips

### 3.4 Book a cruise

1. Go to **Cruise**
2. Browse packages (Arabian Gulf, Mediterranean, etc.)
3. Click **Reserve**
4. Confirmation shows reference `CRZ…`

### 3.5 AI Concierge

1. Go to **AI Concierge**
2. Ask travel questions, e.g.:
   - "What hotels do you recommend in Dubai?"
   - "My flight is delayed — what are my options?"
   - "How does loyalty work?"
3. Answers are domain-aware (hotels, cruise, cargo, disruption, loyalty)

### 3.6 Live Flight Tracker

1. Go to **Live Tracker**
2. Select corridor origin/destination → **Track corridor**
3. Map shows real ADS-B aircraft from OpenSky when API allows

**If map is empty:** OpenSky free tier may be rate-limiting. Wait 1–5 minutes and refresh. Booking does **not** depend on OpenSky.

---

## 4. Analyst workflow (Analyst role)

### 4.1 Retail Intelligence dashboard

1. Login as `analyst@airbook.com` / `analyst123`
2. You land on **Retail Intelligence** (`/bi`)
3. Review:
   - **KPI cards** — GMV, orders, settlement %, check-in %, ancillary attach
   - **Revenue trend** chart
   - **Top routes** table
   - **OOSD funnel** — Offer → Order → Settle → Deliver conversion

### 4.2 AI insights

Scroll to **AI Insights** — auto-generated narratives on retail performance grounded in live KPI data.

### 4.3 Ask the Retail Analyst

Type natural-language questions, e.g.:
- "How is ancillary attach performing?"
- "Which routes drive the most revenue?"
- "What is the settlement conversion rate?"

### 4.4 Demand forecast

Enter an origin-destination pair (e.g. `COK` → `DXB`) and run forecast. Shows 7-day demand index with pricing bias (`YIELD_UP`, `HOLD`, `STIMULATE`).

### What Analyst cannot do

- Cannot access **Ops CMS** (`/admin`) — Admin only
- Cannot modify route catalog

---

## 5. Admin workflow (Admin role)

### 5.1 Ops CMS — Route catalog

1. Login as `admin@airbook.com` / `admin123`
2. Go to **Ops CMS** (`/admin`)
3. View existing routes in the catalog table
4. Click **Add route** to create new origin-destination entries
5. Use **Refresh** to reload data

### 5.2 Retail Intelligence

Admin also has full access to **Retail Intelligence** (`/bi`) — same as Analyst.

---

## 6. Public pages (no login required)

| Page | What you can do without login |
|------|-------------------------------|
| Home | Browse platform overview, quick search |
| Flights | Search offers (login required to book) |
| Hotels / Cruise / Cargo / Loyalty | Browse catalogs |
| Live Tracker | View live flights map |
| AI Concierge | View page (login required to ask) |

---

## 7. Troubleshooting

| Problem | Solution |
|---------|----------|
| Page loads forever | Wait 60s, refresh — free tier cold start |
| Login fails | Check email/password; ensure backend is up (`/api/health` → `"status":"UP"`) |
| Booking fails | Must be logged in; fill passenger name + valid email |
| BI page redirects to login | Use `analyst@airbook.com` or `admin@airbook.com` |
| Admin page blocked | Use `admin@airbook.com` only |
| Live tracker empty | OpenSky rate limit — wait and refresh |
| Hotel/cruise reserve fails | Login first |

### Health check

Open: https://airbook-glvv.onrender.com/api/health

Expected:
```json
{"status":"UP","service":"AirBook Enterprise API","version":"2.2.0","timestamp":"..."}
```

---

## 8. Suggested demo scripts

### 3-minute recruiter demo

1. **Home** → show enterprise layout + Solutions menu
2. **Flights** → search `COK` → `DXB` → book with ancillary → payment confirm
3. **Hotels** → reserve a property → show `HTL…` reference
4. **Check-in** → boarding pass
5. **Retail Intelligence** (analyst login) → KPIs + ask one AI question

### 5-minute IBS interview demo

See [IBS-INTERVIEW-DEMO.md](./IBS-INTERVIEW-DEMO.md) for the full script covering all domains and RBAC.

---

## 9. Related documentation

| Document | Contents |
|----------|----------|
| [architecture.md](./architecture.md) | Technical design, APIs, RBAC matrix |
| [deployment.md](./deployment.md) | How to deploy locally or to cloud |
| [IBS-INTERVIEW-DEMO.md](./IBS-INTERVIEW-DEMO.md) | Manager presentation script |
