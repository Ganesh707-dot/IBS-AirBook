# Deployment Guide — AirBook

How to run and publish **AirBook** (Airline Retail Platform).

## Options

| Mode | Best for | URL style |
|------|----------|-----------|
| Local JAR / `mvn` + `npm` | Development | `localhost` |
| Docker all-in-one | Same machine / VPS | any host:8080 |
| Docker Compose | Backend + Postgres + nginx UI | local ports |
| Render free (`render.yaml`) | Persistent public demo | `https://airbook.onrender.com` |

---

## 1. Local development

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
- UI: http://localhost:4200 (calls API at `http://localhost:8080/api`)

---

## 2. Production all-in-one (recommended demo)

Builds Angular into Spring Boot static resources and runs one process.

```bash
docker build -t airbook .
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod airbook
```

Open: http://localhost:8080

### Optional env vars

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `8080`) |
| `SPRING_PROFILES_ACTIVE` | `prod` (H2) or `docker` (Postgres) |
| `JWT_SECRET` | Override JWT signing secret |
| `GROQ_API_KEY` | Optional free Groq LLM for AI BI narratives |
| `CORS_ORIGINS` | Comma-separated origins if UI is on another host |

---

## 3. Docker Compose (Postgres)

```bash
docker compose up --build
```

- API: http://localhost:8080  
- UI (nginx): http://localhost:4200  
- Postgres: `localhost:5432` (`airbook` / `airbook123`)

Compose sets `SPRING_PROFILES_ACTIVE=docker` on the backend.

---

## 4. Fly.io free (recommended for IBS interview)

Best free option for this Spring Boot Docker app — faster wake than Render.

```bash
# Install: https://fly.io/docs/hands-on/install-flyctl/
fly auth login
fly launch --no-deploy    # use existing fly.toml, skip Postgres
fly secrets set JWT_SECRET="$(openssl rand -base64 32)"
fly deploy
```

App URL: **https://airbook-enterprise.fly.dev**

Optional CI: add `FLY_API_TOKEN` to GitHub secrets → pushes to `main` auto-deploy via `.github/workflows/fly-deploy.yml`.

Notes:
- Free tier sleeps when idle; first request wakes the machine (~15–45s).
- Memory set to 512MB with `-Xmx384m` for stable JVM on free VMs.

---

## 5. Render free (backup URL)

Repo includes [`render.yaml`](../render.yaml) with service name **`airbook`**.

1. Push latest `main` to GitHub: https://github.com/Ganesh707-dot/IBS-AirBook  
2. In [Render](https://render.com) → **New** → **Blueprint** → select this repo  
3. Apply blueprint → wait for Docker build (5–10 min)  
4. App URL: **https://airbook.onrender.com**

Notes:
- Free tier cold-start can be **30–90s** after idle — not ideal for live manager demos.
- Set `GROQ_API_KEY` in Render env if you want LLM mode for AI BI.

---

## 6. Quick public tunnel (temporary)

For a short recruiter share from your laptop (URL name is random):

```bash
# after jar/docker is listening on 8080
cloudflared tunnel --url http://localhost:8080
```

Prefer Render for a stable link.

---

## Health check

Any environment should return:

```json
{"status":"UP","service":"AirBook API"}
```

at `GET /api/health`.

---

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@airbook.com` | `customer123` |
| Admin | `admin@airbook.com` | `admin123` |
| Analyst | `analyst@airbook.com` | `analyst123` |

See also [user-manual.md](./user-manual.md) for test scenarios and [architecture.md](./architecture.md) for module design.
