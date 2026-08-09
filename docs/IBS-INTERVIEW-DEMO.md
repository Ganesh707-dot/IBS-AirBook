# IBS Interview Demo — AirBook Enterprise (5 minutes)

Use this script when presenting to a manager or IBS interviewer.

## Live URL

**https://airbook-glvv.onrender.com** (Render free tier)

First open may take **30–90 seconds** on free hosting — refresh once `/api/health` returns `"status":"UP"`.

## Credentials

| Persona | Email | Password | Opens |
|---------|-------|----------|-------|
| Traveler | customer@airbook.com | customer123 | My Journey |
| Analyst | analyst@airbook.com | analyst123 | Retail Intelligence BI |
| Admin | admin@airbook.com | admin123 | Ops CMS |

## 5-minute walkthrough

1. **Platform** — Home → Solutions menu (Passenger, Hospitality, Cruise, Cargo, Loyalty, AI, Ops, BI)
2. **OOSD retail** — Customer login → Flights COK–DXB → book → settle → check-in
3. **Hospitality/Cruise** — Hotels Reserve (HTL ref) → Cruise Reserve (CRZ ref) → My Journey
4. **Live data** — Tracker (OpenSky) · Concierge AI · Market pulse (FX + weather)
5. **Analyst/Admin** — BI dashboard · Ops CMS route publish

## Real free APIs

| Data | API |
|------|-----|
| Live flights / demand | https://opensky-network.org/api/states/all |
| FX rates | https://api.frankfurter.app/ |
| Weather | https://api.open-meteo.com/ |

Hotels/cruise/cargo catalogs = enterprise **demo inventory** (booking logic is real).

## Free deploy

```bash
fly auth login
fly launch --no-deploy
fly secrets set JWT_SECRET="$(openssl rand -base64 32)"
fly deploy
```
