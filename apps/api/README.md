# `@salonops/api` ⚙️

> **Node.js 24 LTS & Express.js REST API with Drizzle ORM, PostgreSQL 16, and Redis Redlock distributed concurrency locking.**

---

## 🌟 Highlights & Architecture

Built with strict **Clean Architecture**, **Domain-Driven Design (DDD)**, and **Hexagonal Architecture (Ports and Adapters)**:

```text
                     ┌───────────────────────────────────────────────────────────┐
                     │                  DRIVING ADAPTERS (INBOUND)               │
                     │  - Express REST Controllers (/api/v1/appointments, etc.)  │
                     │  - HTTP Request Validation (Zod Schemas)                  │
                     │  - Centralized Error Handler (Domain -> HTTP Status)      │
                     └─────────────────────────────┬─────────────────────────────┘
                                                   │ calls
                                                   ▼
┌──────────────────────────────────────────────────┴──────────────────────────────────────────────────┐
│                                       HEXAGON BOUNDARY                                              │
│                                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                 APPLICATION LAYER                                           │   │
│   │   Inbound Ports (Use Cases) & Application Services:                                         │   │
│   │   - BookAppointmentUseCase, GetAppointmentsUseCase, UpdateAppointmentStatusUseCase          │   │
│   │   - GetStylistsUseCase, GetServicesUseCase                                                  │   │
│   │   - SearchClientsUseCase, SaveHairFormulaUseCase, GetClientFormulasUseCase                  │   │
│   │   - ProcessCheckoutUseCase                                                                  │   │
│   └──────────────────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                                  │ orchestrates                                     │
│                                                  ▼                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                   DOMAIN LAYER (CORE)                                       │   │
│   │   Aggregate Roots & Entities:                                                               │   │
│   │   - Appointment, Stylist, Client, Service, HairFormula, Transaction                         │   │
│   │   Value Objects:                                                                            │   │
│   │   - TimeSlot (interval overlap & Moroccan buffer logic)                                     │   │
│   │   - Money (Moroccan Dirham MAD, zero-float precision, commission %)                         │   │
│   │   - MoroccanPhoneNumber (strict 212 / 06 / 07 normalization)                                │   │
│   │   Domain Services & Exceptions:                                                             │   │
│   │   - AppointmentCollisionService, SlotCollisionException, StylistUnavailableException       │   │
│   │   Outbound Ports (Driven Interfaces):                                                       │   │
│   │   - IAppointmentRepository, IStylistRepository, IClientRepository, IServiceRepository       │   │
│   │   - IHairFormulaRepository, ITransactionRepository, IDistributedLockPort                   │   │
│   └──────────────────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                                  │                                                  │
└──────────────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                                   │ implemented by
                                                   ▼
                     ┌───────────────────────────────────────────────────────────┐
                     │                  DRIVEN ADAPTERS (OUTBOUND)               │
                     │  - Drizzle ORM Repositories (PostgreSQL 16)                │
                     │  - Redis Redlock Distributed Concurrency Adapter          │
                     │  - In-Memory Lock Fallback (for testing / offline dev)    │
                     └───────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```text
apps/api/
├── src/
│   ├── domain/                            # Enterprise Domain Core (Zero external deps)
│   │   ├── exceptions/                    # Domain Exceptions (SlotCollision, StylistUnavailable, etc.)
│   │   ├── models/                        # Entities & Aggregate Roots (Appointment, Transaction, Client...)
│   │   ├── ports/                         # Driven Outbound Ports (Repository & Lock Interfaces)
│   │   ├── services/                      # Domain Services (AppointmentCollisionService)
│   │   └── value-objects/                 # Value Objects (Money, TimeSlot, MoroccanPhoneNumber)
│   ├── application/                       # Application Layer (Orchestration & Use Cases)
│   │   ├── dtos/                          # Application DTOs & Mappings
│   │   ├── ports/                         # Inbound Ports (Use Case Interfaces)
│   │   └── use-cases/                     # Inbound Port Implementations (BookAppointment, Checkout...)
│   ├── infrastructure/                    # Driven Adapters (External Technologies)
│   │   ├── concurrency/                   # Redis Redlock & Memory Lock Adapters
│   │   ├── persistence/                   # Drizzle ORM Repositories
│   │   └── container.ts                   # Composition Root / Dependency Injection
│   ├── presentation/                      # Driving Adapters (HTTP Express)
│   │   ├── controllers/                   # REST API Controllers
│   │   ├── middleware/                    # Centralized Domain Error Handler & Auth Guards
│   │   ├── routes/                        # Express Router Definitions
│   │   └── validation/                    # Zod Request Validation Schemas
│   ├── app.ts                             # Express Application Factory (wired via Container)
│   └── server.ts                          # Server Bootstrapping & Process Management
├── test/                                  # Isolated Unit & Application Tests (node:test + tsx)
│   ├── application/                       # Use Case Orchestration Tests with Mocked Ports
│   └── domain/                            # Pure Domain & Value Object Tests (No DB needed)
├── Dockerfile                             # Multi-stage production container build (Node.js 24 Alpine)
├── package.json                           # API dependencies & test scripts
└── tsconfig.json                          # TypeScript configuration
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

# MinIO S3 Object Storage
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="salonops-media"
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
