# `@salonops/database` 🗄️

> **PostgreSQL 16 database layer powered by Drizzle ORM (`drizzle-orm` + `drizzle-kit` + `postgres`).**

---

## 🌟 Architecture & Schema Design

- **Zero-Overhead Typing**: Schema tables act as single source of truth for both TypeScript models and PostgreSQL relational tables.
- **Strict Multi-Branch Isolation**: All branch-specific records link directly to `branch_id` and `organization_id`.
- **Moroccan Hair Salon Fixtures**: Preloaded with Moroccan test data (Béni Mellal branch, Fatima, Salma, Youssef, services in MAD).

---

## 📁 Directory Structure

```text
packages/database/
├── src/
│   ├── schema/
│   │   ├── organizations.ts     # Multi-tenant organizations table
│   │   ├── branches.ts          # Salon branches (Casablanca, Béni Mellal, etc.)
│   │   ├── users.ts             # Stylists, managers & owners with working hours & days off
│   │   ├── services.ts          # Service catalog (duration, buffer minutes, price MAD)
│   │   ├── clients.ts           # Client CRM, loyalty points & allergy notes
│   │   ├── appointments.ts      # Bookings with buffer end times & statuses
│   │   ├── formulas.ts          # Color formula history (brand, shade ratio, developer, photos)
│   │   ├── transactions.ts      # Cash register transactions (Cash, TPE, tips)
│   │   └── index.ts             # Schema exports barrel
│   ├── index.ts                 # Database connection client & connection pool
│   └── seed.ts                  # Moroccan salon fixture seeder
├── drizzle/                     # Auto-generated SQL migrations
│   └── 0000_*.sql
├── drizzle.config.ts            # Drizzle Kit configuration
├── .env.example                 # Example database environment variables
├── package.json                 # Dependencies & Drizzle CLI scripts
└── tsconfig.json                # TypeScript build config
```

---

## ⚙️ Environment Variables

Create `.env` inside `packages/database/`:
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/salonops"
```

---

## 🛠️ Drizzle Kit Commands

```bash
# 1. Generate new SQL migrations from schema modifications
pnpm --filter @salonops/database db:generate

# 2. Push schema changes directly to the database (development)
pnpm --filter @salonops/database db:push

# 3. Apply pending migration files to the database
pnpm --filter @salonops/database db:migrate

# 4. Seed database with realistic Moroccan salon fixtures
pnpm --filter @salonops/database db:seed

# 5. Open Drizzle Studio web GUI
pnpm --filter @salonops/database db:studio
```

---

## 🧪 Build & Typecheck

```bash
# Compile TypeScript to dist/
pnpm --filter @salonops/database build

# Verify type safety
pnpm --filter @salonops/database typecheck
```
