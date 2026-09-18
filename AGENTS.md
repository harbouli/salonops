# AGENTS.md — AI Agent Operating Instructions for SalonOps Morocco 🇲🇦

Welcome, AI Agent! This document contains the mandatory instructions, architectural principles, domain rules, and technical standards for contributing to the **SalonOps** monorepo. 

Before proposing or executing code changes, read this guide thoroughly to adhere to established repository standards.

---

## 🏛️ Monorepo Overview & Structure

SalonOps is a mobile-first salon management & scheduling SaaS platform engineered specifically for Moroccan hair salons, barbershops, and multi-branch beauty parlors.

The codebase is structured as a **pnpm + Turborepo** monorepo:

```text
salonops/
├── apps/
│   ├── api/                       # Node.js 24 LTS + Express REST API (Clean / Hexagonal / DDD)
│   ├── staff-mobile/              # React Native Expo SDK 57 mobile floor app (FR / Darija RTL)
│   ├── admin-dashboard/           # React 19 + Vite back-office dashboard (financials & POS)
│   └── client-web/                # Responsive React 19 booking web client (Bio link)
├── packages/
│   ├── database/                  # Drizzle ORM schema, migrations, connection pool & seeds
│   ├── shared-types/              # Shared TypeScript models, enums, DTOs & interfaces
│   ├── config-typescript/         # Shared tsconfig presets
│   └── config-eslint/             # Shared ESLint configuration presets
├── docker-compose.yml             # PostgreSQL 16, Redis 7 & MinIO S3 local infrastructure
├── pnpm-workspace.yaml            # Monorepo workspaces definition
└── turbo.json                     # Turborepo task pipeline
```

---

## ⚙️ Backend Architecture Guidelines (`apps/api`)

The backend is built strictly using **Clean Architecture**, **Domain-Driven Design (DDD)**, and **Hexagonal Architecture (Ports and Adapters)**. Never violate layer boundaries.

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

### 1. Domain Layer (`src/domain/`)
- **Zero Framework Dependencies:** Pure TypeScript. Never import Express, Drizzle, SQL, or Redis inside `src/domain/`.
- **Aggregate Roots & Entities:** Enforce business invariants directly inside models (e.g. `Appointment.confirm()`, `Appointment.cancel()`, `Transaction.validatePaymentInvariants()`).
- **Value Objects:**
  - `Money`: For all financial values in Moroccan Dirham (MAD). Never use raw floating-point arithmetic.
  - `TimeSlot`: Handles `startTime`, `endTime`, `bufferEndTime`, working hours verification, and collision detection (`overlapsWith`).
  - `MoroccanPhoneNumber`: Normalizes and formats Moroccan numbers (+212 / 06 / 07).
- **Outbound Ports (Driven Interfaces):** Pure interfaces in `src/domain/ports/` defining what the domain requires from persistence and infrastructure (`IAppointmentRepository`, `IDistributedLockPort`, etc.).
- **Domain Exceptions:** Subclass `DomainException` (`SlotCollisionException`, `StylistUnavailableException`, `InvalidAppointmentStateException`, `EntityNotFoundException`).

### 2. Application Layer (`src/application/`)
- Contains **Inbound Ports** (Use Case interfaces in `src/application/ports/`) and **Use Case Implementations** in `src/application/use-cases/`.
- Use Cases orchestrate domain models, call outbound ports, and return DTOs.
- **No HTTP logic:** Use Cases do not know about Express `Request` or `Response`.

### 3. Infrastructure Layer (`src/infrastructure/`)
- Contains **Driven Adapters**:
  - `persistence/`: Drizzle ORM repositories implementing Domain Ports.
  - `concurrency/`: `RedisDistributedLockAdapter` (with graceful fallback to `MemoryDistributedLockAdapter`).
  - `container.ts`: Central Composition Root / Dependency Injection container wiring all ports to adapters and instantiating use cases.

### 4. Presentation Layer (`src/presentation/`)
- Contains **Driving Adapters**:
  - `controllers/`: Express controllers validating requests and invoking Use Cases.
  - `routes/`: Router factory functions mounting endpoints.
  - `validation/`: Zod schemas validating request payloads.
  - `middleware/`: Centralized `errorHandlerMiddleware` translating Domain Exceptions to HTTP status codes (409 Conflict, 404 Not Found, 422 Unprocessable Entity, 400 Bad Request).

---

## 🇲🇦 Moroccan Salon Domain Invariants

When implementing or modifying features, always respect Moroccan market operational realities:

1. **Stylist Loyalty:** Moroccan clients book specific artists (*Fatima*, *Salma*, *Youssef*), not generic salon chairs. All appointment bookings require stylist validation.
2. **Post-Service Buffer Times:** Chemical processes (lissage, balayage, décoloration) require strict service durations plus cleaning/ventilation buffer times. Never allow bookings that overlap with a stylist's buffer window (`bufferEndTime`).
3. **Moroccan Payment Split Realities:** Salons split checkouts between Cash, TPE bank card, and direct stylist tips. Commission is calculated as a percentage on the service total.
4. **"Notebook Killer" Hair Formula Vault:** Stylists track client bleach ratios, developer volumes, processing times, and transformation photos in MinIO S3-compatible storage.
5. **Bilingual Floor Experience:** Staff mobile supports French and Moroccan Darija RTL.

---

## 🛠️ Essential Development & Validation Commands

Always verify your changes before finalizing any task:

```bash
# Monorepo-wide typechecking (Turborepo)
pnpm typecheck

# Full monorepo production build
pnpm build

# Run backend test suite (Node 24 native test runner + tsx)
pnpm --filter @salonops/api test

# Run API in development watch mode
pnpm --filter @salonops/api dev

# Run database migrations / studio
pnpm --filter @salonops/database db:generate
pnpm --filter @salonops/database db:migrate
pnpm --filter @salonops/database db:studio
```

---

## 📋 Agent Rules of Engagement

1. **Respect Monorepo Workspaces:** Use `workspace:*` dependencies. Do not install duplicate dependencies across packages.
2. **Never Break Client Contracts:** Ensure API endpoints (`/api/v1/stylists`, `/api/v1/services`, `/api/v1/appointments`, `/api/v1/clients`, `/api/v1/checkout`, `/health`) remain backward-compatible with `staff-mobile`, `admin-dashboard`, and `client-web`.
3. **Dependency Injection:** When adding a new use case or repository, declare its port interface first, implement the adapter, and register it in `apps/api/src/infrastructure/container.ts`.
4. **Unit Tests for Domain & Use Cases:** When creating new business rules or use cases, write tests under `apps/api/test/` using `node:test` and `node:assert/strict` with mocked ports to verify behavior without requiring a running database.
5. **No Ad-Hoc CSS / Framework Breakage:** For web apps (`admin-dashboard`, `client-web`), preserve existing styling conventions (Tailwind/Vanilla CSS) and Vite build setups.
