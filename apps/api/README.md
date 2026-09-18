# `@salonops/api` ⚙️

> **Node.js 22 LTS & Express.js REST API with Drizzle ORM, PostgreSQL 16, and Redis Redlock distributed concurrency locking.**

---

## 🌟 Highlights & Architecture

- **Clean Modular Routing**: Dedicated Express routers for `auth`, `stylists`, `services`, `appointments`, `clients`, and `health`.
- **Drizzle ORM Integration**: Type-safe relational queries using Drizzle ORM and `postgres` driver.
- **Strict Stylist RBAC**: Granular role-based access control protecting salon turnover, gross margins, and owner analytics from floor staff.
- **Collision Prevention & Redlock**: Redis Redlock distributed locking during slot booking prevents double-booking race conditions.
- **Security & Headers**: Armed with `helmet`, CORS policy, rate limiting, and argon2 password hashing.
- **Docker Ready**: Multi-stage production Docker build (`Dockerfile`).

---

## 📁 Directory Structure

```text
apps/api/
├── src/
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication & Bearer token extraction
│   │   └── rbac.ts              # Role-Based Access Control (OWNER, MANAGER, STYLIST)
│   ├── routes/
│   │   ├── health.ts            # GET /health health check probe
│   │   ├── stylists.ts          # GET /api/v1/stylists (stylist listing & profiles)
│   │   ├── services.ts          # GET /api/v1/services (service catalog in MAD)
│   │   ├── appointments.ts      # GET/POST /api/v1/appointments with slot collision check
│   │   └── clients.ts           # GET/POST /api/v1/clients & hair formula vault
│   └── server.ts                # Express application bootstrapping & middleware stack
├── Dockerfile                   # Multi-stage production container build
├── .dockerignore                # Docker build ignore rules
├── .env.example                 # Example environment variables
├── package.json                 # API dependencies & scripts
└── tsconfig.json                # TypeScript configuration
```

---

## ⚙️ Environment Variables

Create `.env` inside `apps/api/`:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgres://postgres:postgres@localhost:5432/salonops"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-jwt-key-for-moroccan-salon-platform"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="*"
```

---

## 🔌 API Endpoints Reference

### Health
- `GET /health` — Health check endpoint returning `{ status: 'ok', timestamp }`.

### Authentication
- `POST /api/v1/auth/login` — Authenticate user and issue JWT access token.

### Stylists & Agenda
- `GET /api/v1/stylists` — List active stylists with working hours and days off.

### Services Catalog
- `GET /api/v1/services` — List salon services with duration, buffer minutes, and price in MAD.

### Appointments & Calendars
- `GET /api/v1/appointments` — Query appointments filtered by `stylistId`, `date`, or `branchId`.
- `POST /api/v1/appointments` — Book new appointment with atomic collision prevention and buffer time check.

### Clients & Hair Formulas
- `GET /api/v1/clients` — Search client database by phone number or name.
- `GET /api/v1/clients/:id/formulas` — Retrieve client color formula history and photos.
- `POST /api/v1/clients/:id/formulas` — Save new color formula with developer volume and processing time.

---

## 🚀 Running Locally

```bash
# Start API in watch mode with tsx
pnpm --filter @salonops/api dev

# Build TypeScript to dist/
pnpm --filter @salonops/api build

# Run compiled production server
pnpm --filter @salonops/api start

# Run typechecker
pnpm --filter @salonops/api typecheck
```

---

## 🐳 Docker Deployment

Build and run with Docker:
```bash
# From the monorepo root
docker build -t salonops-api -f apps/api/Dockerfile .

# Run container
docker run -p 4000:4000 \
  -e DATABASE_URL="postgres://user:pass@host:5432/salonops" \
  -e REDIS_URL="redis://host:6379" \
  -e JWT_SECRET="your-jwt-secret" \
  salonops-api
```
