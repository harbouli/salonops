# `@salonops/shared-types` 📦

> **Shared TypeScript definitions, enums, interfaces, and DTOs consumed across the backend API, Expo mobile app, and web dashboards.**

---

## 🌟 Modules & Contents

- **`enums.ts`**:
  - `Role`: `OWNER`, `MANAGER`, `STYLIST`, `RECEPTIONIST`
  - `AppointmentStatus`: `BOOKED`, `CONFIRMED`, `IN_CHAIR`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
  - `PaymentMethod`: `CASH`, `TPE_CARD`, `SPLIT`
- **`models.ts`**:
  - Domain models for `Organization`, `Branch`, `User`, `Service`, `Appointment`, `HairFormula`, `Client`, `Transaction`.
- **`dtos.ts`**:
  - Request and response transfer objects: `CreateAppointmentDTO`, `CreateHairFormulaDTO`, `LoginRequestDTO`, `AuthResponseDTO`, `TimelineSlotDTO`.

---

## 📁 Directory Structure

```text
packages/shared-types/
├── src/
│   ├── enums.ts                 # Domain enums
│   ├── models.ts                # Relational entities
│   ├── dtos.ts                  # API request/response DTOs
│   └── index.ts                 # Package barrel exports
├── package.json
└── tsconfig.json
```

---

## 🚀 Usage in Workspace

Import anywhere within workspace packages:
```typescript
import { Role, AppointmentStatus, CreateAppointmentDTO } from '@salonops/shared-types';
```

---

## 🧪 Build & Typecheck

```bash
# Build TypeScript declarations
pnpm --filter @salonops/shared-types build

# Typecheck
pnpm --filter @salonops/shared-types typecheck
```
