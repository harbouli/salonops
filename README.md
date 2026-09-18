# SalonOps Morocco 🇲🇦

[![CI Status](https://img.shields.io/badge/CI-GitHub%20Actions-22c55e?logo=github-actions)](.github/workflows/ci.yml)
[![Package Manager](https://img.shields.io/badge/pnpm-v11.21.0-orange?logo=pnpm)](https://pnpm.io/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo)](https://expo.dev/)
[![Express](https://img.shields.io/badge/Backend-Express.js%20(Node%2022)-black?logo=express)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle%20ORM-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-blue)](#)

> **Mobile-first salon management & scheduling SaaS platform engineered specifically for Moroccan hair salons, barbershops, and multi-branch beauty parlors.**

---

## 📖 Overview & Moroccan Market Fit

Running a salon in Morocco involves distinct operational realities that Western software (Fresha, Treatwell) fails to address:
1. **Per-Stylist Client Loyalty:** Moroccan clients book specific artists (*Fatima*, *Salma*, *Youssef*), not generic salon chairs.
2. **Buffer Times & Collision Prevention:** Chemical processes (lissage, balayage) require strict service durations and cleaning buffers to prevent floor chaos.
3. **No-Show Mitigation:** 15–25% of salon slots are lost to no-shows. Automated WhatsApp & SMS notifications at 24h and 2h recover thousands of MAD monthly.
4. **"Notebook Killer" Color Formula Vault:** Stylists maintain paper notebooks for client bleach ratios, developer volumes, and processing times. SalonOps digitizes this with Cloudflare R2 transformation photos.
5. **Moroccan Payment Realities:** Seamless split checkout between cash, TPE bank card, and direct stylist tips.
26: 6. **Bilingual Floor Experience:** Instant toggle between French and Moroccan Darija with native Right-to-Left (RTL) layout support.

---

## 🏛️ Architecture Overview

```mermaid
graph TD
    subgraph "Clients & Floor Applications"
        MOB["📱 <b>staff-mobile</b><br/>React Native (Expo SDK 57)<br/>Hairdresser Floor App (FR/Darija RTL)"]
        ADMIN["💻 <b>admin-dashboard</b><br/>React.js 19.3 + Vite<br/>Owner Financials & Multi-Branch POS"]
        CLIENT["🌐 <b>client-web</b><br/>Responsive React.js 19.3<br/>Instagram Bio Booking & Digital Wallet"]
    end

    subgraph "Backend Services"
        API["⚙️ <b>apps/api</b><br/>Node.js 22 LTS + Express.js<br/>JWT Auth, Stylist RBAC & Concurrency Engine"]
        REDIS[("⚡ <b>Redis 7</b><br/>Redlock Slot Reservation<br/>Rolling Revenue Cache")]
        POSTGRES[("🗄️ <b>PostgreSQL 16</b><br/>Multi-Branch Relational Data")]
        R2["☁️ <b>Cloudflare R2</b><br/>Zero-Egress Transformation Photos"]
    end

    subgraph "Shared Packages (packages/)"
        TYPES["📦 <b>@salonops/shared-types</b><br/>DTOs, Enums & Domain Models"]
        DB["📦 <b>@salonops/database</b><br/>Drizzle ORM Schema & Migrations"]
        TSCONFIG["📦 <b>@salonops/config-typescript</b><br/>Shared tsconfig Presets"]
        ESLINT["📦 <b>@salonops/config-eslint</b><br/>Linting Rules"]
    end

    MOB --> TYPES
    ADMIN --> TYPES
    CLIENT --> TYPES
    API --> TYPES
    API --> DB
    API --> REDIS
    API --> R2
    DB --> POSTGRES
```

---

## 📁 Repository Structure

```text
salonops/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # PR & Push validation (lint, typecheck, build, docker check)
│       └── cd.yml                 # Automated Docker container build & web asset release
├── apps/
│   ├── staff-mobile/              # React Native Expo SDK 57 mobile app for hairdressers
│   ├── api/                       # Express.js REST API with Drizzle ORM & Redis Redlock
│   ├── admin-dashboard/           # React 19.3 + Vite back-office dashboard for salon owners
│   └── client-web/                # Responsive React 19.3 booking web client (Bio link)
├── packages/
│   ├── database/                  # Drizzle ORM schema, migrations, connection pool & seeds
│   ├── shared-types/              # Shared TypeScript models, enums, DTOs & interfaces
│   ├── config-typescript/         # Reusable tsconfig base, node, react & react-native presets
│   └── config-eslint/             # Shared ESLint configuration presets
├── pnpm-workspace.yaml            # pnpm workspace definition
├── turbo.json                     # Turborepo task pipeline & caching
├── package.json                   # Root scripts & dependencies
└── README.md                      # Monorepo documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Monorepo Engine** | **pnpm v11 + Turborepo** | Fast workspace hoisting, symlinked internal packages, zero-overhead task caching |
| **Mobile App** | **Expo SDK 57 (React Native)** | Offline SQLite support, native camera uploads, RTL Arabic/Darija engine |
| **Backend API** | **Express.js (Node 22 LTS)** | Helmet, CORS, Argon2/JWT authentication, RBAC authorization guard |
| **ORM & Database** | **Drizzle ORM + PostgreSQL 16** | Pure type-safe SQL queries, zero runtime bloat, `drizzle-kit` automated migrations |
| **Concurrency & Cache** | **Redis 7 (ioredis + Redlock)** | Distributed lock guard eliminating appointment double-booking collisions |
| **Web Dashboards** | **React 19.3 + Vite + Tailwind** | Sub-second HMR, luxury dark gold aesthetic (`#121214` & `#D4AF37`) |
| **Storage & Media** | **Cloudflare R2** | High-resolution before/after hair formula transformation photo vault |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher (Node 22 LTS recommended)
- **pnpm**: `v11.0.0` or higher (`corepack enable && corepack prepare pnpm@11.21.0 --activate`)
- **Docker**: For running local PostgreSQL and Redis instances

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/salonops.git
cd salonops

# Install dependencies across all 9 packages
pnpm install
```

### 3. Environment Configuration
Copy `.env.example` templates to `.env`:
```bash
# In packages/database
cp packages/database/.env.example packages/database/.env

# In apps/api
cp apps/api/.env.example apps/api/.env
```

Ensure your `DATABASE_URL` points to your PostgreSQL database:
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/salonops"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-jwt-key-for-moroccan-salon-platform"
PORT=4000
```

### 4. Database Setup (Drizzle ORM)
```bash
# Generate SQL migrations from schema
pnpm --filter @salonops/database db:generate

# Push schema directly to database
pnpm --filter @salonops/database db:push

# Seed realistic Moroccan salon fixtures (Béni Mellal, Fatima, Salma, Youssef)
pnpm --filter @salonops/database db:seed

# Open Drizzle Studio visual GUI (optional)
pnpm --filter @salonops/database db:studio
```

### 5. Running Development Servers
Start all applications concurrently with Turborepo:
```bash
pnpm dev
```
Or run individual applications:
```bash
# Start Express Backend (http://localhost:4000)
pnpm --filter @salonops/api dev

# Start Staff Mobile App (Expo Metro bundler)
pnpm --filter @salonops/staff-mobile dev

# Start Admin Dashboard (http://localhost:5173)
pnpm --filter @salonops/admin-dashboard dev

# Start Client Booking Web App (http://localhost:5174)
pnpm --filter @salonops/client-web dev
```

---

## 🧪 Testing & Code Quality

```bash
# Typecheck all packages in parallel
pnpm typecheck

# Run linter across all packages
pnpm lint

# Build production bundles
pnpm build
```

---

## 🔄 CI/CD Pipelines

Automated with **GitHub Actions**:
- **[CI Workflow](.github/workflows/ci.yml)**: Triggered on pull requests and pushes to `main` and `develop`. Executes linting, strict typechecking, production builds, Drizzle schema validation, and Docker container tests.
- **[CD Workflow](.github/workflows/cd.yml)**: Triggered on pushes to `main` and version tags (`v*.*.*`). Builds and publishes the API container image to GitHub Container Registry (GHCR), builds and packages web application artifacts, and verifies Expo EAS mobile build readiness.

---

## 📜 Individual Package Documentation

- [`apps/staff-mobile/README.md`](apps/staff-mobile/README.md) — React Native Expo floor application
- [`apps/api/README.md`](apps/api/README.md) — Node.js & Express.js REST API
- [`apps/admin-dashboard/README.md`](apps/admin-dashboard/README.md) — React 19.3 owner analytics & POS
- [`apps/client-web/README.md`](apps/client-web/README.md) — Client web booking interface
- [`packages/database/README.md`](packages/database/README.md) — Drizzle ORM schema & migrations
- [`packages/shared-types/README.md`](packages/shared-types/README.md) — Shared TypeScript domain models & DTOs
- [`packages/config-typescript/README.md`](packages/config-typescript/README.md) — TypeScript configuration presets
- [`packages/config-eslint/README.md`](packages/config-eslint/README.md) — ESLint configuration presets

---

## 🔒 Security & RBAC Policy
- **Stylist Privacy Guard**: Stylists authenticated on mobile can strictly access their own calendar, formulas, and individual commission reports. Salon turnover, gross revenues, and owner margins are strictly restricted to `OWNER` and `MANAGER` roles via backend middleware.
- **Atomic Slot Reservation**: Concurrency collisions on the booking timeline are blocked using Redis Redlock distributed locks.
